module intranet.admin {

    export interface IAddBetfairAccountModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        account: any;
        accountTypeList: any[];
        websites: any[];
    }

    export class AddBetfairAccountModalCtrl extends intranet.common.ControllerBase<IAddBetfairAccountModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddBetfairAccountModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private betfairService: services.BetfairService,
            private websiteService: services.WebsiteService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.websites = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.account = {};
            if (this.modalOptions.data) {
                this.$scope.account = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveBetfairAccount();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadWebsites();
            var accountType: any = common.enums.BetfairAccountType;
            this.$scope.accountTypeList = common.helpers.Utility.enumToArray<common.enums.BetfairAccountType>(accountType);
            if (this.$scope.account && this.$scope.account.betfairAccountType) {
                this.$scope.account.betfairAccountType = this.$scope.account.betfairAccountType.toString();
            } else { this.$scope.account.betfairAccountType = this.$scope.accountTypeList[0].id.toString(); }
        }

        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.filter((w: any) => { return w.isBetfair; });
                        this.$scope.websites.splice(0, 0, { id: '', name: '--Select Website--' });
                    }
                });
        }

        private saveBetfairAccount(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.account.id) {
                promise = this.betfairService.updateBetfairAccount(this.$scope.account)
            }
            else {
                promise = this.betfairService.addBetfairAccount(this.$scope.account);
            }
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }
    angular.module('intranet.admin').controller('addBetfairAccountModalCtrl', AddBetfairAccountModalCtrl);
}