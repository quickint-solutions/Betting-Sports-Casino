namespace intranet.common.directives {
    angular.module('kt.components')
        .directive('ktFileModel', ($parse) => {
            return {
                restrict: 'A',
                link: function (scope, element, attrs: any) {
                    var model = $parse(attrs.ktFileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            }
        });
        
}