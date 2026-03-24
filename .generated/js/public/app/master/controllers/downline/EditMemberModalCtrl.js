var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class EditMemberModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalData = {};
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.modalData = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.savePlayer();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var status = intranet.common.enums.UserStatus;
                this.$scope.userStatusList = intranet.common.helpers.Utility.enumToArray(status);
                this.getMemberDetail();
            }
            getMemberDetail() {
                this.userService.getUserById(this.$scope.modalData.userId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.member = response.data;
                    }
                });
            }
            validate() {
                if (!this.commonDataService.validatePassword(this.$scope.member.password)) {
                    this.$scope.member.invalidPassword = true;
                }
                else if (this.$scope.member.password !== this.$scope.member.confirmpassword) {
                    this.$scope.member.invalidPassword = true;
                }
                else {
                    this.$scope.member.invalidPassword = false;
                }
            }
            savePlayer() {
                var item = {};
                item.password = '';
                item.status = this.$scope.member.status;
                item.notes = this.$scope.member.notes;
                item.id = this.$scope.member.id;
                item.username = this.$scope.member.username;
                item.userCode = this.$scope.member.userCode;
                item.email = this.$scope.member.email;
                item.mobile = this.$scope.member.mobile;
                item.pt = this.$scope.member.pt;
                if (this.$scope.member.password && this.$scope.member.password.length > 0 && this.$scope.member.password == this.$scope.member.confirmpassword) {
                    item.password = this.$scope.member.password;
                }
                var promise;
                promise = this.userService.updateMember(item);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    this.toasterService.showMessages(response.messages, 3000);
                    if (response.success) {
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                });
            }
        }
        master.EditMemberModalCtrl = EditMemberModalCtrl;
        angular.module('intranet.master').controller('editMemberModalCtrl', EditMemberModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EditMemberModalCtrl.js.map