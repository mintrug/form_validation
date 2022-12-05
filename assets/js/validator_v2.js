
function Validator (formSelector) {

    // Function that get parent element
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

    // Contain rules
    var formRules = {};

    /**
     * Rule create convention
     * - If there is an error, return an 'errorMessage'
     * - If there is NO error, return 'undefined'
     */
    var validateRules = {
        required: function (inputValue) {
            return inputValue ? undefined : 'Vui lòng nhập trường này';
        },

        email: function (inputValue) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(inputValue) ? undefined : 'Ô này phải là email';
        },

        min: function (minValue) {
            return function (inputValue) {
                return inputValue.length >= minValue ? undefined : `Mật khẩu cần từ ${minValue} kí tự`;
            }
        },
    }

    // Get form element
    var formElement = document.querySelector(formSelector);

    // Only handle validation when the element of DOM valid
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');

        Array.from(inputs).forEach(function (input) {

            // Set up type data for formRules
            var rules = input.getAttribute('rules').split('|');
            rules.forEach(function (rule) {
                var ruleFunc = validateRules[rule];
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validateRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (!Array.isArray(formRules[input.name])) {
                    formRules[input.name] = [ruleFunc];
                } else {
                    formRules[input.name].push(ruleFunc);
                }
                
            });

            // Listen for events and handle validation
            input.onblur = handleValidate;
            input.oninput = handleValidate;

        });

        // console.log(formRules);
        
        // function that does validate
        function handleValidate (event) {
            var inputElement = event.target;
            var rules = formRules[inputElement.name];
            var errorMessage;
            var errorElement = getParentElement(inputElement, '.form-group').querySelector('.form-message');

            rules.find(function (rule) {
                errorMessage = rule(inputElement.value);
                return errorMessage;
            })

            if (errorMessage) {
                errorElement.innerText = errorMessage;
                getParentElement(inputElement, '.form-group').classList.add('invalid');
            } else {
                errorElement.innerText = '';
                getParentElement(inputElement, '.form-group').classList.remove('invalid');
            }
            return errorMessage;
        }

        // Handle submit form
        formElement.onsubmit = function (event) {
            event.preventDefault();

            var isValid = false;

            Array.from(inputs).forEach(function (input) {
                var errorMessage = handleValidate({ target: input });

                if (errorMessage) {
                    isValid = true;
                }
            });

            if (!isValid) {
                console.log("Khong loi");
            }
        }
    }
}