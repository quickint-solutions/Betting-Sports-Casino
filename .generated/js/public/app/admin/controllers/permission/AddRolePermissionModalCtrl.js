var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddRolePermissionModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, permissionService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.permissionService = permissionService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.isRole = false;
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.isRole = this.modalOptions.data.isRole;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRole();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveRole() {
                var promise;
                var model = { name: this.$scope.name, key: this.$scope.key };
                if (this.$scope.isRole) {
                    promise = this.permissionService.addRole(model);
                }
                else {
                    promise = this.permissionService.addPermission(model);
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
        admin.AddRolePermissionModalCtrl = AddRolePermissionModalCtrl;
        angular.module('intranet.admin').controller('addRolePermissionModalCtrl', AddRolePermissionModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddRolePermissionModalCtrl.js.map