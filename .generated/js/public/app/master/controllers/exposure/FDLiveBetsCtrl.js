var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class FDLiveBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, fdService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.fdService = fdService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
                this.loadButtonItems();
            }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.refreshData(),
                    name: 'Refresh Data',
                    cssClass: 'fa fa-refresh'
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.fdService.getRunningFDExposure(model);
            }
            refreshData() {
                this.$scope.$broadcast('refreshGrid');
            }
            getProvider(provider) {
                return intranet.common.enums.TableProvider[provider];
            }
        }
        master.FDLiveBetsCtrl = FDLiveBetsCtrl;
        angular.module('intranet.master').controller('fDLiveBetsCtrl', FDLiveBetsCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FDLiveBetsCtrl.js.map