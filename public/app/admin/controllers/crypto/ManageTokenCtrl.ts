module intranet.admin {
    export interface IManageTokenScope extends intranet.common.IScopeBase {
        search: any; listNewItems: any[];
    }

    export class ManageTokenCtrl extends intranet.common.ControllerBase<IManageTokenScope>
        implements intranet.common.init.IInit {
        constructor($scope: IManageTokenScope,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $q: ng.IQService, private cryptoService: services.CryptoService) {
            super($scope);



            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = { value: '', key: '', isUi: true };
            this.$scope.listNewItems = [];
        }

        public loadInitialData(): void { this.loadButtonItems(); }

        private loadButtonItems(): void {
            this.$scope.listNewItems.push({
                func: () => this.AddEditToken(null),
                name: 'Add New Token'
            });
        }

        private getTokenChain(c: any) { return common.enums.TokenChains[c]; }
        private getTokenHas(c: any) { return common.enums.TokenHas[c]; }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = {
                params: params, filters: filters,
                searchQuery: this.$scope.search
            };
            return this.cryptoService.getCryptoToken(model);
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { value: '', key: '', isUi: true };
            this.refreshGrid();
        }

        private AddEditToken(item: any): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'Edit Token';
                modal.data = {};
                angular.copy(item, modal.data);
                if (!item.address) { item.address = '' };
            }
            else {
                modal.data = { address: '' };
                modal.header = 'Add Token';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/crypto/add-token-modal.html';
            modal.controller = 'addTokenModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private copyAddress(item) {
            this.commonDataService.copyText(item.address);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied address of " + item.token, 2000);
        }

    }

    angular.module('intranet.admin').controller('manageTokenCtrl', ManageTokenCtrl);
}