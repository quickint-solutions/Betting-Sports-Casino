var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class BankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, modalService, toasterService, exportService, settings, userService, $stateParams, $filter, $q, $state, $rootScope, accountService) {
                super($scope);
                this.commonDataService = commonDataService;
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.exportService = exportService;
                this.settings = settings;
                this.userService = userService;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.$q = $q;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.accountService = accountService;
                this.$scope.$on('$destroy', () => {
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.anySelected = false;
                this.$scope.userTree = [];
                this.$scope.userList = [];
                this.$scope.search = {
                    userId: this.$stateParams.userid
                };
            }
            loadInitialData() {
                if (this.$stateParams.memberid) {
                    this.$scope.parentId = this.$stateParams.memberid;
                    this.getUserTree();
                }
                else {
                    this.getUserData();
                }
            }
            haveChild(id) {
                return id < intranet.common.enums.UserType.Player;
            }
            getUserData() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.parentId = result.id;
                    this.$scope.currentUserType = result.userType;
                }
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
                                this.$scope.userid = result.id;
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
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getItems(params, filters) {
                var searchModel = {
                    name: this.$scope.search.name,
                    username: this.$scope.search.username,
                    userId: this.$scope.search.userId,
                };
                var model = {
                    params: params,
                    searchQuery: searchModel,
                    id: this.$scope.parentId
                };
                var defer = this.$q.defer();
                this.accountService.getTransfer(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.availableToTake = response.data.availableToTake;
                        defer.resolve(response.data);
                    }
                    else {
                        defer.reject();
                    }
                }).error(() => { defer.reject(); });
                return defer.promise;
            }
            exportBanking(params, exportType) {
                var model = { params: params, id: this.$scope.userid, exportType: exportType };
                return this.exportService.downline(model);
            }
            transferChip(gritem) {
                var item = {};
                angular.copy(gritem, item);
                if (item.balanceInfo.take > 0) {
                    item.dwType = 'D';
                    item.chips = this.$filter('toRate')(item.balanceInfo.take);
                }
                if (item.balanceInfo.give > 0) {
                    item.dwType = 'W';
                    item.chips = this.$filter('toRate')(item.balanceInfo.give);
                }
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.$filter('translate')('transfer.update.modal.header');
                if (item.username) {
                    modal.header = "Transfer for " + item.username;
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
                    this.$state.go('master.banking', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
                }
                else {
                    this.$state.go('master.banking', { memberid: '', userid: '' });
                }
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
                        this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                    }
                });
            }
            allMemberSelectionChanged(all = false) {
                if (all) {
                    this.$scope.gridItems.forEach((a) => {
                        if (a.balanceInfo.take > 0 || a.balanceInfo.give > 0)
                            a.selected = this.$scope.allSelected;
                    });
                }
                else {
                    var result = this.$scope.gridItems.filter((b) => { return b.balanceInfo.take > 0 || b.balanceInfo.give > 0; }).every((a) => { return a.selected == true; });
                    this.$scope.allSelected = result;
                }
                this.$scope.anySelected = this.$scope.gridItems.some((a) => { return a.selected == true; });
            }
            transferAllChip() {
                var transferIds = this.$scope.gridItems.filter((a) => { return a.selected; }).map((a) => { return a.id; });
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Bulk Transfer';
                modal.size = 'sm';
                modal.data = transferIds;
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/transfer-all-modal.html';
                modal.controller = 'transferAllModalCtrl';
                modal.options.actionButton = 'Bulk Transfer';
                modal.options.modalClass = 'center';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        var response = result.data;
                        if (response && response.length > 0) {
                            var isAllDone = response.every((a) => { return a.status == true; });
                            if (isAllDone) {
                                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Success, "Transfer Successfully!", 2000);
                            }
                            else {
                                this.showTransferFailed(response);
                            }
                        }
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            showTransferFailed(data) {
                if (data.length > 0) {
                    var bodyHtml = '';
                    data.forEach((d) => {
                        if (!d.status) {
                            bodyHtml += ("<div>" + d.name + " - " + d.message + "</div><br/>");
                        }
                    });
                    var modal = new intranet.common.helpers.CreateModal();
                    modal.header = 'Bulk Transfer';
                    modal.size = 'sm';
                    modal.bodyHtml = bodyHtml;
                    modal.options.actionButton = '';
                    modal.options.closeButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
            }
            resetCriteria() {
                this.$scope.search = {};
                if (this.$stateParams.memberid)
                    this.userSelected();
                else
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
                        this.refreshGrid();
                    }
                });
            }
        }
        master.BankingCtrl = BankingCtrl;
        angular.module('intranet.master').controller('bankingCtrl', BankingCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BankingCtrl.js.map