var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class VertextService {
            constructor(baseService) {
                this.baseService = baseService;
                this.apiURL = "http://173.212.223.231/fmcwebtrader/WebService.svc/{0}callback=JSON_CALLBACK";
            }
            login(username, password) {
                var params = "Login?username=" + username + "&password=" + password + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getOpenPositions(accountId) {
                var params = "GetOpenPositions?AccountId=" + accountId + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getAllSymbols(accountId, withGroups = false) {
                var params = "GetAllSymbols?AccountId=" + accountId + "&WithGroups=" + withGroups + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getNewTick() {
                var params = "GetNewTick?";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getAccountSummary(AccID) {
                var params = "GetAccountSumm?AccID=" + AccID + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getPendingOrdersWithMO(accountId) {
                var params = "GetPendingOrdersWithMO?AccountId=" + accountId + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getReflection(AccID) {
                var params = "GetReflection?AccID=" + AccID + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            getHistory(AccID) {
                var params = "GetHistory?AccountId=" + AccID + "&lastXdays=5&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            newOrder(AccID, symbolId, buysell, lots, notes) {
                var url = "NewOrder?AccountId={0}&Symbol={1}&BuySell={2}&lots={3}&Note={4}&";
                var params = url.format(AccID, symbolId, buysell, lots, (notes ? notes : ''));
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
            newLimitOrder(AccID, symbolId, LimitType, Price, Lots, notes, sl, tp) {
                var url = "NewLimitOrder?AccountId={0}&SymID={1}&LimitType={2}&Price={3}&Lots={4}&Note={5}&";
                var params = url.format(AccID, symbolId, LimitType, Price, Lots, (notes ? notes : ''));
                if (sl) {
                    params = params + "SL=" + sl + "&";
                }
                if (tp) {
                    params = params + "TP=" + tp + "&";
                }
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
            closeOrder(AccID, lots, ticketid) {
                var params = "CloseOrder?AccountId=" + AccID + "&Lots=" + lots + "&TicketId=" + ticketid + "&";
                var url = this.apiURL.format(params);
                return this.baseService.outsideJsonp(url);
            }
            updateLimitOrder(AccID, OrderId, Price, Lots, notes, sl, tp) {
                var url = "UpdateLimitOrder?AccId={0}&OrderId={1}&Price={2}&Lots={3}&SL={4}&TP={5}&Note={6}&";
                var params = url.format(AccID, OrderId, Price, Lots, sl, tp, (notes ? notes : ''));
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
            updateSLTP(AccID, OrderId, Lots, sl, tp) {
                var url = "UpdateSLTP?AccId={0}&OrderId={1}&Lots={2}&SL={3}&TP={4}&";
                var params = url.format(AccID, OrderId, Lots, sl, tp);
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
            cancelLimitOrder(AccID, OrderId) {
                var url = "CancelLimitOrder?AccountId={0}&OrderId={1}&";
                var params = url.format(AccID, OrderId);
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
            cancelSLTP(AccID, OrderId) {
                var url = "CancelSLTP?AccountId={0}&OrderId={1}&";
                var params = url.format(AccID, OrderId);
                return this.baseService.outsideJsonp(this.apiURL.format(params));
            }
        }
        services.VertextService = VertextService;
        angular.module('intranet.services').service('vertextService', VertextService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VertexService.js.map