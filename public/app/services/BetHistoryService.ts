module intranet.services {
    export class BetHistoryService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getHistoryBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getbethistory', data, { timeout: this.baseService.reportTime });
        }
        public getHistoryBetsExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getbethistoryexport', data, { timeout: this.baseService.reportTime });
        }
        public getHistoryBetsById(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getbethistorybyid', data, { timeout: this.baseService.reportTime });
        }

        public getProfitLoss(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getprofitloss', data, { timeout: this.baseService.reportTime });
        }
        //public getProfitLossBetById(data: any): ng.IHttpPromise<any> {
        //    return this.baseService.post('bethistory/getprofitlossbyid', data, { timeout: this.baseService.reportTime });
        //}

        public getUserActivity(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getuseractivity/' + userid);
        }

        public getplBetbyMarketIdUserId(marketId: any, userId: any = '-1'): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getbethistorybymid/' + marketId + '/' + userId, { timeout: this.baseService.reportTime });
        }

        public getBetHistoryByMarketId(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getbethistorybymarketid', data, { timeout: this.baseService.reportTime });
        }
        public getBetHistoryByMarketIdExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getbethistorybymarketidexport', data, { timeout: this.baseService.reportTime });
        }

        public getProfitlossSummary(eventtypeid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getprofitlosssummary/' + eventtypeid, { timeout: this.baseService.reportTime });
        }
        //public getProfitlossSummarybyid(userid: any, eventtypeid: any): ng.IHttpPromise<any> {
        //    return this.baseService.get('bethistory/getprofitlosssummarybyid/' + userid + '/' + eventtypeid, { timeout: this.baseService.reportTime });
        //}
        public getPLbyAgent(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getplbyagent', data, { timeout: this.baseService.reportTime });
        }
        public getPLbyAgentExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getplbyagentexport', data, { timeout: this.baseService.reportTime });
        }



        public getPLbyMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getplbymarket', data, { timeout: this.baseService.reportTime });
        }
        public getPLbyMarketExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getplbymarketexport', data, { timeout: this.baseService.reportTime });
        }

        public getPLbyMarketDetail(marketId: any, userid: any = ''): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getplbymarketdetails/' + marketId + '/' + userid, { timeout: this.baseService.reportTime });
        }

        public getSAPLbyMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getsaplbymarket', data, { timeout: this.baseService.reportTime });
        }
        public getSAPLbyMarketDetail(marketId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getsaplbymarketdetail/' + marketId, { timeout: this.baseService.reportTime });
        }

        public voidBet(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/voidbet', data);
        }
        public voidBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/voidbets', data);
        }

        public getMarketById(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bethistory/getmarketbyid/' + marketid);
        }

        public getDownlineSummary(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getdownlinesummary', data, { timeout: this.baseService.reportTime });
        }
        public getDownlineSummaryDetails(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bethistory/getdownlinesummarydetails', data, { timeout: this.baseService.reportTime });
        }
    }

    angular.module('intranet.services').service('betHistoryService', BetHistoryService);
}