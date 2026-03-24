var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ChangeStatusModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userTypes = [];
                this.$scope.messages = [];
                this.$scope.user = {};
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                    this.$scope.user.selectedStatus = this.modalOptions.data.status;
                }
                this.$scope.modalOptions.ok = result => {
                    this.changeUserStatus();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.fillUserTypes();
            }
            fillUserTypes() {
                this.$scope.userTypes = super.getUserTypes();
            }
            getUserStatus(status) {
                return intranet.common.enums.UserStatus[status];
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            changeUserStatus() {
                var promise;
                var model = { Password: this.$scope.password, userId: this.$scope.user.userId, status: this.$scope.user.selectedStatus };
                promise = this.userService.changeStatus(model);
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
        master.ChangeStatusModalCtrl = ChangeStatusModalCtrl;
        angular.module('intranet.master').controller('changeStatusModalCtrl', ChangeStatusModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ChangeStatusModalCtrl.js.map