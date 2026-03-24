module intranet.home {
    export interface ISelectOfferModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        forSelection: any;// 1=from deposit, 2=from base, 3=from promo, 4=from registration

        offerList: any;
    }

    export class SelectOfferModalCtrl extends intranet.common.ControllerBase<ISelectOfferModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ISelectOfferModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private settings: common.IBaseSettings,
            private isMobile: any,
            private $state: any,
            private offerService: services.OfferService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.forSelection = 3;
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) {
                this.$scope.forSelection = this.modalOptions.data.forSelection;
            }

            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.loadOffers();
        }

        private loadOffers() {
            var promise: any;
            if (this.$scope.forSelection < 3) {
                promise = this.offerService.getDepositOfferList();
            } else {
                promise = this.offerService.getOfferList();
            }

            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (this.$scope.forSelection == 4) {
                        this.$scope.offerList = response.data.filter((a: any) => { return a.offerOn == common.enums.OfferOn.OnRegister; });
                    } else {
                        this.$scope.offerList = response.data;
                    }
                }
            });
        }

        public selectOffer(offer: any): void {
            if (offer.bonusCode) {
                this.$uibModalInstance.close({
                    data: {
                        bonusCode: offer.bonusCode,
                        id: offer.id
                    }, button: common.services.ModalResult.OK
                });
            }
        }

        private sendToDepositPage() {
            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            if (this.isMobile.any) {
                if (this.settings.ThemeName == 'sky') {
                    this.$state.go('mobile.base.transferonline');
                } else {
                    this.$state.go('mobile.seven.base.transferonline');
                }
            } else {
                this.$state.go('base.account.transferonline', { tab: 5 });
            }
        }

        private sendLogin() {
            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            this.$rootScope.$broadcast('open-login-modal');
        }
        private sendSignup() {
            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            this.$rootScope.$broadcast('open-register-modal');
        }
    }

    angular.module('intranet.home').controller('selectOfferModalCtrl', SelectOfferModalCtrl);
}