namespace intranet.common.directives {
    angular.module('kt.components')
        .directive('ktAnimateOnChange', ($animate, $timeout, $rootScope, settings: common.IBaseSettings) => {
            return {
                restrict: 'A',
                link: (scope, elem, attr: any) => {

                    var startAnimation = ((stop: boolean = false) => {
                        var deregister = scope.$watch(attr.ktAnimateOnChange, function (nv, ov) {
                            if (settings.ThemeName == 'dimd2') {
                                if (nv != ov && ov) {
                                    var c = nv > ov ? 'odds-up' : 'odds-down';
                                    $animate.addClass(elem, c).then(function () {
                                        $timeout(function () { $animate.removeClass(elem, c); });
                                    });
                                }
                            } else {
                                if (nv != ov) {
                                    var c = 'swap-animation';
                                    $animate.addClass(elem, c).then(function () {
                                        $timeout(function () { $animate.removeClass(elem, c); });
                                    });
                                }
                            }

                            if ($rootScope.highlightOnOddsChange == false) { deregister(); }
                            if (stop) { deregister(); }
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
            }
        })

    angular.module('kt.components')
        .directive('ktFlipCoinOnChange', ($animate, $timeout, $rootScope) => {
            return {
                restrict: 'A',
                link: (scope, elem, attr: any) => {

                    var startAnimation = ((stop: boolean = false) => {
                        var deregister = scope.$watch(attr.ktFlipCoinOnChange, function (nv, ov) {
                            if (nv != ov) {
                                var c = 'spin-coin';
                                $animate.addClass(elem, c).then(function () {
                                    $timeout(function () { $animate.removeClass(elem, c); }, 3000);
                                });
                            }

                            if (stop) { deregister(); }
                        });
                    });

                    startAnimation();

                    scope.$on('$destroy', () => {
                        startAnimation(true);
                    });
                }
            }
        })

        .directive('ktChangeColor', ($animate, $timeout) => {
            return {
                restrict: 'A',
                link: (scope, elem, attr: any) => {

                    var startChangeColor = scope.$watch(attr.ktChangeColor, function (nv, ov) {
                        //if (nv != ov) {
                        var c = nv == ov ? 'tradex-stable' : (nv > ov ? 'tradex-green' : 'tradex-red');
                        elem.attr('class', c);

                        // }
                    });


                    scope.$on('$destroy', () => {
                        startChangeColor();
                    });
                }
            }
        });
}