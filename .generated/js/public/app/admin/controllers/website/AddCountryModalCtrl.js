var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddCountryModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, settingService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.settingService = settingService;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.data = { provider: intranet.common.enums.OTPProvider.NXCloud.toString(), supportedChannel: intranet.common.enums.SupportedChannel.SMS.toString() };
                if (this.modalOptions.data) {
                    this.$scope.data = this.modalOptions.data;
                    if (this.$scope.data.provider) {
                        this.$scope.data.provider = this.$scope.data.provider.toString();
                    }
                    if (this.$scope.data.supportedChannel) {
                        this.$scope.data.supportedChannel = this.$scope.data.supportedChannel.toString();
                    }
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveCurrencyData();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.fillDropdown();
            }
            fillDropdown() {
                var SupportedChannel = intranet.common.enums.SupportedChannel;
                this.$scope.supportedChannelList = intranet.common.helpers.Utility.enumToArray(SupportedChannel);
                this.$scope.supportedChannelList.splice(0, 0, { id: -1, name: '-- Select Channel --' });
                var OTPProvider = intranet.common.enums.OTPProvider;
                this.$scope.oTPProviderList = intranet.common.helpers.Utility.enumToArray(OTPProvider);
                this.$scope.oTPProviderList.splice(0, 0, { id: -1, name: '-- Select OTP Prover --' });
            }
            saveCurrencyData() {
                var promise;
                if (this.$scope.data.id) {
                    promise = this.settingService.updateCountry(this.$scope.data);
                }
                else {
                    promise = this.settingService.addCountry(this.$scope.data);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.AddCountryModalCtrl = AddCountryModalCtrl;
        angular.module('intranet.admin').controller('addCountryModalCtrl', AddCountryModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddCountryModalCtrl.js.map