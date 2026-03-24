namespace intranet.common.directives {

    export interface IKTDateDiffScope extends common.IScopeBase {
        market: any;
        field: any;
        showIcon: boolean;
        isFairTrade: any;
    }

    class KTDateDiffController extends ControllerBase<IKTDateDiffScope>
    {
        constructor($scope: IKTDateDiffScope,
            private $interval: ng.IIntervalService,
            private $filter: any,
            settings: common.IBaseSettings) {
            super($scope);
            this.$scope.showIcon = true;
            this.$scope.isFairTrade = 'false';
            var diffWatcher = this.$interval(() => { this.calcDiff() }, 1000);
            this.$scope.$on('$destroy', () => {
                this.$interval.cancel(diffWatcher);
            });
        }

        private calcDiff(): void {
            if (this.$scope.market && this.$scope.field && this.$scope.isFairTrade == 'false') {
                if (this.$scope.market[this.$scope.field]) {
                    var stardate = this.$scope.market[this.$scope.field];
                    if (this.$scope.market.betOpenTime) {
                        var diffmin = moment(this.$scope.market.betOpenTime).diff(stardate, 'minutes');
                        stardate = moment(stardate).add(diffmin, 'minutes');
                    }
                    this.$scope.market.datediff = this.$filter('dateDiff')(stardate);
                }
            } else if (this.$scope.market && this.$scope.field && this.$scope.isFairTrade == 'true') {
                var stardate: any = moment(this.$scope.market[this.$scope.field]);
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
}