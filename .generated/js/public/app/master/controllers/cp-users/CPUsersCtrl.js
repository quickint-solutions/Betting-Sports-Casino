var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class CPUsersCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, modalService, toasterService, userService, $state) {
                super($scope);
                this.settings = settings;
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.userService = userService;
                this.$state = $state;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.admUsers = [];
            }
            loadInitialData() {
                this.getAdminUsers();
            }
            addAdminUser() {
                this.$state.go('master.addadminuser');
            }
            editUser(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {};
                angular.copy(item, modal.data);
                modal.header = "Information";
                modal.bodyUrl = this.settings.ThemeName + '/master/cp-users/edit-cp-user-modal.html';
                modal.controller = 'editCPUserModalCtrl';
                modal.size = modal.data.readonly ? '' : 'lg';
                if (modal.data.readonly)
                    modal.options.actionButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getAdminUsers();
                    }
                });
            }
            editAccess(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {};
                angular.copy(item, modal.data);
                modal.bodyUrl = this.settings.ThemeName + '/master/cp-users/cp-access-modal.html';
                modal.controller = 'cPAccessModalCtrl';
                modal.size = 'md';
                if (modal.data.readonly)
                    modal.options.actionButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getAdminUsers();
                    }
                });
            }
            getAdminUsers() {
                this.$scope.admUsers.splice(0);
                this.userService.getAdminUsers()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.admUsers = response.data;
                    }
                });
            }
        }
        master.CPUsersCtrl = CPUsersCtrl;
        angular.module('intranet.master').controller('cPUsersCtrl', CPUsersCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CPUsersCtrl.js.map