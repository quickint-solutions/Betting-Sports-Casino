module intranet.master {
    export interface IBetListReportScope extends intranet.common.IScopeBase {
        sharedData: any;
        gridItems: any[];
        betSides: any[];
        listNewItems: any[];
    }

    export class BetListReportCtrl extends intranet.common.ControllerBase<IBetListReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBetListReportScope,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private $filter: any,
            private modalService: common.services.ModalService,
            private ExportFactory: any,
            private commonDataService: common.services.CommonDataService,
            private betHistoryService: services.BetHistoryService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.sharedData = this.commonDataService.getShareData();
            this.$scope.betSides = [];
            this.$scope.listNewItems = [];
        }

        public loadInitialData(): void {
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

        private selectAllBets(): void {
            this.$scope.gridItems.forEach((g: any) => { if (g.isDelete == false) { g.isDeleteTemp = true; } });
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }

        private getHistoryBets(params: any): any {
            var searchQuery: any = { marketId: this.$stateParams.marketId };
            searchQuery.status = '';

            if (this.$stateParams.userId) {
                return this.betHistoryService.getBetHistoryByMarketId({ searchQuery: searchQuery, params: params, id: this.$stateParams.userId });
            } else {
                return this.betHistoryService.getBetHistoryByMarketId({ searchQuery: searchQuery, params: params });
            }
        }



        private exportBetHistoryToExcel(): any {
            var searchQuery: any = { marketId: this.$stateParams.marketId };
            searchQuery.status = '';
            var promise: any;
            if (this.$stateParams.userId) {
                promise = this.betHistoryService.getBetHistoryByMarketIdExport({ searchQuery: searchQuery, id: this.$stateParams.userId });
            } else {
                promise = this.betHistoryService.getBetHistoryByMarketIdExport({ searchQuery: searchQuery });
            }
            if (promise) {
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table: string = '';
                            var headerTD: string = '';
                            var contentTD: string = '';
                            var contentTR: string = '';

                            angular.forEach(gridData, (g: any, index: any) => {
                                if (index == 0) {
                                    headerTD += common.helpers.CommonHelper.wrapTD("Member Login Name");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Member Code");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Bet IP Address");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Sports");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Competition");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Event");
                                    headerTD += common.helpers.CommonHelper.wrapTD("MarketID");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Market");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Selection ID");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Selection");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Bet ID");
                                    headerTD += common.helpers.CommonHelper.wrapTD("1-Click");
                                    headerTD += common.helpers.CommonHelper.wrapTD("In Play");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Type");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Odds Req.");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Stake Requested");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Stake Matched");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Stake Void");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Placed");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Cancelled");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Last Matched");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Status");
                                    headerTD += common.helpers.CommonHelper.wrapTD("MEMBER Win/Loss");
                                    headerTD += common.helpers.CommonHelper.wrapTD("ReferenceText");

                                    table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                                }

                                contentTD = common.helpers.CommonHelper.wrapTD(g.user.username);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.user.userCode);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.remoteIp);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.name);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.marketId);

                                if (g.market.event.eventType == this.settings.LiveGamesId)
                                    contentTD += common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                                else
                                    contentTD += common.helpers.CommonHelper.wrapTD(g.market.name);

                                contentTD += common.helpers.CommonHelper.wrapTD(g.runnerId);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.runnerName);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.betId);
                                contentTD += common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                                contentTD += common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));

                                if (g.bettingType == 7) { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No')); }
                                else { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay')); }

                                contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                                contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeVoided));
                                contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                                contentTD += common.helpers.CommonHelper.wrapTD('');

                                if (g.betDetails && g.betDetails.length > 0) {
                                    var lastTime = g.betDetails[g.betDetails.length - 1].createdOn;
                                    contentTD += common.helpers.CommonHelper.wrapTD(moment(lastTime).format('DD/MM/YYYY HH:mm:ss'));
                                }
                                else {
                                    contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                                }

                                if (g.sizeCancelled > 0 || g.sizeVoided > 0)
                                    contentTD += common.helpers.CommonHelper.wrapTD('VOID');
                                else if (g.pl > 0)
                                    contentTD += common.helpers.CommonHelper.wrapTD('WON');
                                else
                                    contentTD += common.helpers.CommonHelper.wrapTD('LOST');

                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));
                                contentTD += common.helpers.CommonHelper.wrapTD(g.referenceText);

                                contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = common.helpers.CommonHelper.wrapTable(table);

                            this.ExportFactory.tableStringToExcel(table, 'Bet List - Settled');
                        }
                    }
                });
            }
        }

        private goback(): void { window.history.back(); }

        private cancelBet(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'common.voidbets.header';
            modal.data = {
                betId: item.id,
                voidAmount: item.sizeMatched,
                fromHistory: true
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
            modal.controller = 'voidBetsModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }
        private deleteSelectedBets(): void {
            var betsToDelete = this.$scope.gridItems.filter((g: any) => { return g.isDeleteTemp == true; });
            if (betsToDelete.length > 0) {
                var modal = new common.helpers.CreateModal();
                modal.header = 'common.voidbets.header';
                modal.data = {
                    betIds: betsToDelete.map((b: any) => { return b.id; }),
                    fromHistory: true
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                modal.controller = 'voidBetsModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
        }
    }
    angular.module('intranet.master').controller('betListReportCtrl', BetListReportCtrl);
}