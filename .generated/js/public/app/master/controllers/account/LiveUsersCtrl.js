var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class LiveUsersCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, modalService, settings, websiteService, tokenService) {
                super($scope);
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.websiteService = websiteService;
                this.tokenService = tokenService;
                this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '' };
                super.init(this);
            }
            loadInitialData() {
                this.$scope.userTypes = [];
                this.fillUserTypes();
            }
            fillUserTypes() {
                this.$scope.userTypes = super.getUserTypes();
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters, searchQuery: this.$scope.search };
                return this.tokenService.getLiveToken(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { Username: '', IpAddress: '', IMEI: '', Device: '', };
                this.refreshGrid();
            }
        }
        master.LiveUsersCtrl = LiveUsersCtrl;
        angular.module('intranet.master').controller('liveUsersCtrl', LiveUsersCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveUsersCtrl.js.map