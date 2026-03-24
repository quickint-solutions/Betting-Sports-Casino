var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            angular.module('kt.components')
                .directive('ktToolbar', () => {
                return {
                    controller: function () { },
                    restrict: 'EA',
                    transclude: true,
                    replace: true,
                    templateUrl: 'app/common/components/toolbar/toolbar/toolbar.html'
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=toolbar-controller.js.map