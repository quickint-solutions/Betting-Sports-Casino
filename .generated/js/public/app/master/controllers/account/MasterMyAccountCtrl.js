var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class MasterMyAccountCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, $location, settings) {
                super($scope);
                this.commonDataService = commonDataService;
                this.$location = $location;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.fromMaster = true;
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
        master.MasterMyAccountCtrl = MasterMyAccountCtrl;
        angular.module('intranet.master').controller('masterMyAccountCtrl', MasterMyAccountCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MasterMyAccountCtrl.js.map