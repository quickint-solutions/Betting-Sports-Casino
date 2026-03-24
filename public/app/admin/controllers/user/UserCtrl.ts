module intranet.admin {

    export interface IUserScope extends intranet.common.IScopeBase {
        search: any;
        userStatus: any[];
        userTypes: any[];
        websites: any[];
    }

    export class UserCtrl extends intranet.common.ControllerBase<IUserScope>
        implements intranet.common.init.IInit {
        constructor($scope: IUserScope,
            private $state: any,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private websiteService: services.WebsiteService,
            protected $rootScope: any,
            private $filter: any,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings,
            private userService: services.UserService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = { usertype: "-1", status: "-1", userCode: '', username: '', websiteId: '-1' };
        }

        public loadInitialData(): void {
            this.setUserStatusAndType();
            this.loadWebsites();
        }

        private setUserStatusAndType(): void {
            var status: any = common.enums.UserStatus;
            this.$scope.userStatus = common.helpers.Utility.enumToArray<common.enums.UserStatus>(status);
            this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });

            var types: any = common.enums.UserType;
            this.$scope.userTypes = common.helpers.Utility.enumToArray<common.enums.UserType>(types);
            this.$scope.userTypes.splice(0, 0, { id: -1, name: '-- Select User Type --' });
        }

        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        this.$scope.websites.splice(0, 0, { id: -1, name: '-- Select Website --' });
                    }
                });
        }

        private addEditUser(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (!item) {
                modal.header = 'admin.user.add.modal.header';
                modal.data = null;
            }
            else {
                modal.header = 'admin.user.edit.modal.header';
                modal.data = {
                    id: item.id,
                    userCode: item.userCode,
                    username: item.username,
                    email: item.email,
                    mobile: item.mobile,
                    userType: item.userType,
                    status: item.status,
                    languageId: item.languageId,
                    allowMultiLogin: item.allowMultiLogin,
                    websiteId: item.websiteId,
                    isOBD: item.isOBD,
                    isChatEnabled: item.isChatEnabled,
                    chatSiteId: item.chatSiteId,
                    pt: item.pt
                };
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/add-user-modal.html';
            modal.controller = 'addUserModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    if (result.data && result.data.id) {
                        this.refreshGrid();
                        if (item.userType != common.enums.UserType.Operator && !item) {
                            this.setCommission(result.data.id, result.data.username);
                        }
                    }
                }
            });
        }

        private addDW(userId: any, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('common.banking.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.data = { userId: userId };
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/dw-modal.html';
            modal.controller = 'dwModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$rootScope.$emit('admin-balance-changed');
                }
            });
        }

        private getUserType(usertype: any): string {
            return common.enums.UserType[usertype];
        }

        private getUserStatus(status: any): string {
            return common.enums.UserStatus[status];
        }

        private setCommission(userId: any, username: string): void {
            var modal = new common.helpers.CreateModal();
            modal.data = { userId: userId, username: username };
            modal.size = 'lg';
            modal.header = 'admin.user.set.commission.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
            modal.controller = 'userCommissionModalCtrl';
            modal.options.extraButton = 'common.button.applyall';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.updateBetConfig(userId, username);
                }
            });
        }

        private updateBetConfig(userid, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.options.extraButton = 'common.button.applyall';
            modal.header = this.$filter('translate')('betconfig.update.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.data = userid;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/bet-config-modal.html';
            modal.controller = 'betConfigModalCtrl';
            modal.size = 'lg';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private setBT(userId: any, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.options.extraButton = 'common.button.applyall';
            modal.data = userId;
            modal.header = this.$filter('translate')('admin.user.set.bt.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/bt-modal.html';
            modal.controller = 'bTModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchModel = {
                userCode: this.$scope.search.userCode,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                userType: this.$scope.search.usertype,
                websiteId: this.$scope.search.websiteId == '-1' ? '' : this.$scope.search.websiteId,
            };
            var model = { params: params, searchQuery: searchModel };
            return this.userService.searchUser(model);
        }

        public exportBanking(params: any, exportType: any): any {
            var searchModel = {
                userCode: this.$scope.search.userCode,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                userType: this.$scope.search.usertype,
                websiteId: this.$scope.search.websiteId == '-1' ? '' : this.$scope.search.websiteId,
            };
            var model = { params: params, exportType: exportType, searchQuery: searchModel };
            return this.exportService.users(model);
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { usertype: "-1", status: "-1", userCode: '', username: '', websiteId: '-1' };
            this.refreshGrid();
        }

        private changePassword(userid: any, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('profile.password.change.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.data = {
                userId: userid,
                fromMember: true
            }

            modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
            modal.controller = 'changePasswordModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private changeUserStatus(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'member.change.status.modal.header';
            modal.data = {
                userId: item.id,
                userType: item.userType,
                status: item.status,
                name: item.username
            }
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/change-status-modal.html';
            modal.controller = 'changeStatusModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private changeBettingLock(item: any): void {
            var newLock = item.bettingLock == 2 ? true : false;

            this.modalService.showConfirmation("Are you sure you want to " + (newLock ? 'lock ' : 'unlock ') + item.userCode.toUpperCase() + " ?")
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        var modal = { userId: item.id, bettingLock: newLock };
                        this.userService.changeBettingLock(modal)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.refreshGrid();
                                }
                                this.toasterService.showMessages(response.messages);
                            });
                    }
                });
        }

        private editOperator(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.operator.edit.modal.header';
            modal.header = "Operator Configuration";
            if (item.username) { modal.header = modal.header + " - " + item.username; }
            modal.data = {
                id: item.id,
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/operator/add-operator-modal.html';
            modal.controller = 'addOperatorModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });
        }

        private changeWebsite(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                userId: item.id,
                username: item.username,
                userType: item.userType,
                userCode: item.userCode,
                websiteId: item.websiteId
            }
            modal.header = "Change Website";
            if (item.username) { modal.header = modal.header + " - " + item.username }
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/change-website-modal.html';
            modal.controller = 'changeWebsiteModalCtrl';
            modal.size = 'sm';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private updateSMSConfig(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                id: item.id,
                username: item.username,
                userType: item.userType,
                userCode: item.userCode
            }
            modal.header = "Update SMS Config";
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/update-sms-config-modal.html';
            modal.controller = 'updateSMSConfigModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }
    }

    angular.module('intranet.admin').controller('userCtrl', UserCtrl);
}