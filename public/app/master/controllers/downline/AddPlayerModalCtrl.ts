module intranet.master {
    export interface IAddPlayerModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        player: any;
        currencyList: any[];
    }

    export class AddPlayerModalCtrl extends intranet.common.ControllerBase<IAddPlayerModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddPlayerModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private settings: common.IBaseSettings,
            private currencyService: services.CurrencyService,
            private $translate: ng.translate.ITranslateService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.player = { betConfig: {} };
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.player.parentId = this.modalOptions.data.userId;
                if (this.modalOptions.data.showCurrency) {
                    this.$scope.player.showCurrency = this.modalOptions.data.showCurrency;
                    this.$scope.player.currencyId = this.modalOptions.data.currencyId.toString();
                }
            }

            this.$scope.modalOptions.ok = result => {
                this.savePlayer();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            if (this.$scope.player.showCurrency) { this.loadCurrency(); }
        }

        private loadCurrency(): void {
            this.currencyService.getCurrencies()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.currencyList = response.data.map((a: any) => { return { id: a.id, name: a.name }; });
                    }
                });
        }

        private validate(): boolean {
            if (this.$scope.player.password !== this.$scope.player.confirmpassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            if (this.settings.ThemeName != 'seven' && this.settings.ThemeName != 'lotus' && !this.$scope.player.mobile && !this.$scope.player.email) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Validation,
                    this.$translate.instant('mobileoremail.requried'), null));
                return false;
            }
            return true;
        }

        private savePlayer(): void {
            if (this.validate()) {

                var item: any = {};
                angular.copy(this.$scope.player, item);

                if (item.creditRef) { item.creditRef = this.$filter('toGLC')(item.creditRef); }
                if (item.casinoCreditRef) { item.casinoCreditRef = (item.casinoCreditRef); }
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.addDownlineMembers(item);
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
    }

    angular.module('intranet.master').controller('addPlayerModalCtrl', AddPlayerModalCtrl);
}