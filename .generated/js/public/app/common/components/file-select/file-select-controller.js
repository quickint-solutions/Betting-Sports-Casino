var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTFileSelectController extends intranet.common.ControllerBase {
                constructor($scope) {
                    super($scope);
                }
            }
            angular.module('kt.components')
                .controller('KTFileSelectController', KTFileSelectController)
                .directive('ktFileSelect', ($timeout, FileReaderFactory) => {
                return {
                    scope: {
                        ngModel: '='
                    },
                    link: function ($scope, el) {
                        function getFile(file) {
                            FileReaderFactory.readAsDataUrl(file, $scope)
                                .then(function (result) {
                                $timeout(function () {
                                    $scope.ngModel = result;
                                });
                            });
                        }
                        el.bind("change", function (e) {
                            var file = (e.srcElement || e.target).files[0];
                            getFile(file);
                        });
                    },
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=file-select-controller.js.map