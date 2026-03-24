var intranet;
(function (intranet) {
    var common;
    (function (common) {
        class ControllerBase {
            constructor($scope) {
                this.$scope = $scope;
                this.initBase();
            }
            initBase() {
                this.$scope.ctrl = this;
                this.$rootScope = this.$scope.$root;
            }
            init(currentInstance) {
                if (currentInstance.initScopeValues) {
                    currentInstance.initScopeValues();
                }
                if (currentInstance.loadInitialData) {
                    currentInstance.loadInitialData();
                }
            }
            getUserTypes() {
                var userTypes = [];
                userTypes.push({ id: common.enums.UserType.SuperAdmin, name: 'SA', short: 'SA', plFieldName: 'superAdminPl' });
                userTypes.push({ id: common.enums.UserType.Admin, name: 'AD', short: 'AD', ptFieldName: 'adminPt', plFieldName: 'adminPl' });
                userTypes.push({ id: common.enums.UserType.SuperMaster, name: 'SM', short: 'CUS', init: 'CUS', color: '#ec1c24', ptFieldName: 'superMasterPt', plFieldName: 'superMasterPl', maxField: 'superMasterMaxCredit', minField: 'totalSuperMasterCredit' });
                userTypes.push({ id: common.enums.UserType.Master, name: 'MA', short: 'MA', init: 'MA', color: '#1b51b2', ptFieldName: 'masterPt', plFieldName: 'masterPl', maxField: 'masterMaxCredit', minField: 'totalMasterCredit' });
                userTypes.push({ id: common.enums.UserType.Agent, name: 'AG', short: 'Agent', init: 'A', color: '#3ed1ce', ptFieldName: 'agentPt', plFieldName: 'agentPl', maxField: 'agentMaxCredit', minField: 'totalAgentCredit' });
                userTypes.push({ id: common.enums.UserType.Player, name: 'PL', short: 'Member', init: 'M', color: '#ffcb1c', maxField: 'memberMaxCredit', minField: 'totalPlayerCredit' });
                userTypes.push({ id: common.enums.UserType.PLS, name: 'PLS' });
                userTypes.push({ id: common.enums.UserType.BM, name: 'BM' });
                userTypes.push({ id: common.enums.UserType.SBM, name: 'SBM' });
                userTypes.push({ id: common.enums.UserType.Manager, name: 'MGR' });
                userTypes.push({ id: common.enums.UserType.CP, name: 'CP' });
                return userTypes;
            }
            getUserTypesShort(id) {
                var userTypes = [];
                userTypes = this.getUserTypes();
                var rr = userTypes.filter((f) => { return f.id == id; }) || [];
                if (rr.length > 0) {
                    return rr[0].short;
                }
                return '';
            }
            getUserTypesObj(id) {
                var userTypes = [];
                userTypes = this.getUserTypes();
                var rr = userTypes.filter((f) => { return f.id == id; }) || [];
                if (rr.length > 0) {
                    return rr[0];
                }
                return '';
            }
            getUserTypeForPT(id) {
                var userTypes = [];
                angular.forEach(this.getUserTypes(), (u) => {
                    if (u.id >= id && u.id <= common.enums.UserType.Agent) {
                        userTypes.push(u);
                    }
                });
                return userTypes;
            }
            setOddsInMarket(market, r, setpl = true) {
                if (setpl)
                    market.pl = r.pl;
                market.totalMatched = r.tm;
                market.inPlay = r.ip;
                market.marketStatus = r.ms;
                market.temporaryStatus = r.ts;
                market.winner = r.wnr;
                r.mr.forEach((value, index) => {
                    market.marketRunner[index].status = value.rs;
                    market.marketRunner[index].backPrice = value.bp;
                    market.marketRunner[index].layPrice = value.lp;
                });
                this.setSessionPrice(market);
            }
            setSessionPrice(market) {
                if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE) {
                    var mtr = market.marketRunner[0];
                    if ((!mtr.backPrice || mtr.backPrice.length <= 0)
                        && (!mtr.layPrice || mtr.layPrice.length <= 0)
                        && (!market.mr || !market.mr.priceLength)) {
                        market.mr = common.helpers.CommonHelper.setSessionPrice(market.marketRunner[0]);
                        market.mr.priceLength = this.getPriceLength(market.mr.backPrice.length);
                    }
                    else if (mtr.backPrice.length > 0 || mtr.layPrice.length > 0) {
                        var len = mtr.backPrice.length > mtr.layPrice.length ? mtr.backPrice.length : mtr.layPrice.length;
                        market.mr = mtr;
                        market.mr.priceLength = this.getPriceLength(len);
                    }
                }
            }
            getPriceLength(length) {
                var arr = [];
                for (var i = 1; i <= length; i++) {
                    arr.push(i);
                }
                return arr;
            }
            setSymbolTickData(data, lst, selected) {
                if (data && data.data) {
                    var d = JSON.parse(data.data);
                    var symbol;
                    var symbols = lst.filter((s) => { return s.code == d.s; }) || [];
                    if (symbols.length == 0 && selected.code == d.s) {
                        symbol = selected;
                    }
                    if (symbols.length > 0) {
                        symbol = symbols[0];
                        symbol.prevLastPrice = symbol.lastPrice;
                        symbol.askQty = d.A;
                        symbol.bidQty = d.B;
                        symbol.closeTime = d.C;
                        symbol.eventTime = d.E;
                        symbol.firstTradeId = d.F;
                        symbol.lastTradeId = d.L;
                        symbol.openTime = d.O;
                        symbol.priceChangePercentage = d.P;
                        symbol.lastQty = d.Q;
                        symbol.askPrice = d.a;
                        symbol.bidPrice = d.b;
                        symbol.lastPrice = d.c;
                        symbol.event = d.e;
                        symbol.highPrice = d.h;
                        symbol.lowPrice = d.l;
                        symbol.totalTrades = d.n;
                        symbol.openPrice = d.o;
                        symbol.priceChange = d.p;
                        symbol.quoteVolume = d.q;
                        symbol.symbol = d.s;
                        symbol.baseVolume = d.v;
                        symbol.weightedAvgPrice = d.w;
                        symbol.prevDayClosePrice = d.x;
                        symbol.class = (symbol.lastPrice == symbol.prevLastPrice ? 'tradex-stable' : (symbol.lastPrice < symbol.prevLastPrice ? 'tradex-red' : 'tradex-green'));
                        if (selected.code == d.s) {
                            if (symbol.symbol == d.s.toUpperCase()) {
                                if (!symbol.tradeList)
                                    symbol.tradeList = [];
                                var tt = {};
                                tt.price = d.c;
                                tt.size = d.Q;
                                tt.time = new Date(d.E);
                                tt.class = symbol.lastPrice < symbol.prevLastPrice ? 'tradex-red' : 'tradex-green';
                                symbol.tradeList.splice(0, 0, tt);
                                if (symbol.tradeList.length >= 20) {
                                    symbol.tradeList.pop();
                                }
                            }
                        }
                    }
                }
            }
            setSymbolMarkPriceData(data, symbol) {
                if (data && data.data) {
                    var d = JSON.parse(data.data);
                    if (symbol.code == d.s) {
                        symbol.markPrice = d.p;
                        symbol.index = d.i;
                        symbol.estimateSettlePrice = d.P;
                        symbol.fundingRate = d.r;
                        symbol.nextFundingTime = d.T;
                    }
                }
            }
            setSymbolDepthData(data, symbol) {
                if (data && data.data) {
                    var d = JSON.parse(data.data);
                    if (symbol.code == d.s.toUpperCase()) {
                        symbol.askPriceList = d.a;
                        symbol.bidPriceList = d.b;
                        this.setOrderBookPrice(symbol.askPriceList);
                        this.setOrderBookPrice(symbol.bidPriceList);
                        this.setPercentage(symbol.askPriceList);
                        this.setPercentage(symbol.bidPriceList);
                        symbol.askPriceList.reverse();
                    }
                }
            }
            setSymbolTradeData(data, symbol) {
                if (data && data.data) {
                    var d = JSON.parse(data.data);
                    console.log(d.f + ' -> ' + d.l + ' -> ' + d.a);
                    if (symbol.code == d.s.toUpperCase()) {
                        if (!symbol.tradeList)
                            symbol.tradeList = [];
                        var tt = {};
                        tt.price = d.p;
                        tt.size = d.q;
                        tt.time = new Date(d.T);
                        tt.class = d.m == true ? 'tradex-red' : 'tradex-green';
                        symbol.tradeList.splice(0, 0, tt);
                        if (symbol.tradeList.length >= 20) {
                            symbol.tradeList.pop();
                        }
                    }
                }
            }
            setOrderBookPrice(priceList) {
                angular.forEach(priceList, (b, index) => {
                    b.price = b[0];
                    b.size = b[1];
                    b.sum = b.size;
                    if (index > 0) {
                        b.sum = math.add(b.size, priceList[index - 1].sum);
                    }
                });
            }
            setPercentage(list) {
                var base = list[list.length - 1];
                base.percent = -100;
                for (var i = list.length - 1; i >= 0; i--) {
                    if (i < list.length - 1) {
                        list[i].percent = math.multiply(math.round(math.divide((list[i].sum * 100), base.sum), 2), -1);
                    }
                }
            }
        }
        common.ControllerBase = ControllerBase;
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ControllerBase.js.map