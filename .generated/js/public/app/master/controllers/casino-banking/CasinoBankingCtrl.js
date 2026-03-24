var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class CasinoBankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, modalService, toasterService, exportService, settings, $stateParams, $filter, $rootScope, accountService) {
                super($scope);
                this.commonDataService = commonDataService;
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.exportService = exportService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.$rootScope = $rootScope;
                this.accountService = accountService;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-seven-banking-grid' || e.targetScope.gridId === 'kt-banking-grid') {
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
                                item.chips = (item.chips);
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
                this.$scope.userTypes = [];
                this.$scope.transactionType = [];
                this.$scope.search = { status: "2", name: '', username: '' };
            }
            loadInitialData() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    this.getUserId();
                }
                this.fillUserTypes();
                this.loadTransactionTypes();
                var status = intranet.common.enums.UserStatus;
                this.$scope.userStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
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
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperAdmin, name: 'SA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Admin, name: 'AD' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperMaster, name: 'SM' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Master, name: 'MA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Agent, name: 'AG' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Player, name: 'PL' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.PLS, name: 'PLS' });
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
                        this.refreshGrid();
                    }
                });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getItems(params, filters) {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                };
                var model = { params: params, id: this.$scope.userid, searchQuery: searchModel };
                return this.accountService.getCasinoMembersForBanking(model);
            }
            exportBanking(params, exportType) {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    status: this.$scope.search.status,
                };
                var model = { params: params, id: this.$scope.userid, exportType: exportType, searchQuery: searchModel };
                return this.exportService.getCasinoChildBalanceinfo(model);
            }
            submitDW() {
                var gridItems = [];
                angular.copy(this.$scope.gridItems, gridItems);
                var dw = gridItems.filter((a) => { return a.chips && a.chips != 0; });
                dw.forEach((c) => {
                    if (c.chips.length > 0) {
                        c.chips = parseFloat(c.chips.replaceAll(',', ''));
                    }
                    c.chips = (c.chips);
                });
                var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
                if (model) {
                    this.accountService.DWForCasino(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.password = '';
                            this.$scope.$broadcast('refreshGridStayOnPage');
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    });
                }
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
                        this.$scope.$broadcast('refreshGridStayOnPage');
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
                        t.chips = (t.chips);
                    });
                    var dw = tf.filter((t) => { return t.chips && t.chips != 0; });
                    var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
                    if (model) {
                        this.accountService.DWForCasino(model)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.password = '';
                                this.$scope.$broadcast('refreshGridStayOnPage');
                            }
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                    }
                }
            }
            resetCriteria() {
                this.$scope.search = { status: "2", name: '', username: '', };
                this.refreshGrid();
            }
        }
        master.CasinoBankingCtrl = CasinoBankingCtrl;
        angular.module('intranet.master').controller('casinoBankingCtrl', CasinoBankingCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CasinoBankingCtrl.js.map