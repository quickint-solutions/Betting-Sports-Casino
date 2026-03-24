var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            angular.module('kt.components')
                .directive('ktAnimateOnChange', ($animate, $timeout, $rootScope, settings) => {
                return {
                    restrict: 'A',
                    link: (scope, elem, attr) => {
                        var startAnimation = ((stop = false) => {
                            var deregister = scope.$watch(attr.ktAnimateOnChange, function (nv, ov) {
                                if (settings.ThemeName == 'dimd2') {
                                    if (nv != ov && ov) {
                                        var c = nv > ov ? 'odds-up' : 'odds-down';
                                        $animate.addClass(elem, c).then(function () {
                                            $timeout(function () { $animate.removeClass(elem, c); });
                                        });
                                    }
                                }
                                else {
                                    if (nv != ov) {
                                        var c = 'swap-animation';
                                        $animate.addClass(elem, c).then(function () {
                                            $timeout(function () { $animate.removeClass(elem, c); });
                                        });
                                    }
                                }
                                if ($rootScope.highlightOnOddsChange == false) {
                                    deregister();
                                }
                                if (stop) {
                                    deregister();
                                }
                            });
                        });
                        var watchOnRoot = scope.$watch('$root.highlightOnOddsChange', function (nv, ov) {
                            if (nv == true) {
                                startAnimation();
                            }
                        });
                        scope.$on('$destroy', () => {
                            startAnimation(true);
                            watchOnRoot();
                        });
                    }
                };
            });
            angular.module('kt.components')
                .directive('ktFlipCoinOnChange', ($animate, $timeout, $rootScope) => {
                return {
                    restrict: 'A',
                    link: (scope, elem, attr) => {
                        var startAnimation = ((stop = false) => {
                            var deregister = scope.$watch(attr.ktFlipCoinOnChange, function (nv, ov) {
                                if (nv != ov) {
                                    var c = 'spin-coin';
                                    $animate.addClass(elem, c).then(function () {
                                        $timeout(function () { $animate.removeClass(elem, c); }, 3000);
                                    });
                                }
                                if (stop) {
                                    deregister();
                                }
                            });
                        });
                        startAnimation();
                        scope.$on('$destroy', () => {
                            startAnimation(true);
                        });
                    }
                };
            })
                .directive('ktChangeColor', ($animate, $timeout) => {
                return {
                    restrict: 'A',
                    link: (scope, elem, attr) => {
                        var startChangeColor = scope.$watch(attr.ktChangeColor, function (nv, ov) {
                            var c = nv == ov ? 'tradex-stable' : (nv > ov ? 'tradex-green' : 'tradex-red');
                            elem.attr('class', c);
                        });
                        scope.$on('$destroy', () => {
                            startChangeColor();
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=animate-on-change-controller.js.map