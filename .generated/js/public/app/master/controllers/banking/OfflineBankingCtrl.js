var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class OfflineBankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, paymentService, toasterService, accountService, settings, localStorageHelper, modalService, commonDataService, websiteService, $filter, ExportFactory, authorizationService, permissionTypes, $stateParams, userService) {
                super($scope);
                this.paymentService = paymentService;
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.settings = settings;
                this.localStorageHelper = localStorageHelper;
                this.modalService = modalService;
                this.commonDataService = commonDataService;
                this.websiteService = websiteService;
                this.$filter = $filter;
                this.ExportFactory = ExportFactory;
                this.authorizationService = authorizationService;
                this.permissionTypes = permissionTypes;
                this.$stateParams = $stateParams;
                this.userService = userService;
                var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request", (event, response) => {
                    this.showDeposit();
                });
                var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request", (event, response) => {
                    this.showWithdrawal();
                    this.showPaymorWithdrawal();
                });
                this.$scope.$on('$destroy', () => {
                    wsListnerDeposit();
                    wsListnerWithdrawal();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.selectedTab = 0;
                this.$scope.userList = [];
                this.$scope.withdrawalSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.depositSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.paymorWithdrawalSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.paymorWithdrawalSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.OBDstatus = this.commonDataService.isOBD();
                if (this.$stateParams.tab) {
                    this.$scope.selectedTab = this.$stateParams.tab;
                }
            }
            loadInitialData() {
                if (this.commonDataService.isCPLogin()) {
                    if (this.authorizationService.hasClaimBoolean(this.permissionTypes.BANKING_DW_FULLACCESS)) {
                        this.$scope.isCPLogin = true;
                    }
                }
                if (!this.$scope.isCPLogin) {
                    this.getPGInfo();
                    this.getDetail();
                }
                this.getPayInOutStatus();
                this.$scope.optionStatus = [];
                this.$scope.optionStatus.push({ id: true, name: 'Yes' });
                this.$scope.optionStatus.push({ id: false, name: 'No' });
            }
            getPGInfo() {
                this.websiteService.getPGInfo()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.pgResponse = response.data;
                        if (response.data.isEnabledPinWallet) {
                            this.$scope.isPinWalletEnabled = true;
                        }
                        if (response.data.isEnabledPaymor) {
                            this.$scope.isPaymorEnabled = true;
                        }
                    }
                });
            }
            optionStatusChanged(isActive, item) {
                this.paymentService.changeBankStatus(item.id, isActive)
                    .success((response) => {
                    if (response.success) {
                        item.isActive = isActive;
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            getPayInOutStatus() {
                var gameType = intranet.common.enums.FairXPayOutStatus;
                this.$scope.fairxpayoutList = intranet.common.helpers.Utility.enumToArray(gameType);
                this.$scope.fairxpayoutList.splice(0, 0, { id: '', name: 'All' });
                var offpaystatus = intranet.common.enums.OffPayStatus;
                this.$scope.fairxpayinList = intranet.common.helpers.Utility.enumToArray(offpaystatus);
                this.$scope.fairxpayinList.splice(0, 0, { id: '', name: 'All' });
                var pwstatus = intranet.common.enums.PaymorPayoutStatus;
                this.$scope.paymorWithdrawalStatus = intranet.common.helpers.Utility.enumToArray(pwstatus);
                this.$scope.paymorWithdrawalStatus.splice(0, 0, { id: '', name: 'All' });
            }
            OBDStatusChanged() {
                var isSuccess = !this.$scope.OBDstatus;
                this.userService.changeOBDstatus(this.$scope.OBDstatus)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) {
                        isSuccess = this.$scope.OBDstatus;
                        this.updateUserOBDStatus(isSuccess);
                        this.getDetail();
                    }
                }).finally(() => { this.$scope.OBDstatus = isSuccess; });
            }
            updateUserOBDStatus(s) {
                var result = this.localStorageHelper.get(this.settings.UserData);
                if (result) {
                    result.user.isOBD = s;
                }
                this.localStorageHelper.set(this.settings.UserData, result);
            }
            setLimits() {
                var item = {};
                if (this.$scope.pgResponse && this.$scope.pgResponse.offlinePaymentConfig) {
                    angular.copy(this.$scope.pgResponse.offlinePaymentConfig, item);
                }
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Set Deposit/Withdrawal Limits";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/set-dw-limits-modal.html';
                modal.controller = 'setDWLimitsModalCtrl';
                modal.options.actionButton = 'Save';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getPGInfo();
                    }
                });
            }
            getDetail() {
                this.paymentService.getBankDetails()
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.bankingDetail = response.data;
                    }
                });
            }
            addEditBank(gitem = null) {
                var item = {};
                if (gitem)
                    angular.copy(gitem, item);
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Add/Edit Bank";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/add-deposit-option-modal.html';
                modal.controller = 'addDepositOptionModalCtrl';
                modal.options.actionButton = 'Save';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getDetail();
                    }
                });
            }
            getDetailType(d) { return intranet.common.enums.DepositOptinos[d]; }
            removeDetail(a) {
                this.modalService.showConfirmation("Are you sure you want to delete <b>" + a.acNo + "</b> ?")
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.paymentService.deleteBankDetails(a.id)
                            .success((response) => {
                            if (response.success) {
                                this.getDetail();
                            }
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                });
            }
            showDeposit() {
                this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
            }
            getPayins(params) {
                var searchQuery = {
                    status: this.$scope.depositSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                    userId: ''
                };
                if (this.$scope.depositSearch.selectedUser) {
                    searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
                }
                return this.accountService.getOffPayIn({ searchQuery: searchQuery, params: params });
            }
            getPayInStatus(s) {
                return intranet.common.enums.OffPayStatus[s];
            }
            changePayInStatus(gitem) {
                var item = {};
                angular.copy(gitem, item);
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Change Deposit Request Status";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/payin-status.html';
                modal.controller = 'payinStatusModalCtrl';
                modal.options.actionButton = 'Save';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.showDeposit();
                    }
                });
            }
            resetDepositCriteria() {
                this.$scope.depositSearch.status = { id: '', name: 'All' };
                this.$scope.depositSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.selectedUser = undefined;
                this.showDeposit();
            }
            rollbackPayIn(item) {
                this.modalService.showConfirmation("Are you sure you want to rollback " + this.$filter('toRate')(item.amount) + " ?")
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.paymentService.rollbackDeposit(item.id)
                            .success((response) => {
                            if (response.success) {
                                this.showDeposit();
                            }
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                });
            }
            exportDepositToExcel() {
                var searchQuery = {
                    status: this.$scope.depositSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                    userId: ''
                };
                if (this.$scope.depositSearch.selectedUser) {
                    searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
                }
                var promise = this.accountService.getOffPayInExport(searchQuery);
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
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("User Name");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Mobile");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Amount");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Amount");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("UTR");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("A/C No");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bank Name");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comment");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Created On");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Updated On");
                                    table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.mobile);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.amount));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusAmount));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.utrNo);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.acNo);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bankName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.getPayInStatus(g.status));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.comment);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.updatedOn).format('DD/MM/YYYY HH:mm'));
                                contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = intranet.common.helpers.CommonHelper.wrapTable(table);
                            this.ExportFactory.tableStringToExcel(table, 'Deposit Export');
                        }
                    }
                });
            }
            getStatus(s) {
                return intranet.common.enums.FairXPayOutStatus[s];
            }
            showWithdrawal() {
                this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
            }
            getPayouts(params) {
                var searchQuery = {
                    status: this.$scope.withdrawalSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
                    userId: ''
                };
                if (this.$scope.withdrawalSearch.selectedUser) {
                    searchQuery.userId = this.$scope.withdrawalSearch.selectedUser.id;
                }
                return this.accountService.getOffPayout({ searchQuery: searchQuery, params: params });
            }
            changePayoutStatus(gitem) {
                var item = {};
                angular.copy(gitem, item);
                item.isPinWalletEnabled = this.$scope.isPinWalletEnabled;
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Change Withdrawal Request Status";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/payout-status.html';
                modal.controller = 'payoutStatusModalCtrl';
                modal.options.actionButton = 'Save';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.showWithdrawal();
                    }
                });
            }
            resetCriteria() {
                this.$scope.withdrawalSearch.status = { id: '', name: 'All' };
                this.$scope.withdrawalSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.withdrawalSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.withdrawalSearch.selectedUser = undefined;
                this.showWithdrawal();
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
            getReceiptImage(request) {
                this.accountService.getPayInOutSlip(request.imageId)
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
            }
            copyText(item) {
                this.commonDataService.copyText(item);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
            copyWDetail(item) {
                var txt = '';
                txt = txt + 'Amount : ' + this.$filter('toRate')(item.amount) + '\n';
                txt = txt + 'A/C : ' + item.acNo + '\n';
                txt = txt + 'IFSC : ' + item.ifscCode + '\n';
                txt = txt + 'Bank : ' + item.bankName + '\n';
                txt = txt + 'Holder : ' + item.acName + '\n\n';
                txt = txt + 'Username : ' + item.user.username + ' (' + item.user.mobile + ')' + '\n';
                this.commonDataService.copyText(txt);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
            exportWithdrawalToExcel() {
                var searchQuery = {
                    status: this.$scope.withdrawalSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
                    userId: ''
                };
                if (this.$scope.withdrawalSearch.selectedUser) {
                    searchQuery.userId = this.$scope.withdrawalSearch.selectedUser.id;
                }
                this.accountService.getOffPayOutExport(searchQuery)
                    .success((response) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table = '';
                            var headerTD = '';
                            var contentTD = '';
                            var contentTR = '';
                            gridData.forEach((g, index) => {
                                if (index == 0) {
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("User Name");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Mobile");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Amount");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("A/C No");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("A/C Name");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bank");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("IFSC");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comment");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Created On");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Updated On");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Timer");
                                    table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.mobile);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.amount));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.acNo);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.acName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bankName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.ifscCode);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.getStatus(g.status));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.comment);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.updatedOn).format('DD/MM/YYYY HH:mm'));
                                var diff = this.$filter('twoDateDiff')(g.createdOn, g.updatedOn);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(diff);
                                contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = intranet.common.helpers.CommonHelper.wrapTable(table);
                            this.ExportFactory.tableStringToExcel(table, 'Withdrawal Export');
                        }
                    }
                });
            }
            showPaymorWithdrawal() {
                this.$scope.$broadcast('refreshGrid_kt-paymorwithdrawal-grid');
            }
            getPaymorPayoutStatus(s) {
                return intranet.common.enums.PaymorPayoutStatus[s];
            }
            getPaymorPayout(params) {
                var searchQuery = {
                    status: this.$scope.paymorWithdrawalSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.paymorWithdrawalSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.paymorWithdrawalSearch.todate),
                    userId: ''
                };
                if (this.$scope.paymorWithdrawalSearch.selectedUser) {
                    searchQuery.userId = this.$scope.paymorWithdrawalSearch.selectedUser.id;
                }
                return this.accountService.getPaymorPayout({ searchQuery: searchQuery, params: params });
            }
            resetPaymorWithdrawalCriteria() {
                this.$scope.paymorWithdrawalSearch.status = { id: '', name: 'All' };
                this.$scope.paymorWithdrawalSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.paymorWithdrawalSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.paymorWithdrawalSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.paymorWithdrawalSearch.selectedUser = undefined;
                this.showPaymorWithdrawal();
            }
            copyPaymorPayoutDetail(item) {
                var txt = '';
                txt = txt + 'Amount : ' + this.$filter('toRate')(item.amount) + '\n';
                txt = txt + 'A/C : ' + item.accNo + '\n';
                txt = txt + 'IFSC : ' + item.ifscCode + '\n';
                txt = txt + 'Bank : ' + item.bankName + '\n';
                txt = txt + 'Holder : ' + item.name + '\n\n';
                txt = txt + 'Type : ' + item.transferType + '\n\n';
                txt = txt + 'Username : ' + item.user.username + ' (' + item.user.mobile + ')' + '\n';
                this.commonDataService.copyText(txt);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
            changePaymorPayoutStatus(gitem) {
                var item = {};
                angular.copy(gitem, item);
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Change Withdrawal Request Status";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/paymor-payout-status.html';
                modal.controller = 'paymorPayoutStatusModalCtrl';
                modal.options.actionButton = 'Save';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.showPaymorWithdrawal();
                    }
                });
            }
        }
        master.OfflineBankingCtrl = OfflineBankingCtrl;
        angular.module('intranet.master').controller('offlineBankingCtrl', OfflineBankingCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OfflineBankingCtrl.js.map