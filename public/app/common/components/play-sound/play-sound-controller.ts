namespace intranet.common.directives {

    angular.module('kt.components')
        .directive('ktPlaySound', ($timeout, $rootScope) => {
            return {
                restrict: 'A',
                scope: {
                    soundName: '@'
                },
                priority: -1,
                link: function (scope, elem, attr: any) {


                    function onMouseEnter(evt) {
                        if ($rootScope.playSound == false) { elem.off('mouseenter', onMouseEnter); }
                        else {
                            var audio: any = jQuery('#' + scope.soundName)[0];
                            audio.play();
                        }
                    }

                    var watchOnRoot = scope.$watch('$root.playSound', function (nv, ov) {
                        if (nv == true) {
                            elem.on('mouseenter', onMouseEnter);
                        }
                    });

                    scope.$on('$destroy', () => {
                        watchOnRoot();
                        elem.off('mouseenter', onMouseEnter);
                    });

                    //scope.$on('$destroy', function () { elem.off('mouseenter', onMouseEnter); });
                    elem.on('mouseenter', onMouseEnter);
                }
            };
        });
}