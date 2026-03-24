namespace intranet.common.directives {
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
}