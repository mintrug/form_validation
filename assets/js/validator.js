
// Đối tượng Validator
function Validator (options) {

    var selectorRule = {};

    // Hàm lấy parent element
    function getParentElement (element, selector) {
        while (element) {
            var isParentElement = element.parentElement.matches(selector);
            if (isParentElement) {
                return element.parentElement;
            } else {
                element = element.parentElement;
            }
        }
    }

    function validate (inputElement, rule) {
        var errorMessage;
        var errorElement = getParentElement(inputElement, options.form_group).querySelector(options.errorSelector);
        var rules = selectorRule[rule.selector];

        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParentElement(inputElement, options.form_group).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParentElement(inputElement, options.form_group).classList.remove('invalid');
        }

        return !!errorMessage;
    }
    
    // Lấy element của form
    var formElement = document.querySelector(options.form);
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = false;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (isValid) {
                    isFormValid = true;
                }
            });

            if (!isFormValid) {
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        default:
                            values[input.name] = input.value
                    }
                    
                    return values;
                }, {});

                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    options.onSubmit(formValues);
                }

                // Trường hợp submit mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
        options.rules.forEach(function (rule) {
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lý khi người dùng blur ra khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                // Xử lý khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParentElement(inputElement, options.form_group).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParentElement(inputElement, options.form_group).classList.remove('invalid');
                }
            })

            // Lưu rule cho mỗi input
            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test);
            } else {
                selectorRule[rule.selector] = [rule.test];
            }
        });
    }
}

Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập ô này';
        },
    }
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Ô này phải là email';
        },
    }
}

Validator.isPassword = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : 'Nhập mật khẩu mạnh hơn';
        },
    }
}

Validator.isConfirmed = function (selector, getConfirmValue) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : 'Giá trị nhập chưa đúng';
        },
    }
}