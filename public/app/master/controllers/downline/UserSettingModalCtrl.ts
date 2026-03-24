module intranet.master {
    export interface IUserSettingModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        data: any;
        userId: any;
    }

    export class UserSettingModalCtrl extends intranet.common.ControllerBase<IUserSettingModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IUserSettingModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private $filter: any,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.data = {};
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.userId = this.modalOptions.data.userId;
            }
            this.$scope.modalOptions.extraClick = result => {
                this.saveSettings(true);
            };
            this.$scope.modalOptions.ok = result => {
                this.saveSettings();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            if (this.$scope.userId) {
                this.userService.getReferralSetting(this.$scope.userId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.data = response.data;
                            this.$scope.data.userId = this.$scope.userId;
                            this.$scope.data.minDeposit = this.$filter('toRateOnly')(response.data.minDeposit);
                            this.$scope.data.minWithdrawalAmount = this.$filter('toRateOnly')(response.data.minWithdrawalAmount);
                            this.$scope.data.minimumBalanceRequired = this.$filter('toRateOnly')(response.data.minimumBalanceRequired);
                        }
                    });
            }
        }

        private saveSettings(applyToAll: boolean = false): void {
            var promise: ng.IHttpPromise<any>;
            this.$scope.data.applyAll = applyToAll;
            var item: any = {};
            angular.copy(this.$scope.data, item);
            item.minDeposit = this.$filter('toGLC')(item.minDeposit);
            item.minWithdrawalAmount = this.$filter('toGLC')(item.minWithdrawalAmount);
            item.minimumBalanceRequired = this.$filter('toGLC')(item.minimumBalanceRequired);

            promise = this.userService.updateReferralSetting(item);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                }
                else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }

    angular.module('intranet.master').controller('userSettingModalCtrl', UserSettingModalCtrl);
}