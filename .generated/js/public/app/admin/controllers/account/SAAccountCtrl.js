var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAAccountCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, $location) {
                super($scope);
                this.commonDataService = commonDataService;
                this.$location = $location;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.fromMember = false;
            }
            loadInitialData() {
                this.getUserData();
            }
            isActive(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
            }
            getUserData() {
                this.$scope.user = this.commonDataService.getLoggedInUserData();
            }
        }
        admin.SAAccountCtrl = SAAccountCtrl;
        angular.module('intranet.admin').controller('sAAccountCtrl', SAAccountCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAAccountCtrl.js.map