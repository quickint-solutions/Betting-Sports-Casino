var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class ExportService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            currentBets(data) {
                return this.baseService.post('export/currentbets', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            historyBet(data) {
                return this.baseService.post('export/getbethistoryexport', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            historyBetbyId(data) {
                return this.baseService.post('export/bethistorybyid', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            profitLoss(data) {
                return this.baseService.post('export/profitloss', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            profitLossById(data) {
                return this.baseService.post('export/profitlossbyid', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            accountStatement(data) {
                return this.baseService.post('export/accountStatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            transferStatement(data) {
                return this.baseService.post('export/transferStatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            settleAccountStatement(data) {
                return this.baseService.post('export/getsettleaccountstatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            casinoStatement(data) {
                return this.baseService.post('export/getcasinostatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            settleCasinoStatement(data) {
                return this.baseService.post('export/getsettlecasinostatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            downline(data) {
                return this.baseService.post('export/downline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            getCasinoChildBalanceinfo(data) {
                return this.baseService.post('export/getcasinochildbalanceinfo', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            liveBets(data) {
                return this.baseService.post('export/livebets', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            plByDownline(data) {
                return this.baseService.post('export/plbydownline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            saPLByDownline(data) {
                return this.baseService.post('export/saplbydownline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            plByMarket(data) {
                return this.baseService.post('export/plbymarket', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            saPLByMarket(data) {
                return this.baseService.post('export/saplbymarket', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
            users(data) {
                return this.baseService.post('export/users', data, { responseType: 'arraybuffer', ignoreTimeout: true });
            }
        }
        services.ExportService = ExportService;
        angular.module('intranet.services').service('exportService', ExportService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ExportService.js.map