var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            angular.module('kt.components')
                .directive('ktClick', ($timeout) => {
                return {
                    restrict: 'A',
                    priority: -1,
                    link: function (scope, elem, attr) {
                        var disabled = false;
                        function onClick(evt) {
                            if (disabled) {
                                evt.preventDefault();
                                evt.stopImmediatePropagation();
                            }
                            else {
                                attr.$set('disabled', true);
                                disabled = true;
                                $timeout(function () {
                                    disabled = false;
                                    attr.$set('disabled', false);
                                }, 2000, false);
                            }
                        }
                        scope.$on('$destroy', function () { elem.off('click', onClick); });
                        elem.on('click', onClick);
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-click-controller.js.map