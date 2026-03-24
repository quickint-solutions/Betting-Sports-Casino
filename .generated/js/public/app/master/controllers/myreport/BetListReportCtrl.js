var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class BetListReportCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, settings, $filter, modalService, ExportFactory, commonDataService, betHistoryService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.$filter = $filter;
                this.modalService = modalService;
                this.ExportFactory = ExportFactory;
                this.commonDataService = commonDataService;
                this.betHistoryService = betHistoryService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.sharedData = this.commonDataService.getShareData();
                this.$scope.betSides = [];
                this.$scope.listNewItems = [];
            }
            loadInitialData() {
                this.$scope.betSides.push({ id: 1, name: 'Back' });
                this.$scope.betSides.push({ id: 2, name: 'Lay' });
                this.$scope.listNewItems.push({
                    func: () => this.selectAllBets(),
                    name: 'Select All Bets',
                    cssClass: 'fa fa-check-square-o'
                });
                this.$scope.listNewItems.push({
                    func: () => this.deleteSelectedBets(),
                    name: 'Delete All',
                    cssClass: 'fa fa-trash'
                });
                this.$scope.listNewItems.push({
                    func: () => this.exportBetHistoryToExcel(),
                    name: 'Export',
                    cssClass: 'fa fa-file-excel-o'
                });
            }
            selectAllBets() {
                this.$scope.gridItems.forEach((g) => { if (g.isDelete == false) {
                    g.isDeleteTemp = true;
                } });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            getHistoryBets(params) {
                var searchQuery = { marketId: this.$stateParams.marketId };
                searchQuery.status = '';
                if (this.$stateParams.userId) {
                    return this.betHistoryService.getBetHistoryByMarketId({ searchQuery: searchQuery, params: params, id: this.$stateParams.userId });
                }
                else {
                    return this.betHistoryService.getBetHistoryByMarketId({ searchQuery: searchQuery, params: params });
                }
            }
            exportBetHistoryToExcel() {
                var searchQuery = { marketId: this.$stateParams.marketId };
                searchQuery.status = '';
                var promise;
                if (this.$stateParams.userId) {
                    promise = this.betHistoryService.getBetHistoryByMarketIdExport({ searchQuery: searchQuery, id: this.$stateParams.userId });
                }
                else {
                    promise = this.betHistoryService.getBetHistoryByMarketIdExport({ searchQuery: searchQuery });
                }
                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            var gridData = response.data;
                            if (gridData) {
                                var table = '';
                                var headerTD = '';
                                var contentTD = '';
                                var contentTR = '';
                                angular.forEach(gridData, (g, index) => {
                                    if (index == 0) {
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member Login Name");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member Code");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet IP Address");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Sports");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Competition");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Event");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("MarketID");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Market");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection ID");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet ID");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("1-Click");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("In Play");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Type");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Odds Req.");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Requested");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Matched");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Void");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Placed");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Cancelled");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Last Matched");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("MEMBER Win/Loss");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("ReferenceText");
                                        table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                    }
                                    contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.userCode);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.remoteIp);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.name);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.marketId);
                                    if (g.market.event.eventType == this.settings.LiveGamesId)
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                                    else
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerId);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerName);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.betId);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));
                                    if (g.bettingType == 7) {
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No'));
                                    }
                                    else {
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay'));
                                    }
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeVoided));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD('');
                                    if (g.betDetails && g.betDetails.length > 0) {
                                        var lastTime = g.betDetails[g.betDetails.length - 1].createdOn;
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(lastTime).format('DD/MM/YYYY HH:mm:ss'));
                                    }
                                    else {
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                                    }
                                    if (g.sizeCancelled > 0 || g.sizeVoided > 0)
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD('VOID');
                                    else if (g.pl > 0)
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD('WON');
                                    else
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD('LOST');
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.referenceText);
                                    contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                                });
                                table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                                table = intranet.common.helpers.CommonHelper.wrapTable(table);
                                this.ExportFactory.tableStringToExcel(table, 'Bet List - Settled');
                            }
                        }
                    });
                }
            }
            goback() { window.history.back(); }
            cancelBet(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'common.voidbets.header';
                modal.data = {
                    betId: item.id,
                    voidAmount: item.sizeMatched,
                    fromHistory: true
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                modal.controller = 'voidBetsModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            deleteSelectedBets() {
                var betsToDelete = this.$scope.gridItems.filter((g) => { return g.isDeleteTemp == true; });
                if (betsToDelete.length > 0) {
                    var modal = new intranet.common.helpers.CreateModal();
                    modal.header = 'common.voidbets.header';
                    modal.data = {
                        betIds: betsToDelete.map((b) => { return b.id; }),
                        fromHistory: true
                    };
                    modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                    modal.controller = 'voidBetsModalCtrl';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                        if (result.button == intranet.common.services.ModalResult.OK) {
                            this.refreshGrid();
                        }
                    });
                }
            }
        }
        master.BetListReportCtrl = BetListReportCtrl;
        angular.module('intranet.master').controller('betListReportCtrl', BetListReportCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetListReportCtrl.js.map