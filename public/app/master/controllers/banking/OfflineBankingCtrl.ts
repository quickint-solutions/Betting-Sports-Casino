module intranet.master {

    export interface IOfflineBankingScope extends intranet.common.IScopeBase {
        bankingDetail: any[];
        optionStatus: any[];
        pgResponse: any;

        selectedTab: any;
        isPinWalletEnabled: boolean;
        isPaymorEnabled: boolean;

        withdrawalSearch: any;
        depositSearch: any;
        paymorWithdrawalSearch: any;

        fairxpayinList: any[];
        fairxpayoutList: any[];
        paymorWithdrawalStatus: any[];

        userList: any[];
        promiseItem: any;

        OBDstatus: boolean;

        isCPLogin: any;
    }

    export class OfflineBankingCtrl extends intranet.common.ControllerBase<IOfflineBankingScope>
        implements common.init.IInit {
        constructor($scope: IOfflineBankingScope,
            private paymentService: services.PaymentService,
            private toasterService: common.services.ToasterService,
            private accountService: services.AccountService,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private modalService: common.services.ModalService,
            private commonDataService: common.services.CommonDataService,
            private websiteService: services.WebsiteService,
            private $filter: any,
            private ExportFactory: any,
            private authorizationService: common.services.AuthorizationService,
            private permissionTypes: common.security.IPermissionTypes,
            private $stateParams: any,
            private userService: services.UserService) {
            super($scope);

            var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request", (event, response) => {
                this.showDeposit();
            });
            var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request", (event, response) => {
                this.showWithdrawal(); this.showPaymorWithdrawal();
            });

            this.$scope.$on('$destroy', () => {
                wsListnerDeposit();
                wsListnerWithdrawal();
            });

            super.init(this);
        }

        public initScopeValues(): void {
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

            if (this.$stateParams.tab) { this.$scope.selectedTab = this.$stateParams.tab; }
        }

        public loadInitialData(): void {
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

        private getPGInfo() {
            this.websiteService.getPGInfo()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.pgResponse = response.data;
                        if (response.data.isEnabledPinWallet) { this.$scope.isPinWalletEnabled = true; }
                        if (response.data.isEnabledPaymor) { this.$scope.isPaymorEnabled = true; }
                    }
                });
        }

        private optionStatusChanged(isActive: any, item: any): void {
            this.paymentService.changeBankStatus(item.id, isActive)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.isActive = isActive;
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }

        private getPayInOutStatus(): void {
            var gameType: any = common.enums.FairXPayOutStatus;
            this.$scope.fairxpayoutList = common.helpers.Utility.enumToArray<common.enums.FairXPayOutStatus>(gameType);
            this.$scope.fairxpayoutList.splice(0, 0, { id: '', name: 'All' });

            var offpaystatus: any = common.enums.OffPayStatus;
            this.$scope.fairxpayinList = common.helpers.Utility.enumToArray<common.enums.OffPayStatus>(offpaystatus);
            this.$scope.fairxpayinList.splice(0, 0, { id: '', name: 'All' });

            var pwstatus: any = common.enums.PaymorPayoutStatus;
            this.$scope.paymorWithdrawalStatus = common.helpers.Utility.enumToArray<common.enums.PaymorPayoutStatus>(pwstatus);
            this.$scope.paymorWithdrawalStatus.splice(0, 0, { id: '', name: 'All' });
        }

        private OBDStatusChanged(): void {
            var isSuccess = !this.$scope.OBDstatus;
            this.userService.changeOBDstatus(this.$scope.OBDstatus)
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) {
                        isSuccess = this.$scope.OBDstatus;
                        this.updateUserOBDStatus(isSuccess);
                        this.getDetail();
                    }
                }).finally(() => { this.$scope.OBDstatus = isSuccess; });
        }

        private updateUserOBDStatus(s: boolean) {
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result) {
                result.user.isOBD = s;
            }
            this.localStorageHelper.set(this.settings.UserData, result);
        }

        private setLimits() {
            var item: any = {};
            if (this.$scope.pgResponse && this.$scope.pgResponse.offlinePaymentConfig) {
                angular.copy(this.$scope.pgResponse.offlinePaymentConfig, item);
            }

            var modal = new common.helpers.CreateModal();
            modal.header = "Set Deposit/Withdrawal Limits";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/set-dw-limits-modal.html';
            modal.controller = 'setDWLimitsModalCtrl';
            modal.options.actionButton = 'Save';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getPGInfo();
                }
            });
        }

        // Banking setup
        private getDetail(): void {
            this.paymentService.getBankDetails()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.bankingDetail = response.data;
                    }
                });
        }

        private addEditBank(gitem: any = null) {
            var item: any = {};
            if (gitem) angular.copy(gitem, item);

            var modal = new common.helpers.CreateModal();
            modal.header = "Add/Edit Bank";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/add-deposit-option-modal.html';
            modal.controller = 'addDepositOptionModalCtrl';
            modal.options.actionButton = 'Save';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getDetail();
                }
            });
        }

        private getDetailType(d: any) { return common.enums.DepositOptinos[d]; }

        private removeDetail(a: any) {
            this.modalService.showConfirmation("Are you sure you want to delete <b>" + a.acNo + "</b> ?")
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.paymentService.deleteBankDetails(a.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.getDetail();
                                }
                                this.toasterService.showMessages(response.messages);
                            });
                    }
                });
        }

        // deposit request
        private showDeposit() {
            this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
        }

        private getPayins(params: any): any {
            var searchQuery: any = {
                status: this.$scope.depositSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                userId: ''
            };
            if (this.$scope.depositSearch.selectedUser) {
                searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
            }
            return this.accountService.getOffPayIn({ searchQuery: searchQuery, params: params });
        }

        private getPayInStatus(s: any): any {
            return common.enums.OffPayStatus[s];
        }

        private changePayInStatus(gitem: any): void {
            var item: any = {};
            angular.copy(gitem, item);

            var modal = new common.helpers.CreateModal();
            modal.header = "Change Deposit Request Status";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/payin-status.html';
            modal.controller = 'payinStatusModalCtrl';
            modal.options.actionButton = 'Save';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.showDeposit();
                }
            });
        }

        private resetDepositCriteria(): void {
            this.$scope.depositSearch.status = { id: '', name: 'All' };
            this.$scope.depositSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.selectedUser = undefined;
            this.showDeposit();
        }

        private rollbackPayIn(item: any) {
            this.modalService.showConfirmation("Are you sure you want to rollback " + this.$filter('toRate')(item.amount) + " ?")
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.paymentService.rollbackDeposit(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.showDeposit();
                                }
                                this.toasterService.showMessages(response.messages);
                            });
                    }
                });
        }

        private exportDepositToExcel() {
            var searchQuery: any = {
                status: this.$scope.depositSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                userId: ''
            };
            if (this.$scope.depositSearch.selectedUser) {
                searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
            }
            var promise = this.accountService.getOffPayInExport(searchQuery);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    var gridData = response.data;
                    if (gridData) {
                        var table: string = '';
                        var headerTD: string = '';
                        var contentTD: string = '';
                        var contentTR: string = '';
                        gridData.forEach((g: any, index: any) => {
                            if (index == 0) {
                                headerTD += common.helpers.CommonHelper.wrapTD("User Name");
                                headerTD += common.helpers.CommonHelper.wrapTD("Mobile");
                                headerTD += common.helpers.CommonHelper.wrapTD("Amount");
                                headerTD += common.helpers.CommonHelper.wrapTD("Bonus Amount");
                                headerTD += common.helpers.CommonHelper.wrapTD("UTR");
                                headerTD += common.helpers.CommonHelper.wrapTD("A/C No");
                                headerTD += common.helpers.CommonHelper.wrapTD("Bank Name");
                                headerTD += common.helpers.CommonHelper.wrapTD("Status");
                                headerTD += common.helpers.CommonHelper.wrapTD("Comment");
                                headerTD += common.helpers.CommonHelper.wrapTD("Created On");
                                headerTD += common.helpers.CommonHelper.wrapTD("Updated On");

                                table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                            }

                            contentTD = common.helpers.CommonHelper.wrapTD(g.user.username);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.user.mobile);
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.amount));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusAmount));
                            contentTD += common.helpers.CommonHelper.wrapTD(g.utrNo);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.acNo);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.bankName);
                            contentTD += common.helpers.CommonHelper.wrapTD(this.getPayInStatus(g.status));
                            contentTD += common.helpers.CommonHelper.wrapTD(g.comment);
                            contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                            contentTD += common.helpers.CommonHelper.wrapTD(moment(g.updatedOn).format('DD/MM/YYYY HH:mm'));

                            contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                        });

                        table += common.helpers.CommonHelper.wrapTBody(contentTR);
                        table = common.helpers.CommonHelper.wrapTable(table);

                        this.ExportFactory.tableStringToExcel(table, 'Deposit Export');
                    }
                }
            });
        }

        // withdrawal request
        private getStatus(s: any): any {
            return common.enums.FairXPayOutStatus[s];
        }

        private showWithdrawal() {
            this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
        }

        private getPayouts(params: any): any {
            var searchQuery: any = {
                status: this.$scope.withdrawalSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
                userId: ''
            };
            if (this.$scope.withdrawalSearch.selectedUser) {
                searchQuery.userId = this.$scope.withdrawalSearch.selectedUser.id;
            }
            return this.accountService.getOffPayout({ searchQuery: searchQuery, params: params });
        }

        private changePayoutStatus(gitem: any): void {
            var item: any = {};
            angular.copy(gitem, item);
            item.isPinWalletEnabled = this.$scope.isPinWalletEnabled;

            var modal = new common.helpers.CreateModal();
            modal.header = "Change Withdrawal Request Status";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/payout-status.html';
            modal.controller = 'payoutStatusModalCtrl';
            modal.options.actionButton = 'Save';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.showWithdrawal();
                }
            });
        }

        private resetCriteria(): void {
            this.$scope.withdrawalSearch.status = { id: '', name: 'All' };
            this.$scope.withdrawalSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.withdrawalSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.withdrawalSearch.selectedUser = undefined;
            this.showWithdrawal();
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }

        private getReceiptImage(request: any) {
            this.accountService.getPayInOutSlip(request.imageId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
        }

        private copyText(item: any) {
            this.commonDataService.copyText(item);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied", 2000);
        }

        private copyWDetail(item: any) {
            var txt = '';
            txt = txt + 'Amount : ' + this.$filter('toRate')(item.amount) + '\n';
            txt = txt + 'A/C : ' + item.acNo + '\n';
            txt = txt + 'IFSC : ' + item.ifscCode + '\n';
            txt = txt + 'Bank : ' + item.bankName + '\n';
            txt = txt + 'Holder : ' + item.acName + '\n\n';

            txt = txt + 'Username : ' + item.user.username + ' (' + item.user.mobile + ')' + '\n';

            this.commonDataService.copyText(txt);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied", 2000);
        }

        private exportWithdrawalToExcel() {
            var searchQuery: any = {
                status: this.$scope.withdrawalSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
                userId: ''
            };
            if (this.$scope.withdrawalSearch.selectedUser) {
                searchQuery.userId = this.$scope.withdrawalSearch.selectedUser.id;
            }
            this.accountService.getOffPayOutExport(searchQuery)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table: string = '';
                            var headerTD: string = '';
                            var contentTD: string = '';
                            var contentTR: string = '';

                            gridData.forEach((g: any, index: any) => {
                                if (index == 0) {
                                    headerTD += common.helpers.CommonHelper.wrapTD("User Name");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Mobile");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Amount");
                                   
                                    headerTD += common.helpers.CommonHelper.wrapTD("A/C No");
                                    headerTD += common.helpers.CommonHelper.wrapTD("A/C Name");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Bank");
                                    headerTD += common.helpers.CommonHelper.wrapTD("IFSC");

                                    headerTD += common.helpers.CommonHelper.wrapTD("Status");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Comment");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Created On");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Updated On");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Timer");

                                    table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                                }

                                contentTD = common.helpers.CommonHelper.wrapTD(g.user.username);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.user.mobile);
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.amount));

                                contentTD += common.helpers.CommonHelper.wrapTD(g.acNo);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.acName);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.bankName);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.ifscCode);

                                contentTD += common.helpers.CommonHelper.wrapTD(this.getStatus(g.status));
                                contentTD += common.helpers.CommonHelper.wrapTD(g.comment);
                                contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                                contentTD += common.helpers.CommonHelper.wrapTD(moment(g.updatedOn).format('DD/MM/YYYY HH:mm'));

                                var diff = this.$filter('twoDateDiff')(g.createdOn, g.updatedOn);
                                contentTD += common.helpers.CommonHelper.wrapTD(diff);

                                contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                            });

                            table += common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = common.helpers.CommonHelper.wrapTable(table);

                            this.ExportFactory.tableStringToExcel(table, 'Withdrawal Export');
                        }
                    }
                });
        }

        // paymor withdrawal
        private showPaymorWithdrawal() {
            this.$scope.$broadcast('refreshGrid_kt-paymorwithdrawal-grid');
        }

        private getPaymorPayoutStatus(s: any): any {
            return common.enums.PaymorPayoutStatus[s];
        }

        private getPaymorPayout(params: any): any {
            var searchQuery: any = {
                status: this.$scope.paymorWithdrawalSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.paymorWithdrawalSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.paymorWithdrawalSearch.todate),
                userId: ''
            };
            if (this.$scope.paymorWithdrawalSearch.selectedUser) {
                searchQuery.userId = this.$scope.paymorWithdrawalSearch.selectedUser.id;
            }
            return this.accountService.getPaymorPayout({ searchQuery: searchQuery, params: params });
        }

        private resetPaymorWithdrawalCriteria(): void {
            this.$scope.paymorWithdrawalSearch.status = { id: '', name: 'All' };
            this.$scope.paymorWithdrawalSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.paymorWithdrawalSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.paymorWithdrawalSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.paymorWithdrawalSearch.selectedUser = undefined;
            this.showPaymorWithdrawal();
        }

        private copyPaymorPayoutDetail(item: any) {
            var txt = '';
            txt = txt + 'Amount : ' + this.$filter('toRate')(item.amount) + '\n';
            txt = txt + 'A/C : ' + item.accNo + '\n';
            txt = txt + 'IFSC : ' + item.ifscCode + '\n';
            txt = txt + 'Bank : ' + item.bankName + '\n';
            txt = txt + 'Holder : ' + item.name + '\n\n';
            txt = txt + 'Type : ' + item.transferType + '\n\n';

            txt = txt + 'Username : ' + item.user.username + ' (' + item.user.mobile + ')' + '\n';

            this.commonDataService.copyText(txt);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied", 2000);
        }

        private changePaymorPayoutStatus(gitem: any): void {
            var item: any = {};
            angular.copy(gitem, item);

            var modal = new common.helpers.CreateModal();
            modal.header = "Change Withdrawal Request Status";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/paymor-payout-status.html';
            modal.controller = 'paymorPayoutStatusModalCtrl';
            modal.options.actionButton = 'Save';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.showPaymorWithdrawal();
                }
            });
        }
    }
    angular.module('intranet.master').controller('offlineBankingCtrl', OfflineBankingCtrl);
}