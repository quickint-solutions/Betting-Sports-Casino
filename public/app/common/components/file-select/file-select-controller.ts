namespace intranet.common.directives {
    export interface IktFileSelectScope extends intranet.common.IScopeBase {
        ngModel: any;
    }

    class KTFileSelectController extends intranet.common.ControllerBase<IktFileSelectScope> {
        constructor($scope: IktFileSelectScope) {
            super($scope);

        }
    }
    angular.module('kt.components')
        .controller('KTFileSelectController', KTFileSelectController)
        .directive('ktFileSelect', ($timeout, FileReaderFactory: any) => {
            return {
                scope: {
                    ngModel: '='
                },
                link: function ($scope: IktFileSelectScope, el) {
                    function getFile(file) {
                        FileReaderFactory.readAsDataUrl(file, $scope)
                            .then(function (result) {
                                $timeout(function () {
                                    $scope.ngModel = result;
                                });
                            });
                    }
                    el.bind("change", function (e:any) {
                        var file: any = (e.srcElement || e.target).files[0];
                        getFile(file);
                    });

                },
            }
        });
   
}