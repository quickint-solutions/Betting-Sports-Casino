var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class UserCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, toasterService, modalService, websiteService, $rootScope, $filter, exportService, settings, userService) {
                super($scope);
                this.$state = $state;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.websiteService = websiteService;
                this.$rootScope = $rootScope;
                this.$filter = $filter;
                this.exportService = exportService;
                this.settings = settings;
                this.userService = userService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = { usertype: "-1", status: "-1", userCode: '', username: '', websiteId: '-1' };
            }
            loadInitialData() {
                this.setUserStatusAndType();
                this.loadWebsites();
            }
            setUserStatusAndType() {
                var status = intranet.common.enums.UserStatus;
                this.$scope.userStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
                var types = intranet.common.enums.UserType;
                this.$scope.userTypes = intranet.common.helpers.Utility.enumToArray(types);
                this.$scope.userTypes.splice(0, 0, { id: -1, name: '-- Select User Type --' });
            }
            loadWebsites() {
                this.websiteService.getWebsites()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        this.$scope.websites.splice(0, 0, { id: -1, name: '-- Select Website --' });
                    }
                });
            }
            addEditUser(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        if (result.data && result.data.id) {
                            this.refreshGrid();
                            if (item.userType != intranet.common.enums.UserType.Operator && !item) {
                                this.setCommission(result.data.id, result.data.username);
                            }
                        }
                    }
                });
            }
            addDW(userId, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('common.banking.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = { userId: userId };
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/dw-modal.html';
                modal.controller = 'dwModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$rootScope.$emit('admin-balance-changed');
                    }
                });
            }
            getUserType(usertype) {
                return intranet.common.enums.UserType[usertype];
            }
            getUserStatus(status) {
                return intranet.common.enums.UserStatus[status];
            }
            setCommission(userId, username) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = { userId: userId, username: username };
                modal.size = 'lg';
                modal.header = 'admin.user.set.commission.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
                modal.controller = 'userCommissionModalCtrl';
                modal.options.extraButton = 'common.button.applyall';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.updateBetConfig(userId, username);
                    }
                });
            }
            updateBetConfig(userid, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.options.extraButton = 'common.button.applyall';
                modal.header = this.$filter('translate')('betconfig.update.modal.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = userid;
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/bet-config-modal.html';
                modal.controller = 'betConfigModalCtrl';
                modal.size = 'lg';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            setBT(userId, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.options.extraButton = 'common.button.applyall';
                modal.data = userId;
                modal.header = this.$filter('translate')('admin.user.set.bt.modal.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/bt-modal.html';
                modal.controller = 'bTModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            getItems(params, filters) {
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
            exportBanking(params, exportType) {
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
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { usertype: "-1", status: "-1", userCode: '', username: '', websiteId: '-1' };
                this.refreshGrid();
            }
            changePassword(userid, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('profile.password.change.modal.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = {
                    userId: userid,
                    fromMember: true
                };
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            changeUserStatus(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'member.change.status.modal.header';
                modal.data = {
                    userId: item.id,
                    userType: item.userType,
                    status: item.status,
                    name: item.username
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/change-status-modal.html';
                modal.controller = 'changeStatusModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            changeBettingLock(item) {
                var newLock = item.bettingLock == 2 ? true : false;
                this.modalService.showConfirmation("Are you sure you want to " + (newLock ? 'lock ' : 'unlock ') + item.userCode.toUpperCase() + " ?")
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        var modal = { userId: item.id, bettingLock: newLock };
                        this.userService.changeBettingLock(modal)
                            .success((response) => {
                            if (response.success) {
                                this.refreshGrid();
                            }
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                });
            }
            editOperator(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'admin.operator.edit.modal.header';
                modal.header = "Operator Configuration";
                if (item.username) {
                    modal.header = modal.header + " - " + item.username;
                }
                modal.data = {
                    id: item.id,
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/operator/add-operator-modal.html';
                modal.controller = 'addOperatorModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            changeWebsite(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    userId: item.id,
                    username: item.username,
                    userType: item.userType,
                    userCode: item.userCode,
                    websiteId: item.websiteId
                };
                modal.header = "Change Website";
                if (item.username) {
                    modal.header = modal.header + " - " + item.username;
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/change-website-modal.html';
                modal.controller = 'changeWebsiteModalCtrl';
                modal.size = 'sm';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            updateSMSConfig(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    id: item.id,
                    username: item.username,
                    userType: item.userType,
                    userCode: item.userCode
                };
                modal.header = "Update SMS Config";
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/update-sms-config-modal.html';
                modal.controller = 'updateSMSConfigModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
        }
        admin.UserCtrl = UserCtrl;
        angular.module('intranet.admin').controller('userCtrl', UserCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserCtrl.js.map