namespace intranet.services {
    export class VertextService {
        apiURL: any;

        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
            this.apiURL = "http://173.212.223.231/fmcwebtrader/WebService.svc/{0}callback=JSON_CALLBACK";
        }


        public login(username: any, password: any): ng.IHttpPromise<any> {
            var params = "Login?username=" + username + "&password=" + password + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }


        public getOpenPositions(accountId: any): ng.IHttpPromise<any> {
            var params = "GetOpenPositions?AccountId=" + accountId + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public getAllSymbols(accountId: any, withGroups: boolean = false): ng.IHttpPromise<any> {
            var params = "GetAllSymbols?AccountId=" + accountId + "&WithGroups=" + withGroups + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }


        public getNewTick(): ng.IHttpPromise<any> {
            var params = "GetNewTick?";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public getAccountSummary(AccID: any): ng.IHttpPromise<any> {
            var params = "GetAccountSumm?AccID=" + AccID + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public getPendingOrdersWithMO(accountId: any): ng.IHttpPromise<any> {
            var params = "GetPendingOrdersWithMO?AccountId=" + accountId + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public getReflection(AccID: any): ng.IHttpPromise<any> {
            var params = "GetReflection?AccID=" + AccID + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public getHistory(AccID: any): ng.IHttpPromise<any> {
            var params = "GetHistory?AccountId=" + AccID + "&lastXdays=5&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public newOrder(AccID: any, symbolId: any, buysell: any, lots: any, notes: any): ng.IHttpPromise<any> {
            var url = "NewOrder?AccountId={0}&Symbol={1}&BuySell={2}&lots={3}&Note={4}&";
            var params = url.format(AccID, symbolId, buysell, lots, (notes ? notes : ''));
            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }

        public newLimitOrder(AccID: any, symbolId: any, LimitType: any, Price: any, Lots: any, notes: any, sl: any, tp: any): ng.IHttpPromise<any> {
            var url = "NewLimitOrder?AccountId={0}&SymID={1}&LimitType={2}&Price={3}&Lots={4}&Note={5}&";
            var params = url.format(AccID, symbolId, LimitType, Price, Lots, (notes ? notes : ''));
            if (sl) { params = params + "SL=" + sl + "&"; }
            if (tp) { params = params + "TP=" + tp + "&"; }

            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }

        public closeOrder(AccID: any, lots: any, ticketid: any): ng.IHttpPromise<any> {
            var params = "CloseOrder?AccountId=" + AccID + "&Lots=" + lots + "&TicketId=" + ticketid + "&";
            var url = this.apiURL.format(params);
            return this.baseService.outsideJsonp(url);
        }

        public updateLimitOrder(AccID: any, OrderId: any, Price: any, Lots: any, notes: any, sl: any, tp: any): ng.IHttpPromise<any> {
            var url = "UpdateLimitOrder?AccId={0}&OrderId={1}&Price={2}&Lots={3}&SL={4}&TP={5}&Note={6}&";
            var params = url.format(AccID, OrderId, Price, Lots, sl, tp, (notes ? notes : ''));
            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }

        public updateSLTP(AccID: any, OrderId: any, Lots: any, sl: any, tp: any): ng.IHttpPromise<any> {
            var url = "UpdateSLTP?AccId={0}&OrderId={1}&Lots={2}&SL={3}&TP={4}&";
            var params = url.format(AccID, OrderId, Lots, sl, tp);
            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }

        public cancelLimitOrder(AccID: any, OrderId: any): ng.IHttpPromise<any> {
            var url = "CancelLimitOrder?AccountId={0}&OrderId={1}&";
            var params = url.format(AccID, OrderId);
            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }

        public cancelSLTP(AccID: any, OrderId: any): ng.IHttpPromise<any> {
            var url = "CancelSLTP?AccountId={0}&OrderId={1}&";
            var params = url.format(AccID, OrderId);
            return this.baseService.outsideJsonp(this.apiURL.format(params));
        }
    }

    angular.module('intranet.services').service('vertextService', VertextService);
}