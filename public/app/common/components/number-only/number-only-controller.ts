namespace intranet.common.directives {
    angular.module('kt.components')
        .directive('ktNumberOnly', ($animate, $timeout) => {
            return {
                require: 'ngModel',
                link: function (scope, element, attr, ngModelCtrl: any) {
                    function onlynumber(text) {
                        if (text) {
                            var transformedInput = text.replace(/[^0-9]/g, '');

                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                        return undefined;
                    }
                    function withDecimal(text) {
                        if (text) {
                            var transformedInput = text.toString().replace(/^-*\.+$|[^-0-9\.]|^\.+(?!$)|^0+(?=[0-9]+)|\.(?=\.|.+\.)|(?!^)-/g, '');

                            if (attr.positiveOnly) {
                                if (transformedInput < 0) { transformedInput = transformedInput * -1; }
                            }
                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                           
                            return transformedInput;
                        }
                        return undefined;
                    }
                    if (attr.allowDecimal) {
                        ngModelCtrl.$parsers.push(withDecimal);
                    }
                    else {
                        ngModelCtrl.$parsers.push(onlynumber);
                    }
                }
            }
        });
}