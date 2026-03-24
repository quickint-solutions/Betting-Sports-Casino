var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTDateDiffController extends common.ControllerBase {
                constructor($scope, $interval, $filter, settings) {
                    super($scope);
                    this.$interval = $interval;
                    this.$filter = $filter;
                    this.$scope.showIcon = true;
                    this.$scope.isFairTrade = 'false';
                    var diffWatcher = this.$interval(() => { this.calcDiff(); }, 1000);
                    this.$scope.$on('$destroy', () => {
                        this.$interval.cancel(diffWatcher);
                    });
                }
                calcDiff() {
                    if (this.$scope.market && this.$scope.field && this.$scope.isFairTrade == 'false') {
                        if (this.$scope.market[this.$scope.field]) {
                            var stardate = this.$scope.market[this.$scope.field];
                            if (this.$scope.market.betOpenTime) {
                                var diffmin = moment(this.$scope.market.betOpenTime).diff(stardate, 'minutes');
                                stardate = moment(stardate).add(diffmin, 'minutes');
                            }
                            this.$scope.market.datediff = this.$filter('dateDiff')(stardate);
                        }
                    }
                    else if (this.$scope.market && this.$scope.field && this.$scope.isFairTrade == 'true') {
                        var stardate = moment(this.$scope.market[this.$scope.field]);
                        this.$scope.market.datediff = this.$filter('dateDiffTime')(stardate);
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTDateDiffController', KTDateDiffController);
            angular.module('kt.components')
                .directive('ktDateDiff', () => {
                return {
                    restrict: 'EA',
                    scope: {
                        market: '=',
                        field: '@',
                        showIcon: '@?',
                        isFairTrade: '@?'
                    },
                    templateUrl: 'app/common/components/kt-date-diff/kt-date-diff.html',
                    controller: 'KTDateDiffController',
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-date-diff-controller.js.map