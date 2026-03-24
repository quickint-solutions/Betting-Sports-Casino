module intranet.master {
    export interface IEditMemberModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        modalData: any;

        member: any;
        userStatusList: any[];
    }

    export class EditMemberModalCtrl extends intranet.common.ControllerBase<IEditMemberModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IEditMemberModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

        }

        public loadInitialData(): void {
            var status: any = common.enums.UserStatus;
            this.$scope.userStatusList = common.helpers.Utility.enumToArray<common.enums.UserStatus>(status);
            this.getMemberDetail();
        }

        private getMemberDetail(): void {
            this.userService.getUserById(this.$scope.modalData.userId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.member = response.data;
                    }
                });
        }

        private validate(): void {
            if (!this.commonDataService.validatePassword(this.$scope.member.password)) {
                this.$scope.member.invalidPassword = true;
            }
            else if (this.$scope.member.password !== this.$scope.member.confirmpassword) {
                this.$scope.member.invalidPassword = true;
            }
            else { this.$scope.member.invalidPassword = false; }
        }

        private savePlayer(): void {
            var item: any = {};
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
                item.password = this.$scope.member.password
            }

            var promise: ng.IHttpPromise<any>;
            promise = this.userService.updateMember(item);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                this.toasterService.showMessages(response.messages, 3000);
                if (response.success) {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                }
            });

        }
    }

    angular.module('intranet.master').controller('editMemberModalCtrl', EditMemberModalCtrl);
}