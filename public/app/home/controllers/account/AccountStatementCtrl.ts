
module intranet.home {
    export interface IAccountStatementScope extends intranet.common.IScopeBase {
        userid: any;
        userType: any;
        search: { fromdate: any, todate: any, accountType: any };
        gridTotalRow: any;

        headerLabel: string;
        isCurrentStatement: boolean;

        betDetailTemplate: string;
        showBetDetail: boolean;
        betDetailItems: any;
        marketname: any;
        goBackLabel: any;
        accountTypeList: any[];
    }

    export class AccountStatementCtrl extends intranet.common.ControllerBase<IAccountStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IAccountStatementScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private ExportFactory: any,
            private toasterService: common.services.ToasterService,
            private betHistoryService: services.BetHistoryService,
            private modalService: common.services.ModalService,
            private $filter: any,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userType = 0;
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                accountType: ''
            };
            this.statementModeChange();

            this.$scope.showBetDetail = false;
            this.$scope.betDetailTemplate = this.settings.ThemeName + '/template/market-pl-detail.html';
        }

        public loadInitialData(): void {
            this.getUserId();

            var acType: any = common.enums.AccountType;
            this.$scope.accountTypeList = common.helpers.Utility.enumToArray<common.enums.AccountType>(acType);
            this.$scope.accountTypeList.splice(0, 0, { id: '', name: 'All' });
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGridWithoutSorting');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getUserId(): void {
            if (this.$stateParams.memberid) { this.$scope.userid = this.$stateParams.memberid; }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                    this.$scope.userType = result.userType;
                }
            }
        }

        private getAccountStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$scope.search.accountType) { searchQuery.accountType = this.$scope.search.accountType; }

            if (this.$scope.isCurrentStatement) {
                return this.accountService.getAccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            } else {
                return this.accountService.getSettleSccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
        }

        private exportAccountStatement(): void {
            var promise: ng.IHttpPromise<any>;
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };

            if (this.$scope.isCurrentStatement) {
                promise = this.accountService.getAccountStatementExport({ searchQuery: searchQuery, id: this.$scope.userid });
            }

            if (promise) {
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
                                    headerTD += common.helpers.CommonHelper.wrapTD("Date");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Description");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Remarks");
                                    headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Credit");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Balance");
                                    table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));

                                var narration = g.narration;
                                if (g.accountType == common.enums.AccountType.CasinoPL) { narration += " # " + g.roundId; }
                                if (g.comment) { narration += " - " + g.comment; }
                                contentTD += common.helpers.CommonHelper.wrapTD(narration);

                                var remarks = '';
                                if (g.name) { remarks += g.name; }
                                if (g.remarks) { remarks += g.remarks; }
                                contentTD += common.helpers.CommonHelper.wrapTD(remarks);

                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balance));

                                if (g.accountType == common.enums.AccountType.Credit) {
                                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.creditTotal));
                                } else {
                                    contentTD += common.helpers.CommonHelper.wrapTD('');
                                }
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.total));
                                contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = common.helpers.CommonHelper.wrapTable(table);

                            this.ExportFactory.tableStringToExcel(table, 'Account Statement');
                        }
                    }
                });
            }
        }

        private statementModeChange(isCurrent: boolean = true): void {
            this.$scope.isCurrentStatement = isCurrent;
            if (isCurrent) {
                this.$scope.headerLabel = 'accountstatement.label';
                this.setDates(-2, 'M');
            } else {
                this.$scope.headerLabel = 'historical.accountstatement.label';
                this.setDates(-2, 'M');
            }
        }

        private getTransferStatement(params: any): any {
            var searchQuery: any = {
                //accountType: common.enums.AccountType.Chips,
                fromDate: common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                toDate: common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
            };
            return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private goback() {
            this.$scope.showBetDetail = false;
            this.$scope.$broadcast("refreshGrid");
        }

        private getBet(item: any): void {
            if (item.marketId) {
                item.inProgress = true;
                this.$scope.marketname = item.narration ? item.narration : item.name;
                this.$scope.goBackLabel = "Account Statement";
                var promise: any;
                if (this.$stateParams.memberid) {
                    promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId, this.$stateParams.memberid);
                }
                else {
                    promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId);
                }

                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.betDetailItems = response.data;
                    }
                }).finally(() => {item.inProgress = false; this.$scope.showBetDetail = true; });
            }
        }
       

        private getSummaryTotal(data: any[], prop: any): any {
            var total = 0;
            angular.forEach(data, (d: any) => {
                angular.forEach(d.values, (v: any) => {
                    ;
                    total += v[prop];
                })
            });
            return total;
        }

        private getProvider(p: any) { return common.enums.TableProvider[p]; }

        private removeLedger(item: any) {
            var txt = "Are you sure you want to delete below entry, <br/>" +
                "<b> P&L : </b>" + this.$filter('toRate')(item.balance) + "<br/>" +
                "<b> Total : </b>" + this.$filter('toRate')(item.total) + "<br/>" +
                "<b> Description : </b>" + item.narration + (item.comment ? '(' + item.comment + ')' : '') + "<br/>";

            if (item.name) { txt = txt + "<b> Remarks : </b>" + item.name + "<br/>"; }
            if (item.remarks && !item.provider) { txt = txt + "<b> Remarks : </b>" + item.remarks + "<br/>"; }
            else {
                if (item.provider) { txt = txt + "<b> Provider : </b>" + this.getProvider(item.provider) + "<br/>"; }
            }
            txt = txt + "<b> Date : </b>" + moment(item.createdOn).format('DD-MMM-YYYY HH:mm:ss') + "<br/>";


            this.modalService.showConfirmation(txt)
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.accountService.removeLedger(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.refreshGrid();
                                }
                                this.toasterService.showMessages(response.messages);
                            });
                    }
                });


        }
    }
    angular.module('intranet.home').controller('accountStatementCtrl', AccountStatementCtrl);
}