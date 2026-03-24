namespace intranet.common.directives {

    angular.module('kt.components')
        .directive('ktClick', ($timeout) => {
            return {
                restrict: 'A',
                priority: -1,
                link: function (scope, elem, attr: any) {
                    var disabled = false;

                    function onClick(evt) {
                        if (disabled) {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                        } else {
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
}