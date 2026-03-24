module intranet.admin {
    export interface IAddCountryModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
        supportedChannelList: any[];
        oTPProviderList: any[];
    }

    export class AddCountryModalCtrl extends intranet.common.ControllerBase<IAddCountryModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddCountryModalScope,
            private settingService: services.SettingService,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.data = { provider: common.enums.OTPProvider.NXCloud.toString(), supportedChannel: common.enums.SupportedChannel.SMS.toString() };
            if (this.modalOptions.data) {
                this.$scope.data = this.modalOptions.data;
                if (this.$scope.data.provider) { this.$scope.data.provider = this.$scope.data.provider.toString(); }
                if (this.$scope.data.supportedChannel) { this.$scope.data.supportedChannel = this.$scope.data.supportedChannel.toString(); }
            }

            this.$scope.modalOptions.ok = result => {
                this.saveCurrencyData();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.fillDropdown();
        }

        private fillDropdown() {

            var SupportedChannel: any = common.enums.SupportedChannel;
            this.$scope.supportedChannelList = common.helpers.Utility.enumToArray<common.enums.SupportedChannel>(SupportedChannel);
            this.$scope.supportedChannelList.splice(0, 0, { id: -1, name: '-- Select Channel --' });

            var OTPProvider: any = common.enums.OTPProvider;
            this.$scope.oTPProviderList = common.helpers.Utility.enumToArray<common.enums.OTPProvider>(OTPProvider);
            this.$scope.oTPProviderList.splice(0, 0, { id: -1, name: '-- Select OTP Prover --' });

        }

        private saveCurrencyData(): void {
            var promise;
            if (this.$scope.data.id) {
                promise = this.settingService.updateCountry(this.$scope.data);
            }
            else {
                promise = this.settingService.addCountry(this.$scope.data);
            }
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


    angular.module('intranet.admin').controller('addCountryModalCtrl', AddCountryModalCtrl);
}