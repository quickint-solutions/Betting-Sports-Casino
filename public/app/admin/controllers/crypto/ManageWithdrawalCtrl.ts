module intranet.admin {
    export interface IManageWithdrawalScope extends intranet.common.IScopeBase {
        search: any; listNewItems: any[];
    }

    export class ManageWithdrawalCtrl extends intranet.common.ControllerBase<IManageWithdrawalScope>
        implements intranet.common.init.IInit {
        constructor($scope: IManageWithdrawalScope,
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
            //this.$scope.listNewItems.push({
            //    func: () => this.AddEditToken(null),
            //    name: 'Add New Token'
            //});
        }

        private getTokenChain(c: any) { return common.enums.TokenChains[c]; }
        private getStatus(c: any) { return common.enums.CryptoWithdrawalStatus[c]; }


        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = {
                params: params, filters: filters,
                searchQuery: this.$scope.search
            };
            return this.cryptoService.getWithdrawal(model);
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { value: '', key: '', isUi: true };
            this.refreshGrid();
        }

        private viewRequest(item: any): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'View/Update Withdrawal Request';
                modal.data = {};
                angular.copy(item, modal.data);
            }
           
            modal.bodyUrl = this.settings.ThemeName + '/admin/crypto/view-request-modal.html';
            modal.controller = 'viewRequestModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = 'Close';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private removeWallet(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.cryptoService.removeWallet(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        private copyAddress(item) {
            this.commonDataService.copyText(item.address);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied address of " + item.token, 2000);
        }

    }

    angular.module('intranet.admin').controller('manageWithdrawalCtrl', ManageWithdrawalCtrl);
}