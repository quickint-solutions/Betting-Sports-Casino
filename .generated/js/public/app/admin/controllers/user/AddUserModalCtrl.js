var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddUserModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, userService, websiteService, currencyService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.userService = userService;
                this.websiteService = websiteService;
                this.currencyService = currencyService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.userTypeList = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.user = {};
                this.$scope.user.userType = intranet.common.enums.UserType.Admin;
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveUserDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadCurrency();
                this.loadWebsites();
                this.loadUserTypes();
            }
            loadUserTypes() {
                var types = intranet.common.enums.UserType;
                var userTypes = intranet.common.helpers.Utility.enumToArray(types);
                if (this.$scope.user.id) {
                    this.$scope.userTypeList = userTypes;
                }
                else {
                    this.$scope.userTypeList = userTypes.filter((a) => {
                        return a.id == intranet.common.enums.UserType.Admin ||
                            a.id == intranet.common.enums.UserType.BM ||
                            a.id == intranet.common.enums.UserType.SBM ||
                            a.id == intranet.common.enums.UserType.Manager ||
                            a.id == intranet.common.enums.UserType.CP ||
                            a.id == intranet.common.enums.UserType.Radar ||
                            a.id == intranet.common.enums.UserType.Operator;
                    });
                    this.$scope.userTypeList.forEach((u) => {
                        if (u.id == intranet.common.enums.UserType.Admin) {
                            u.name = 'AD';
                        }
                        if (u.id == intranet.common.enums.UserType.Manager) {
                            u.name = 'MGR';
                        }
                    });
                }
            }
            userTypeChanged(selectedId) {
                this.$scope.user.userType = selectedId;
            }
            loadWebsites() {
                this.websiteService.getWebsites()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        if (this.$scope.websites) {
                            if (!this.$scope.user.websiteId) {
                                this.$scope.user.websiteId = this.$scope.websites[0].id.toString();
                            }
                            else {
                                this.$scope.user.websiteId = this.$scope.user.websiteId.toString();
                            }
                        }
                    }
                });
            }
            loadCurrency() {
                this.currencyService.getCurrencies()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.currencyList = response.data.map((a) => { return { id: a.id, name: a.name }; });
                        if (this.$scope.currencyList.length > 0) {
                            this.$scope.user.currencyId = this.$scope.currencyList[0].id.toString();
                        }
                    }
                });
            }
            validate() {
                this.$scope.messages = [];
                if (!this.$scope.user.id) {
                    if (!this.$scope.user.password || !this.$scope.user.confirmpassword
                        || this.$scope.user.password != this.$scope.user.confirmpassword) {
                        this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Validation, this.$translate.instant('password.confirm.notmatched'), null));
                        return false;
                    }
                }
                if (!this.$scope.user.mobile && !this.$scope.user.email) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Validation, this.$translate.instant('mobileoremail.requried'), null));
                    return false;
                }
                if (this.$scope.user.userType == intranet.common.enums.UserType.Admin
                    && !this.$scope.user.id && this.$scope.user.betConfig.betDelay < 5) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Validation, this.$translate.instant('betdelay.greaterthan.five'), null));
                    return false;
                }
                return true;
            }
            saveUserDetail() {
                if (this.validate()) {
                    var promise;
                    if (this.$scope.user.id) {
                        promise = this.userService.updateWebAdmin(this.$scope.user);
                    }
                    else {
                        promise = this.userService.saveWebAdminUser(this.$scope.user);
                    }
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            if (response.data && response.data.id) {
                                this.$uibModalInstance.close({ data: response.data, button: intranet.common.services.ModalResult.OK });
                            }
                            else {
                                this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                            }
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        admin.AddUserModalCtrl = AddUserModalCtrl;
        angular.module('intranet.admin').controller('addUserModalCtrl', AddUserModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddUserModalCtrl.js.map