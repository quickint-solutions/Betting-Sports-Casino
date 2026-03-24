var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class BetHistoryService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getHistoryBets(data) {
                return this.baseService.post('bethistory/getbethistory', data, { timeout: this.baseService.reportTime });
            }
            getHistoryBetsExport(data) {
                return this.baseService.post('bethistory/getbethistoryexport', data, { timeout: this.baseService.reportTime });
            }
            getHistoryBetsById(data) {
                return this.baseService.post('bethistory/getbethistorybyid', data, { timeout: this.baseService.reportTime });
            }
            getProfitLoss(data) {
                return this.baseService.post('bethistory/getprofitloss', data, { timeout: this.baseService.reportTime });
            }
            getUserActivity(userid) {
                return this.baseService.get('bethistory/getuseractivity/' + userid);
            }
            getplBetbyMarketIdUserId(marketId, userId = '-1') {
                return this.baseService.get('bethistory/getbethistorybymid/' + marketId + '/' + userId, { timeout: this.baseService.reportTime });
            }
            getBetHistoryByMarketId(data) {
                return this.baseService.post('bethistory/getbethistorybymarketid', data, { timeout: this.baseService.reportTime });
            }
            getBetHistoryByMarketIdExport(data) {
                return this.baseService.post('bethistory/getbethistorybymarketidexport', data, { timeout: this.baseService.reportTime });
            }
            getProfitlossSummary(eventtypeid) {
                return this.baseService.get('bethistory/getprofitlosssummary/' + eventtypeid, { timeout: this.baseService.reportTime });
            }
            getPLbyAgent(data) {
                return this.baseService.post('bethistory/getplbyagent', data, { timeout: this.baseService.reportTime });
            }
            getPLbyAgentExport(data) {
                return this.baseService.post('bethistory/getplbyagentexport', data, { timeout: this.baseService.reportTime });
            }
            getPLbyMarket(data) {
                return this.baseService.post('bethistory/getplbymarket', data, { timeout: this.baseService.reportTime });
            }
            getPLbyMarketExport(data) {
                return this.baseService.post('bethistory/getplbymarketexport', data, { timeout: this.baseService.reportTime });
            }
            getPLbyMarketDetail(marketId, userid = '') {
                return this.baseService.get('bethistory/getplbymarketdetails/' + marketId + '/' + userid, { timeout: this.baseService.reportTime });
            }
            getSAPLbyMarket(data) {
                return this.baseService.post('bethistory/getsaplbymarket', data, { timeout: this.baseService.reportTime });
            }
            getSAPLbyMarketDetail(marketId) {
                return this.baseService.get('bethistory/getsaplbymarketdetail/' + marketId, { timeout: this.baseService.reportTime });
            }
            voidBet(data) {
                return this.baseService.post('bethistory/voidbet', data);
            }
            voidBets(data) {
                return this.baseService.post('bethistory/voidbets', data);
            }
            getMarketById(marketid) {
                return this.baseService.get('bethistory/getmarketbyid/' + marketid);
            }
            getDownlineSummary(data) {
                return this.baseService.post('bethistory/getdownlinesummary', data, { timeout: this.baseService.reportTime });
            }
            getDownlineSummaryDetails(data) {
                return this.baseService.post('bethistory/getdownlinesummarydetails', data, { timeout: this.baseService.reportTime });
            }
        }
        services.BetHistoryService = BetHistoryService;
        angular.module('intranet.services').service('betHistoryService', BetHistoryService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetHistoryService.js.map