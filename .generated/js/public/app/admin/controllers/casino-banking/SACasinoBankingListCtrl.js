var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SACasinoBankingListCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, modalService, toasterService, exportService, websiteService, settings, $stateParams, $state, $filter, $rootScope, accountService) {
                super($scope);
                this.commonDataService = commonDataService;
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.exportService = exportService;
                this.websiteService = websiteService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$filter = $filter;
                this.$rootScope = $rootScope;
                this.accountService = accountService;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-banking-grid') {
                        if (data && data.result.length > 0) {
                            data.result.forEach((item) => {
                                item.chips = math.round(math.subtract((item.totalCasinoBalance + item.casinoBalance), item.casinoCreditLimit ? item.casinoCreditLimit : 0), 2);
                                if (item.chips < 0) {
                                    item.dwType = 'D';
                                    item.chips = item.chips * -1;
                                }
                                else {
                                    item.dwType = 'W';
                                }
                            });
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    newPageLoader();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = { status: "2", name: '', username: '', websiteId: '-1' };
                this.$scope.userTypes = [];
                this.$scope.transactionType = [];
            }
            loadInitialData() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    this.getUserId();
                }
                this.fillUserTypes();
                this.loadUserStatus();
                this.loadWebsites();
                this.loadTransactionTypes();
            }
            loadUserStatus() {
                var status = intranet.common.enums.UserStatus;
                this.$scope.userStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
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
            haveChild(id) {
                return id < intranet.common.enums.UserType.Player;
            }
            getUserId() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                }
            }
            loadTransactionTypes() {
                this.$scope.transactionType.push({ id: 'D', name: 'D' });
                this.$scope.transactionType.push({ id: 'W', name: 'W' });
            }
            fillUserTypes() {
                this.$scope.userTypes = super.getUserTypes();
            }
            goBack() {
                this.$state.go("admin.casinobanking.list", { memberid: null });
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
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getItems(params, filters) {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                    websiteId: this.$scope.search.websiteId,
                };
                var model = { params: params, id: this.$scope.userid, searchQuery: searchModel };
                return this.accountService.getCasinoMembersForBanking(model);
            }
            exportBanking(params, exportType) {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                    websiteId: this.$scope.search.websiteId,
                };
                var model = { params: params, id: this.$scope.userid, exportType: exportType, searchQuery: searchModel };
                return this.exportService.getCasinoChildBalanceinfo(model);
            }
            updateCreditRef(userid, creditRef, username = '') {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('creditref.update.modal.header');
                if (username) {
                    modal.header = modal.header + " - " + username;
                }
                modal.data = {
                    current: creditRef,
                    userId: userid,
                    isCasino: true
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/credit-reference-modal.html';
                modal.controller = 'creditReferenceModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                    }
                });
            }
            transferChip(gritem) {
                var item = {};
                angular.copy(gritem, item);
                item.isCasino = true;
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('transfer.update.modal.header');
                if (item.user.username) {
                    modal.header = modal.header + " - " + item.user.username;
                }
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/transfer-modal.html';
                modal.controller = 'transferModalCtrl';
                modal.options.actionButton = 'Transfer';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$rootScope.$emit('admin-balance-changed');
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                    }
                });
            }
            transferAllChip() {
                var gridItems = [];
                angular.copy(this.$scope.gridItems, gridItems);
                var tf = gridItems.filter((a) => { return a.isTransfer; });
                if (tf.length > 0) {
                    tf.forEach((t) => {
                        if (t.chips.length > 0) {
                            t.chips = parseFloat(t.chips.replaceAll(',', ''));
                        }
                    });
                    var dw = tf.filter((t) => { return t.chips && t.chips != 0; });
                    var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
                    if (model) {
                        this.accountService.DWForCasino(model)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.password = '';
                                this.$rootScope.$emit('admin-balance-changed');
                                this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                            }
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                    }
                }
            }
            resetCriteria() {
                this.$scope.search = { status: "2", name: '', username: '', websiteId: '-1' };
                this.refreshGrid();
            }
            changeUserStatus(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'member.change.status.modal.header';
                modal.data = {
                    userId: item.userId,
                    userType: item.user.userType,
                    status: item.user.status,
                    name: item.user.username
                };
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/change-status-modal.html';
                modal.controller = 'changeStatusModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
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
            setCommission(userId, username) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = { userId: userId, username: username, onlyCommission: false };
                modal.size = 'lg';
                modal.header = 'admin.user.set.commission.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
                modal.controller = 'userCommissionModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
        }
        admin.SACasinoBankingListCtrl = SACasinoBankingListCtrl;
        angular.module('intranet.admin').controller('sACasinoBankingListCtrl', SACasinoBankingListCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SACasinoBankingListCtrl.js.map