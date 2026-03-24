var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ActivityCtrl extends intranet.common.ControllerBase {
            constructor($scope, betHistoryService, accountService, $stateParams) {
                super($scope);
                this.betHistoryService = betHistoryService;
                this.accountService = accountService;
                this.$stateParams = $stateParams;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.onlyChild = 'true';
            }
            loadInitialData() {
                this.getUserActivity();
                this.getDWActivity();
                this.getCasinoActivity();
            }
            getUserActivity() {
                this.betHistoryService.getUserActivity(this.$stateParams.memberid)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.actData = response.data.user;
                    }
                });
            }
            getDWActivity() {
                this.accountService.getInOutActivity(this.$stateParams.memberid)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.dwData = response.data.user;
                    }
                });
            }
            getCasinoActivity() {
                this.accountService.getCasinoActivity(this.$stateParams.memberid)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.casinoData = response.data.user;
                    }
                });
            }
        }
        master.ActivityCtrl = ActivityCtrl;
        angular.module('intranet.master').controller('activityCtrl', ActivityCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ActivityCtrl.js.map