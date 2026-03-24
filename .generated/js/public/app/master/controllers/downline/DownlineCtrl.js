var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class DownlineCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, localStorageHelper, modalService, accountService, commonDataService, ExportFactory, $stateParams, authorizationService, $state, permissionTypes, userService, $filter, $rootScope, settings) {
                super($scope);
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.modalService = modalService;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.ExportFactory = ExportFactory;
                this.$stateParams = $stateParams;
                this.authorizationService = authorizationService;
                this.$state = $state;
                this.permissionTypes = permissionTypes;
                this.userService = userService;
                this.$filter = $filter;
                this.$rootScope = $rootScope;
                this.settings = settings;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-lotus-downline-grid') {
                        if (data && data.result.length > 0) {
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    newPageLoader();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userTypes = [];
                this.$scope.search = {
                    status: '-1',
                    userCode: '',
                    username: '',
                    userId: this.$stateParams.userid
                };
                this.$scope.editUser = {};
                this.$scope.userList = [];
                this.$scope.parentStatusList = [];
            }
            loadInitialData() {
                this.$scope.haveFullAccess = this.hasFullAccess();
                this.$scope.userTree = [];
                this.commonDataService.getEventTypes();
                this.fillUserTypes();
                this.getLoggedUserId();
                if (this.$stateParams.memberid) {
                    this.$scope.parentId = this.$stateParams.memberid;
                    this.getUserTree();
                }
                else {
                    this.getLoggedUserId(false);
                    this.$scope.newMemberShortName = this.$rootScope.child.short;
                }
                var status = intranet.common.enums.UserStatus;
                this.$scope.userStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
                var code = intranet.common.enums.PTCode;
                this.$scope.ptCodes = intranet.common.helpers.Utility.enumToArray(code);
                this.loadSupportDetail();
                this.getParentStatus();
            }
            getUserTree() {
                if (this.$stateParams.memberid) {
                    this.userService.getParentsByUserId(this.$stateParams.memberid)
                        .success((response) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                this.$scope.currentUserType = result.userType;
                                this.$scope.newMemberShortName = this.getUserTypeShort(result.userType + 1);
                                var parent = result.parent;
                                while (parent) {
                                    this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                    if (parent.parent) {
                                        parent = parent.parent;
                                    }
                                    else {
                                        parent = null;
                                    }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                            }
                        }
                    });
                }
            }
            getParentStatus() {
                this.accountService.getParentStatus(this.$scope.parentId)
                    .success((response) => {
                    if (response.success) {
                        angular.forEach(response.data, (d) => {
                            this.$scope.parentStatusList.push({
                                short: this.getUserTypeShort(d.userType),
                                status: d.status,
                                isLocked: d.bettingLock != 2
                            });
                        });
                    }
                });
            }
            getLoggedUserId(onlyUserType = true) {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    if (!onlyUserType) {
                        this.$scope.parentId = result.id;
                        this.$scope.currentUserType = result.userType;
                    }
                    this.$scope.loggedUserType = result.userType;
                }
            }
            fillUserTypes() {
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperAdmin, name: 'SA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Admin, name: 'AD' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperMaster, name: 'SM' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Master, name: 'MA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Agent, name: 'AG' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Player, name: 'PL' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.PLS, name: 'PLS' });
            }
            haveChild(id) {
                return id < intranet.common.enums.UserType.Player;
            }
            loadSupportDetail() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.commonDataService.getSupportDetails()
                        .then((data) => {
                        this.$scope.isBetfair = data.isBetfair;
                        this.$scope.showReferral = data.isRegisterEnabled && result.userType == intranet.common.enums.UserType.Master && this.$scope.currentUserType == intranet.common.enums.UserType.Master;
                    });
                }
            }
            getItems(params, filters) {
                var searchModel = {
                    userCode: this.$scope.search.userCode,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                    userId: this.$scope.search.userId,
                };
                var model = { params: params, id: this.$scope.parentId, searchQuery: searchModel };
                return this.accountService.getDownline(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-lotus-downline-grid');
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
                                this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
                            }
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                });
            }
            resetCriteria() {
                this.$scope.search = {};
                if (this.$stateParams.memberid)
                    this.userSelected();
                else
                    this.refreshGrid();
            }
            setBT(userId, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                if (this.$scope.currentUserType < intranet.common.enums.UserType.Agent) {
                    modal.options.extraButton = 'common.button.applyall';
                }
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
            addMember() {
                this.$state.go('master.addmember', { parentid: this.$scope.parentId });
            }
            editMember(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    userId: item.id,
                    userType: item.userType,
                    parentId: this.$scope.parentId,
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/edit-member-modal.html';
                modal.templateUrl = 'app/common/services/modal/lotus-modal-trans.html';
                modal.controller = 'editMemberModalCtrl';
                modal.size = 'md';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            hasFullAccess() {
                if (this.commonDataService.isCPLogin()) {
                    return this.authorizationService.hasClaimBoolean(this.permissionTypes.MANAGE_DOWNLINE_FULLACCESS);
                }
                else {
                    return true;
                }
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data;
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
            userSelected() {
                if (this.$scope.search.selectedUser) {
                    this.$state.go('master.memberlist', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
                }
                else {
                    this.$state.go('master.memberlist', { memberid: '', userid: '' });
                }
            }
            exportToExcel() {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                    userId: this.$scope.search.userId,
                };
                var model = { id: this.$scope.parentId, searchQuery: searchModel };
                var promise = this.accountService.getDownlineExport(model);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table = '';
                            var headerTD = '';
                            var contentTD = '';
                            var contentTR = '';
                            gridData.forEach((g, index) => {
                                if (index == 0) {
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Login Name");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("ID");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Betting Status");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Net Exposure");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Take");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Give");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Balance");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Credit Limit");
                                    if (this.$scope.currentUserType != 4)
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Available Credit");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Created");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Last Login");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Last IP");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("UTM Source");
                                    table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.username);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.mobile ? g.mobile : g.userCode);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingLock == 2 ? 'Unlocked' : 'Locked');
                                if (g.status == 2)
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD('ACTIVE');
                                if (g.status == 3)
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD('INACTIVE');
                                if (g.status == 4)
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD('SUSPENDED');
                                if (g.status == 5)
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD('CLOSED');
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.exposure));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.take));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.give));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.balance));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.creditLimit));
                                if (this.$scope.currentUserType != 4)
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.availableCredit));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.lastLogin).format('DD/MM/YYYY HH:mm'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.lastLoginIp);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.utmSource);
                                contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = intranet.common.helpers.CommonHelper.wrapTable(table);
                            this.ExportFactory.tableStringToExcel(table, 'Agency Management - ' + this.$rootScope.child.short + ' Listing');
                        }
                    }
                });
            }
            openReferralSetting(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Update Referral Settings';
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/refer-modal.html';
                modal.controller = 'referModalCtrl';
                modal.options.actionButton = '';
                modal.options.closeButton = 'Close';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                    }
                });
            }
            openUserSetting(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Settings';
                modal.data = { userId: item.id };
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/user-setting-modal.html';
                modal.controller = 'userSettingModalCtrl';
                modal.options.closeButton = 'Close';
                if (this.$scope.currentUserType != intranet.common.enums.UserType.Agent) {
                    modal.options.extraButton = "Apply All";
                }
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                    }
                });
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            getUserStatus(status) {
                return intranet.common.enums.UserStatus[status];
            }
            setCommission(userId, username) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = { userId: userId, username: username, onlyCommission: true };
                modal.header = 'admin.user.set.commission.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
                modal.controller = 'userCommissionModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            addPlayer() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'master.player.add.modal.header';
                modal.data = {
                    userId: this.$scope.parentId,
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/add-player-modal.html';
                modal.controller = 'addPlayerModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            updatePT(userid, pt, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('pt.update.modal.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = {
                    current: pt,
                    userId: userid,
                };
                modal.bodyUrl = this.settings.ThemeName + '/bookmaker/downline/change-pt-modal.html';
                modal.controller = 'changePTModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                    }
                });
            }
            addDW(userId, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Credit";
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = { userId: userId, forMaster: true };
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/dw-modal.html';
                modal.controller = 'dwModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
                    }
                });
            }
            updateCreditRef(userid, creditRef) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'creditref.update.modal.header';
                modal.data = {
                    current: creditRef,
                    userId: userid,
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/credit-reference-modal.html';
                modal.controller = 'creditReferenceModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                    }
                });
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
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            editPT(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    userId: item.user.id,
                    username: item.user.username,
                    userType: item.user.userType,
                    name: item.user.name,
                    parentId: this.$scope.parentId,
                    readonly: this.$stateParams.memberid && this.$stateParams.memberid > 0 ? true : false
                };
                modal.header = "View/Update PT";
                if (item.user.username) {
                    modal.header = modal.header + " - " + item.user.username;
                }
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/edit-pt-modal.html';
                modal.controller = 'editPTModalCtrl';
                modal.size = modal.data.readonly ? '' : 'lg';
                if (modal.data.readonly)
                    modal.options.actionButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
        }
        master.DownlineCtrl = DownlineCtrl;
        angular.module('intranet.master').controller('downlineCtrl', DownlineCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=DownlineCtrl.js.map