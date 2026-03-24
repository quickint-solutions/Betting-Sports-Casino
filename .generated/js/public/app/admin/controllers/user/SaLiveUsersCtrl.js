var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SaLiveUsersCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, modalService, settings, websiteService, tokenService) {
                super($scope);
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.websiteService = websiteService;
                this.tokenService = tokenService;
                this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '', websiteId: '', loginMax: '' };
                super.init(this);
            }
            loadInitialData() {
                this.$scope.websites = [];
                this.$scope.userTypes = [];
                this.fillUserTypes();
                this.loadWebsites();
            }
            loadWebsites() {
                this.websiteService.getWebsites()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        this.$scope.websites.splice(0, 0, { id: '-1', name: 'All' });
                        this.$scope.search.websiteId = '-1';
                    }
                });
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
                var search = {};
                angular.copy(this.$scope.search, search);
                if (this.$scope.search.websiteId == '-1') {
                    search.websiteId = '';
                }
                var model = { params: params, filters: filters, searchQuery: search };
                return this.tokenService.getLiveToken(model);
            }
            removeToken(item) {
                this.tokenService.deleteTokenById(item.userId)
                    .success((response) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '', websiteId: '-1', loginMax: '' };
                this.refreshGrid();
            }
        }
        admin.SaLiveUsersCtrl = SaLiveUsersCtrl;
        angular.module('intranet.admin').controller('saLiveUsersCtrl', SaLiveUsersCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SaLiveUsersCtrl.js.map