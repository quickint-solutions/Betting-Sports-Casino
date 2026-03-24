module intranet.admin {

    export interface IBetfairAccountScope extends intranet.common.IScopeBase {
    }

    export class BetfairAccountCtrl extends intranet.common.ControllerBase<IBetfairAccountScope>
    {
        constructor($scope: IBetfairAccountScope,
            private modalService: common.services.ModalService,
            private toasterService: common.services.ToasterService,
            private settings: common.IBaseSettings,
            private betfairService: services.BetfairService) {
            super($scope);
        }

        private addEditBetfairAccount(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.betfairaccount.edit.modal.header';
                modal.data = {
                    id: item.id,
                    username: item.username,
                    password: item.password,
                    balance: item.balance,
                    isActive: item.isActive,
                    betfairAccountType: item.betfairAccountType,
                    appKey: item.appKey,
                    websiteId: item.websiteId
                };
            }
            else {
                modal.header = 'admin.betfairaccount.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/add-betfair-account-modal.html';
            modal.controller = 'addBetfairAccountModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private deleteBetfairAccount(id: any): void {
            this.betfairService.deleteBetfairAccount(id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
        }

        private getBetfairAccountType(accountType: any): any {
            return common.enums.BetfairAccountType[accountType];
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.betfairService.getBetfairAccountList(model);
        }
    }

    angular.module('intranet.admin').controller('betfairAccountCtrl', BetfairAccountCtrl);
}