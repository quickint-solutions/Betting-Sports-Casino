module intranet.admin {
    export interface IAddPaymentModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
        request: any;
    }

    export class AddPaymentModalCtrl extends intranet.common.ControllerBase<IAddPaymentModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddPaymentModalScope,
            private websiteService: services.WebsiteService,
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
            this.$scope.data = {};

            this.$scope.request = { isEnabledSkrill: false, isEnabledNeteller: false, isEnabledCrypto: false, isEnabledPinWallet: false, isEnabledGameOkCrypto: false, isEnabledPaymor: false };
            this.$scope.request.pinWallet = { minDeposit: 0, maxDeposit: 0, username: '', authKey: '' };
            this.$scope.request.skrill = { merchantId: '', secret: '', apiPassword: '', payInUrl: '', merchantEmail: '', statusUrl: '', minDeposit: 0, maxDeposit: 0, minWithdrwal: 0, maxWithdrwal: 0 };
            this.$scope.request.neteller = { clientKey: '', clientSecret: '', currencyCode: '', street: '', city: '', zip: '', country: '', state: '', minDeposit: 0, maxDeposit: 0, minWithdrwal: 0, maxWithdrwal: 0 };
            this.$scope.request.nowPayment = { baseCurrency: '', fixedRate: false, isFeePaidByUser: false, apiKey: '', ipnApiKey: '', callbackUrl: '', minDeposit: '', maxDeposit: '' }
            this.$scope.request.gameOkCrypto = { minDeposit: 0, maxDeposit: 0, minWithdrwal: 0, maxWithdrwal: 0, appId: '', apiKey: '', secret: '' };
            this.$scope.request.offlinePaymentConfig = { minDeposit: 0, maxDeposit: 0, minWithdrwal: 0, maxWithdrwal: 0 }
            this.$scope.request.paymor = { minDeposit: 0, maxDeposit: 0, minWithdrawal: 0, maxWithdrawal: 0, merchantId: '', saltKey: '', secretKey: '', allowWithdrawal: false, autoWithdrawalUpTo: 0, clientId: '', withdrawalRegMobile: '', withdrawalSecretKey: '' };

            if (this.modalOptions.data) { this.$scope.data = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.savePaymentData();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            if (this.$scope.data.websiteId) {
                this.$scope.request.websiteId = this.$scope.data.websiteId;
                this.websiteService.getPaymentDetails(this.$scope.data.websiteId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            if (response.data) {
                                this.$scope.request.enableNotification = response.data.enableNotification;
                                this.$scope.request.channelName = response.data.channelName;
                                this.$scope.request.botApiKey = response.data.botApiKey;
                                this.$scope.request.isEnabledCrypto = response.data.isEnabledCrypto;
                                if (response.data.nowPayment) {
                                    this.$scope.request.nowPayment.fixedRate = response.data.nowPayment.fixedRate;
                                    this.$scope.request.nowPayment.isFeePaidByUser = response.data.nowPayment.isFeePaidByUser;
                                    this.$scope.request.nowPayment.baseCurrency = response.data.nowPayment.baseCurrency;
                                    this.$scope.request.nowPayment.apiKey = response.data.nowPayment.apiKey;
                                    this.$scope.request.nowPayment.ipnApiKey = response.data.nowPayment.ipnApiKey;
                                    this.$scope.request.nowPayment.callbackUrl = response.data.nowPayment.callbackUrl;
                                    this.$scope.request.nowPayment.minDeposit = response.data.nowPayment.minDeposit;
                                    this.$scope.request.nowPayment.maxDeposit = response.data.nowPayment.maxDeposit;
                                }

                                this.$scope.request.isEnabledSkrill = response.data.isEnabledSkrill;
                                if (response.data.skrill) {
                                    this.$scope.request.skrill.merchantId = response.data.skrill.merchantId;
                                    this.$scope.request.skrill.secret = response.data.skrill.secret;
                                    this.$scope.request.skrill.apiPassword = response.data.skrill.apiPassword;
                                    this.$scope.request.skrill.payInUrl = response.data.skrill.payInUrl;
                                    this.$scope.request.skrill.merchantEmail = response.data.skrill.merchantEmail;
                                    this.$scope.request.skrill.statusUrl = response.data.skrill.statusUrl;
                                    this.$scope.request.skrill.minDeposit = response.data.skrill.minDeposit;
                                    this.$scope.request.skrill.maxDeposit = response.data.skrill.maxDeposit;
                                    this.$scope.request.skrill.minWithdrwal = response.data.skrill.minWithdrwal;
                                    this.$scope.request.skrill.maxWithdrwal = response.data.skrill.maxWithdrwal;
                                }

                                this.$scope.request.isEnabledNeteller = response.data.isEnabledNeteller;
                                if (response.data.neteller) {
                                    this.$scope.request.neteller.clientKey = response.data.neteller.clientKey;
                                    this.$scope.request.neteller.clientSecret = response.data.neteller.clientSecret;
                                    this.$scope.request.neteller.currencyCode = response.data.neteller.currencyCode;
                                    this.$scope.request.neteller.street = response.data.neteller.street;
                                    this.$scope.request.neteller.city = response.data.neteller.city;
                                    this.$scope.request.neteller.zip = response.data.neteller.zip;
                                    this.$scope.request.neteller.country = response.data.neteller.country;
                                    this.$scope.request.neteller.state = response.data.neteller.state;
                                    this.$scope.request.neteller.currencyBaseUnitsMultiplier = response.data.neteller.currencyBaseUnitsMultiplier;
                                    this.$scope.request.neteller.minDeposit = response.data.neteller.minDeposit;
                                    this.$scope.request.neteller.maxDeposit = response.data.neteller.maxDeposit;
                                    this.$scope.request.neteller.minWithdrwal = response.data.neteller.minWithdrwal;
                                    this.$scope.request.neteller.maxWithdrwal = response.data.neteller.maxWithdrwal;
                                }

                                this.$scope.request.isEnabledPinWallet = response.data.isEnabledPinWallet;
                                if (response.data.pinWallet) {
                                    this.$scope.request.pinWallet.minDeposit = response.data.pinWallet.minDeposit;
                                    this.$scope.request.pinWallet.maxDeposit = response.data.pinWallet.maxDeposit;
                                    this.$scope.request.pinWallet.username = response.data.pinWallet.username;
                                    this.$scope.request.pinWallet.authKey = response.data.pinWallet.authKey;
                                }

                                this.$scope.request.isEnabledGameOkCrypto = response.data.isEnabledGameOkCrypto;
                                if (response.data.gameOkCrypto) {
                                    this.$scope.request.gameOkCrypto.minDeposit = response.data.gameOkCrypto.minDeposit;
                                    this.$scope.request.gameOkCrypto.maxDeposit = response.data.gameOkCrypto.maxDeposit;
                                    this.$scope.request.gameOkCrypto.minWithdrwal = response.data.gameOkCrypto.minWithdrwal;
                                    this.$scope.request.gameOkCrypto.maxWithdrwal = response.data.gameOkCrypto.maxWithdrwal;
                                    this.$scope.request.gameOkCrypto.appId = response.data.gameOkCrypto.appId;
                                    this.$scope.request.gameOkCrypto.apiKey = response.data.gameOkCrypto.apiKey;
                                    this.$scope.request.gameOkCrypto.secret = response.data.gameOkCrypto.secret;
                                }

                                if (response.data.offlinePaymentConfig) {
                                    this.$scope.request.offlinePaymentConfig.minDeposit = response.data.offlinePaymentConfig.minDeposit;
                                    this.$scope.request.offlinePaymentConfig.maxDeposit = response.data.offlinePaymentConfig.maxDeposit;
                                    this.$scope.request.offlinePaymentConfig.minWithdrwal = response.data.offlinePaymentConfig.minWithdrwal;
                                    this.$scope.request.offlinePaymentConfig.maxWithdrwal = response.data.offlinePaymentConfig.maxWithdrwal;
                                }

                                this.$scope.request.isEnabledPaymor = response.data.isEnabledPaymor;
                                if (response.data.paymor) {
                                    this.$scope.request.paymor.minDeposit = response.data.paymor.minDeposit;
                                    this.$scope.request.paymor.maxDeposit = response.data.paymor.maxDeposit;
                                    this.$scope.request.paymor.minWithdrawal = response.data.paymor.minWithdrawal;
                                    this.$scope.request.paymor.maxWithdrawal = response.data.paymor.maxWithdrawal;
                                    this.$scope.request.paymor.merchantId = response.data.paymor.merchantId;
                                    this.$scope.request.paymor.saltKey = response.data.paymor.saltKey;
                                    this.$scope.request.paymor.secretKey = response.data.paymor.secretKey;

                                    this.$scope.request.paymor.allowWithdrawal = response.data.paymor.allowWithdrawal;
                                    this.$scope.request.paymor.autoWithdrawalUpTo = response.data.paymor.autoWithdrawalUpTo;
                                    this.$scope.request.paymor.clientId = response.data.paymor.clientId;
                                    this.$scope.request.paymor.withdrawalRegMobile = response.data.paymor.withdrawalRegMobile;
                                    this.$scope.request.paymor.withdrawalSecretKey = response.data.paymor.withdrawalSecretKey;
                                }
                            }
                        }
                    });
            }
        }

        private savePaymentData(): void {
            var promise;

            promise = this.websiteService.updatePaymentDetails(this.$scope.request);

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


    angular.module('intranet.admin').controller('addPaymentModalCtrl', AddPaymentModalCtrl);
}