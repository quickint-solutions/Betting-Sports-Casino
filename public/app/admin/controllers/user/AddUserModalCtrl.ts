module intranet.admin {

    export interface IAddUserModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        user: any;
        userTypeList: any[];
        websites: any[];
        currencyList: any[];
    }

    export class AddUserModalCtrl extends intranet.common.ControllerBase<IAddUserModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddUserModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
            private userService: services.UserService,
            private websiteService: services.WebsiteService,
            private currencyService: services.CurrencyService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.userTypeList = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.user = {};
            this.$scope.user.userType = common.enums.UserType.Admin;

            if (this.modalOptions.data) { this.$scope.user = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.saveUserDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadCurrency();
            this.loadWebsites();
            this.loadUserTypes();
        }

        private loadUserTypes(): void {
            var types: any = common.enums.UserType;
            var userTypes = common.helpers.Utility.enumToArray<common.enums.UserType>(types);

            if (this.$scope.user.id) {
                this.$scope.userTypeList = userTypes;
            } else {

                this.$scope.userTypeList = userTypes.filter((a: any) => {
                    return a.id == common.enums.UserType.Admin ||
                        a.id == common.enums.UserType.BM ||
                        a.id == common.enums.UserType.SBM ||
                        a.id == common.enums.UserType.Manager ||
                        a.id == common.enums.UserType.CP ||
                        a.id == common.enums.UserType.Radar ||
                        a.id == common.enums.UserType.Operator
                });
                this.$scope.userTypeList.forEach((u: any) => {
                    if (u.id == common.enums.UserType.Admin) { u.name = 'AD'; }
                    if (u.id == common.enums.UserType.Manager) { u.name = 'MGR'; }
                });
            }
        }

        private userTypeChanged(selectedId: any): void {
            this.$scope.user.userType = selectedId;
        }

        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        if (this.$scope.websites) {
                            if (!this.$scope.user.websiteId) {
                                this.$scope.user.websiteId = this.$scope.websites[0].id.toString();
                            } else {
                                this.$scope.user.websiteId = this.$scope.user.websiteId.toString();}
                        }
                    }
                });
        }

        private loadCurrency(): void {
            this.currencyService.getCurrencies()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.currencyList = response.data.map((a: any) => { return { id: a.id, name: a.name }; });
                        if (this.$scope.currencyList.length > 0) {
                            this.$scope.user.currencyId = this.$scope.currencyList[0].id.toString();
                        }
                    }
                });
        }

        private validate(): any {
            this.$scope.messages = [];
            if (!this.$scope.user.id) {
                if (!this.$scope.user.password || !this.$scope.user.confirmpassword
                    || this.$scope.user.password != this.$scope.user.confirmpassword) {
                    this.$scope.messages.push(new common.messaging.ResponseMessage(
                        common.messaging.ResponseMessageType.Validation,
                        this.$translate.instant('password.confirm.notmatched'), null));
                    return false;
                }
            }
            if (!this.$scope.user.mobile && !this.$scope.user.email) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Validation,
                    this.$translate.instant('mobileoremail.requried'), null));
                return false;
            }
            if (this.$scope.user.userType == common.enums.UserType.Admin
                && !this.$scope.user.id && this.$scope.user.betConfig.betDelay < 5) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Validation,
                    this.$translate.instant('betdelay.greaterthan.five'), null));
                return false;
            }

            return true;
        }

        private saveUserDetail(): void {
            if (this.validate()) {
                var promise: ng.IHttpPromise<any>;
                if (this.$scope.user.id) {
                    promise = this.userService.updateWebAdmin(this.$scope.user);
                }
                else {
                    promise = this.userService.saveWebAdminUser(this.$scope.user);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data && response.data.id) {
                            this.$uibModalInstance.close({ data: response.data, button: common.services.ModalResult.OK });
                        } else {
                            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                        
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
    }

    angular.module('intranet.admin').controller('addUserModalCtrl', AddUserModalCtrl);
}