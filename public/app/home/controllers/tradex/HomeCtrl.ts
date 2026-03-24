module intranet.tradex {
    export interface IHomeScope extends intranet.common.IScopeBase {
        const_watchlist: string;
        userData: any;
        funUser: any;
        symbolMenuOptions: any[];
        orderMenuOptions: any[];
        orderbookORhistory: number;
        tradeOrNetTrade: number;

        searchSymbol: string;
        fuseOptions: any;
        selectedWatch: any;
        balance: { balance: any, floatingPL: any, credit: any, usedMargin: any };

        watchList: any[];
        allSymbols: any[];
        searchedMarkets: any[];
        openPosition: any[];
        ordersList: any[];
        historyList: any[];
        netTrades: any[];

        timer_newtick: any;
        timer_reflection: any;
        timer_login: any;
        textIconMenu: any;

    }

    export class TradexHomeCtrl extends intranet.common.ControllerBase<IHomeScope>
        implements common.init.IInit {
        constructor($scope: IHomeScope,
            private vertextService: services.VertextService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private $timeout: any,
            private settings: common.IBaseSettings,
            private vertexHelper: common.helpers.VertexHelper,
            private $q: ng.IQService) {
            super($scope);

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_newtick);
                this.$timeout.cancel(this.$scope.timer_reflection);
                this.$timeout.cancel(this.$scope.timer_login);
            });

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.watchList = [];
            this.$scope.allSymbols = [];
            this.$scope.searchedMarkets = [];
            this.$scope.openPosition = [];
            this.$scope.ordersList = [];
            this.$scope.historyList = [];
            this.$scope.orderbookORhistory = 1;
            this.$scope.tradeOrNetTrade = 1;

            this.$scope.selectedWatch = 0;
            this.$scope.balance = { balance: 0, floatingPL: 0, credit: 0, usedMargin: 0 };

            this.$scope.const_watchlist = "watchlist";

            this.$scope.fuseOptions = {
                shouldSort: true,
                includeScore: false,
                threshold: 0.6,
                location: 0,
                distance: 10,
                maxPatternLength: 30,
                minMatchCharLength: 1,
                keys: [
                    "Name"
                ]
            };
        }

        public loadInitialData(): void {
            this.getUserData();
            this.watchListContextMenu();
            this.orderBookContextMenu();
        }

        private watchListContextMenu(): void {
            this.$scope.symbolMenuOptions = [
                {
                    text: 'BUY',
                    click: ((itemScope, $event) => { this.buySellSymbol(itemScope.s); })
                },
                {
                    text: 'SELL',
                    click: ((itemScope, $event) => { this.buySellSymbol(itemScope.s, false); })
                },
                {
                    text: 'DELETE',
                    click: ((itemScope, $event) => { this.removeFromWatch(itemScope.s); })
                }
            ];
        }

        private orderBookContextMenu(): void {
            this.$scope.orderMenuOptions = [
                {
                    text: 'Manage Order',
                    click: ((itemScope, $event) => { this.managePendingOrder(itemScope.o); })
                },
                {
                    text: 'Cancel',
                    click: ((itemScope, $event) => { this.cancelPendingOrder(itemScope.o); })
                }
            ];
        }



        // login and user data methods
        private getUserData(): void {
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result) {
                this.$scope.funUser = result.user;
                this.$timeout(() => { this.afterLogin(); }, 200);
            }
        }

        private keepAlive(): void {
            if (this.$scope.timer_login) { this.$timeout.cancel(this.$scope.timer_login); }
            this.login().finally(() => {
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_login = this.$timeout(() => { this.keepAlive(); }, 60000 * 5);
                }
            });
        }

        private login(): ng.IPromise<any> {
            var defer = this.$q.defer();
            this.vertextService.login(this.$scope.funUser.username, this.$scope.funUser.username).success((response: any) => {
                //this.vertextService.login("baba94", "9494").success((response: any) => {
                if (this.vertexHelper.validate(response) && response.sessionid) {
                    this.$scope.userData = response;
                    this.localStorageHelper.set(this.settings.VertexUser, response);
                    defer.resolve(response);
                } else {
                    defer.reject();
                }
            }).error((error: any) => { defer.reject(); });
            return defer.promise;
        }

        private afterLogin(): void {
            this.login().then((response: any) => {
                this.$timeout(() => { this.getAllSymbols(); }, 100);
                this.$timeout(() => { this.getReflections(); }, 5000);
                this.$timeout(() => { this.keepAlive(); }, 60000 * 5);
            });
        }


        // get all symbols  and prices
        private getAllSymbols(): void {
            this.vertextService.getAllSymbols(this.$scope.userData.SelectedAccount).success((response: any) => {
                this.$scope.allSymbols = response;
                this.loadWatchList();
                this.getAccountSummary();
                this.getPositions();
                this.getPendingOrders();
                this.refreshPrice();
            });
        }

        private refreshPrice(): void {
            if (this.$scope.timer_newtick) { this.$timeout.cancel(this.$scope.timer_newtick); }
            var self = this;

            var updateWatchPrice = ((updatedPrice: any) => {
                self.$scope.allSymbols.forEach((s: any) => {
                    updatedPrice.Symbols.forEach((u: any) => {
                        if (s.ID == u.I) {
                            s.Bid = u.B; s.Ask = u.A; s.High = u.H; s.Low = u.L;
                            s.LastQuoteTime = updatedPrice.TickTime;
                        }
                    });
                });
            });

            this.vertextService.getNewTick()
                .success((response: any) => {
                    if (this.vertexHelper.validate(response) && response.Symbols.length > 0) {
                        updateWatchPrice(response);
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_newtick = this.$timeout(() => { this.refreshPrice(); }, 1000);
                    }
                });
        }


        // reflection
        private getReflections(): void {
            if (this.$scope.timer_reflection) { this.$timeout.cancel(this.$scope.timer_reflection); }
            this.vertextService.getReflection(this.$scope.userData.SelectedAccount)
                .success((response: any) => {
                    this.reflectionEffect(response);
                })
                .finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_reflection = this.$timeout(() => { this.getReflections(); }, 1000);
                    }
                });
        }

        private reflectionEffect(response: any): void {
            if (this.vertexHelper.validate(response)) {
                var open_position = [1, 3, 4, 7, 11, 14, 15, 16, 18, 19, 20, 23, 26, 27];
                var account_summary = [1, 3, 4, 7, 8, 11, 13, 14, 15, 16, 18, 19, 20, 23, 26, 27];
                var pending_order = [1, 7, 11, 14, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
                response.AccountRef.forEach((a: any) => {
                    if (a != null) {
                        a = parseInt(a);
                        if (open_position.indexOf(a) > -1) { this.getPositions(); }
                        if (account_summary.indexOf(a) > -1) { this.getAccountSummary(); }
                        if (pending_order.indexOf(a) > -1) { this.getPendingOrders(); }
                    }
                });
            }
        }


        // open position book
        private getPositions(): void {
            this.vertextService.getOpenPositions(this.$scope.userData.SelectedAccount).success((response: any) => {
                if (this.vertexHelper.validate(response) && response.length > 0) {
                    if (response.length == 1) {
                        if (response[0].ID < 0) { response.splice(0); }
                    }
                    response.forEach((p: any) => {
                        var index = common.helpers.Utility.IndexOfObject(this.$scope.allSymbols, 'ID', p.Symbol);
                        if (index > -1) {
                            p.SMB = this.$scope.allSymbols[index];
                        }
                    });
                }
                this.$scope.openPosition = response;
            });
        }

        private getNetTrade(): void {
            this.vertextService.getOpenPositions(this.$scope.userData.SelectedAccount).success((response: any) => {
                if (this.vertexHelper.validate(response) && response.length > 0) {
                    if (response.length == 1) {
                        if (response[0].ID < 0) { response.splice(0); }
                    }
                    var nettrade = this.vertexHelper.groupPosition(response);
                    nettrade.forEach((p: any) => {
                        var index = common.helpers.Utility.IndexOfObject(this.$scope.allSymbols, 'ID', p.Symbol);
                        if (index > -1) {
                            p.SMB = this.$scope.allSymbols[index];
                        }
                    });
                }
                this.$scope.netTrades = nettrade;
            });
        }

        private closeOpenPosition(): void {
            var close = this.$scope.openPosition.filter((o: any) => { return o.selected == true; });
            if (close.length > 0) {
                close.forEach((c: any, index: any) => {
                    this.vertextService.closeOrder(this.$scope.userData.SelectedAccount, c.Amount, c.ID)
                        .success((response: any) => {
                            if (this.vertexHelper.validate(response)) {
                                this.toasterService.showToast(common.helpers.ToastType.Success, 'Position closed successfully', 3000);
                            }
                        }).finally(() => {
                            if (index + 1 == close.length) {
                                this.getPositions();
                                this.getHistory();
                            }
                        });
                });
            }
            else {
                this.toasterService.showToast(common.helpers.ToastType.Warning, 'Please select position', 3000);
            }
        }

        private tradeOrNetTradeChanged(selected: any): void {
            this.$scope.tradeOrNetTrade = selected;
            if (selected == 1) {
                this.getPositions();
            }
            else if (selected == 2) {
                this.getNetTrade();
            }
        }

        // order book and history
        private getPendingOrders(): void {
            this.vertextService.getPendingOrdersWithMO(this.$scope.userData.SelectedAccount)
                .success((response: any) => {
                    if (this.vertexHelper.validate(response)) {
                        response.forEach((p: any) => {
                            var index = common.helpers.Utility.IndexOfObject(this.$scope.allSymbols, 'ID', p.Symbol);
                            if (index > -1) {
                                p.SMB = this.$scope.allSymbols[index];
                            }
                        });
                        this.$scope.ordersList = response;
                    }
                });
        }

        private getHistory(): void {
            this.vertextService.getHistory(this.$scope.userData.SelectedAccount)
                .success((response: any) => {
                    if (this.vertexHelper.validate(response)) {
                        this.vertexHelper.setHistoryType(response);
                        this.$scope.historyList = response;
                    }
                });
        }

        private orderOrHistoryChanged(selected: any): void {
            this.$scope.orderbookORhistory = selected;
            if (selected == 1) {
                this.getPendingOrders();
            }
            else if (selected == 2) {
                this.getHistory();
            }
        }

        private managePendingOrder(order: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.event.add.modal.header';
            modal.data = {
                order: order
            };
            modal.templateUrl = this.settings.ThemeName + '/template/tradex-modal.html'
            modal.bodyUrl = this.settings.ThemeName + '/home/tradex/manage-modal.html';
            modal.controller = 'tradexManageModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getPositions();
                    this.getAccountSummary();
                }
                this.getPendingOrders();
            });
        }

        private cancelPendingOrder(order: any): void {
            var promise: ng.IHttpPromise<any>;
            if (!order.ManagedTKTID) {
                promise = this.vertextService.cancelLimitOrder(this.$scope.userData.SelectedAccount, order.ID)
            }
            else {
                promise = this.vertextService.cancelSLTP(this.$scope.userData.SelectedAccount, order.ID)
            }
            if (promise) {
                promise.success((response: any) => {
                    if (this.vertexHelper.validate(response)) {
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'Order cancelled successfully', 3000);
                        this.getPendingOrders();
                    }
                });
            }
        }


        // get balance
        private getAccountSummary(): void {
            this.vertextService.getAccountSummary(this.$scope.userData.SelectedAccount)
                .success((response: any) => {
                    if (response && response.length > 0) {
                        this.$scope.balance.balance = math.add(response[2], response[0]);
                        this.$scope.balance.usedMargin = math.abs(response[1]);
                        this.$scope.balance.credit = math.number(response[4]);
                    }
                });
        }


        // watch list's market
        private searchMarket(): void {
            if (this.$scope.searchSymbol.length > 0 && this.$scope.allSymbols.length > 0) {
                var fuse = new Fuse(this.$scope.allSymbols, this.$scope.fuseOptions);
                this.$scope.searchedMarkets = fuse.search(this.$scope.searchSymbol);
                if (this.$scope.searchedMarkets.length > 10) {
                    this.$scope.searchedMarkets.splice(10, this.$scope.searchedMarkets.length - 1);
                }
                if (this.$scope.watchList[this.$scope.selectedWatch].symbols.length > 0 && this.$scope.searchedMarkets.length > 0) {
                    this.$scope.searchedMarkets.forEach((sr: any) => {
                        this.$scope.watchList[this.$scope.selectedWatch].symbols.forEach((w: any) => {
                            if (sr.ID == w.ID) { sr.existing = true; }
                        });
                    });
                }
            } else { this.$scope.searchedMarkets.splice(0); }
        }

        private addToWatch(symbol: any): void {
            this.$scope.watchList[this.$scope.selectedWatch].symbols.push(symbol);
            symbol.existing = true;
            this.localStorageHelper.set(this.$scope.const_watchlist, this.$scope.watchList);
        }

        private removeFromWatch(symbol: any): void {
            var index = common.helpers.Utility.IndexOfObject(this.$scope.watchList[this.$scope.selectedWatch].symbols, 'ID', symbol.ID);
            if (index > -1) {
                this.$scope.watchList[this.$scope.selectedWatch].symbols.splice(index, 1);
                symbol.existing = false;
                this.localStorageHelper.set(this.$scope.const_watchlist, this.$scope.watchList);
            }
        }


        // wathc list
        private loadWatchList(): void {
            this.$scope.const_watchlist = "watchlist_" + this.$scope.userData.UserId;
            var watchlist = this.localStorageHelper.get(this.$scope.const_watchlist);
            if (watchlist && watchlist.length > 0) {
                watchlist.forEach((w: any) => {
                    var ids = w.symbols.map((s: any) => { return s.ID; });
                    w.symbols.splice(0);
                    ids.forEach((i: any) => {
                        var index = common.helpers.Utility.IndexOfObject(this.$scope.allSymbols, 'ID', i);
                        if (index > -1) { w.symbols.push(this.$scope.allSymbols[index]); }
                    });
                });

                this.$scope.watchList = watchlist;
            } else {
                this.$scope.watchList.splice(0, 0, { name: 'Popular', symbols: [] });
            }
        }

        private selectedWatchChanged(index: any): void {
            this.$scope.selectedWatch = index;
        }

        private addWatchList(name: string): void {
            if (name.length > 0) {
                this.$scope.watchList.push({ name: name, symbols: [] });
                this.localStorageHelper.set(this.$scope.const_watchlist, this.$scope.watchList);
            }
        }

        private editWatchList(index: any, name: string): void {
            if (name.length > 0) {
                this.$scope.watchList[index].name = name;
                this.$scope.watchList[index].editMode = false;
                this.localStorageHelper.set(this.$scope.const_watchlist, this.$scope.watchList);
            }
        }

        private deleteWatchList(index: number): void {
            if (this.$scope.watchList.length > index) {
                this.$scope.watchList.splice(index, 1);
                this.localStorageHelper.set(this.$scope.const_watchlist, this.$scope.watchList);
            }
        }

        // BUY modal
        private buySellSymbol(s: any, isbuy: boolean = true): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'buysell.modal.header';
            modal.data = {
                symbol: s,
                transactionType: (isbuy ? 1 : -1)
            };
            modal.templateUrl = this.settings.ThemeName + '/template/tradex-modal.html'
            modal.bodyUrl = this.settings.ThemeName + '/home/tradex/buy-sell-modal.html';
            modal.controller = 'tradexBuySellModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getAccountSummary();
                    this.getPositions();
                    this.getPendingOrders();
                }
            });
        }
    }

    angular.module('intranet.tradex').controller('tradexHomeCtrl', TradexHomeCtrl);
}