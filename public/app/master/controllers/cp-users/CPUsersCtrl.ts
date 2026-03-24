module intranet.master {

    export interface ICPUsersScope extends intranet.common.IScopeBase {
        admUsers: any[];
    }

    export class CPUsersCtrl extends intranet.common.ControllerBase<ICPUsersScope>
        implements common.init.IInit {
        constructor($scope: ICPUsersScope,
            private settings: common.IBaseSettings,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private $state: any) {
            super($scope);


            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.admUsers = [];
        }

        public loadInitialData(): void {
            this.getAdminUsers();
        }

        private addAdminUser(): void {
            this.$state.go('master.addadminuser');
        }

        private editUser(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {};
            angular.copy(item, modal.data);
            modal.header = "Information";
            modal.bodyUrl = this.settings.ThemeName + '/master/cp-users/edit-cp-user-modal.html';
            modal.controller = 'editCPUserModalCtrl';
            modal.size = modal.data.readonly ? '' : 'lg';
            if (modal.data.readonly) modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getAdminUsers();
                }
            });
        }

        private editAccess(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {};
            angular.copy(item, modal.data);
            modal.bodyUrl = this.settings.ThemeName + '/master/cp-users/cp-access-modal.html';
            modal.controller = 'cPAccessModalCtrl';
            modal.size = 'md';
            if (modal.data.readonly) modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getAdminUsers();
                }
            });
        }

        private getAdminUsers(): void {
            this.$scope.admUsers.splice(0);
            this.userService.getAdminUsers()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.admUsers = response.data;
                    }
                });
        }

    }

    angular.module('intranet.master').controller('cPUsersCtrl', CPUsersCtrl);
}