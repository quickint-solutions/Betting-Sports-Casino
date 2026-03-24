namespace intranet.services {
    export class MarketService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getMarketList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market', data);
        }
        public addMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/addmarket', data);
        }
        public updateMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/updatemarket', data);
        }
        public deleteMarket(marketId: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/deletemarket/' + marketId);
        }
        public getMarketType(): ng.IHttpPromise<any> {
            return this.baseService.get('market/getallmarkettype');
        }
        public changeInPlay(id: any, inplay: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/changeinplay/' + id + '/' + inplay);
        }
        public changeStatus(id: any, status: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/changestatus/' + id + '/' + status);
        }
        public changeSyncData(id: any, syncData: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/changesyncdata/' + id + '/' + syncData);
        }
        public changeTemporaryStatus(id: any, status: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/changetemporarystatus/' + id + '/' + status);
        }


        public closeMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/closemarket', data);
        }

        public recloseMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/reclosemarket', data);
        }


        public searchMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/searchmarket', data);
        }

        public searchMarketByEventName(eventname: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/getmarketbyeventname/' + eventname);
        }

        public getMarketByEventId(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('market/getmarketbyeventid/' + eventId);
        }

        public changeMarketParams(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/changemarketparam', data);
        }

        public getRecentClose(eventTypeIds: any = []): ng.IHttpPromise<any> {
            return this.baseService.get('market/getrecentclose/' + eventTypeIds.join(','));
        }

        public getRecentCloseByEvent(eventId: any, count: number = 15): ng.IHttpPromise<any> {
            return this.baseService.get('market/getrecentclosebyevent/' + eventId + '/' + count);
        }

        public getLiveGameMultiplier(): ng.IHttpPromise<any> {
            return this.baseService.get('market/getlivegamemultiplier');
        }

        public setNotification(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/setnotification', data);
        }

        public changeMultiTempStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/changemultits', data);
        }

        public changeMultiMarketStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/changemultistatus', data);
        }


        public getMarketTypeMapping(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/getmarkettypemapping', data);
        }
        public getAllMarketTypeMapping(): ng.IHttpPromise<any> {
            return this.baseService.get('market/getAllmarkettypemapping');
        }
        public addMarketTypeMapping(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/addmarkettypemapping', data);
        }
        public updateMarketTypeMapping(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/updatemarkettypemapping', data);
        }

        public updateSettleMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('market/updatesettlemarket', data);
        }
    }
    angular.module('intranet.services').service('marketService', MarketService);
}