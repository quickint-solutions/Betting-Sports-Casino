var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class SelectOfferModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, settings, isMobile, $state, offerService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.settings = settings;
                this.isMobile = isMobile;
                this.$state = $state;
                this.offerService = offerService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.forSelection = 3;
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.forSelection = this.modalOptions.data.forSelection;
                }
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.loadOffers();
            }
            loadOffers() {
                var promise;
                if (this.$scope.forSelection < 3) {
                    promise = this.offerService.getDepositOfferList();
                }
                else {
                    promise = this.offerService.getOfferList();
                }
                promise.success((response) => {
                    if (response.success) {
                        if (this.$scope.forSelection == 4) {
                            this.$scope.offerList = response.data.filter((a) => { return a.offerOn == intranet.common.enums.OfferOn.OnRegister; });
                        }
                        else {
                            this.$scope.offerList = response.data;
                        }
                    }
                });
            }
            selectOffer(offer) {
                if (offer.bonusCode) {
                    this.$uibModalInstance.close({
                        data: {
                            bonusCode: offer.bonusCode,
                            id: offer.id
                        }, button: intranet.common.services.ModalResult.OK
                    });
                }
            }
            sendToDepositPage() {
                this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                if (this.isMobile.any) {
                    if (this.settings.ThemeName == 'sky') {
                        this.$state.go('mobile.base.transferonline');
                    }
                    else {
                        this.$state.go('mobile.seven.base.transferonline');
                    }
                }
                else {
                    this.$state.go('base.account.transferonline', { tab: 5 });
                }
            }
            sendLogin() {
                this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                this.$rootScope.$broadcast('open-login-modal');
            }
            sendSignup() {
                this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                this.$rootScope.$broadcast('open-register-modal');
            }
        }
        home.SelectOfferModalCtrl = SelectOfferModalCtrl;
        angular.module('intranet.home').controller('selectOfferModalCtrl', SelectOfferModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SelectOfferModalCtrl.js.map