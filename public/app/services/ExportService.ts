namespace intranet.services {
    export class ExportService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public currentBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/currentbets', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public historyBet(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/getbethistoryexport', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }
        public historyBetbyId(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/bethistorybyid', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public profitLoss(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/profitloss', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }
        public profitLossById(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/profitlossbyid', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public accountStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/accountStatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }
        public transferStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/transferStatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public settleAccountStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/getsettleaccountstatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public casinoStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/getcasinostatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }
        public settleCasinoStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/getsettlecasinostatement', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public downline(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/downline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public getCasinoChildBalanceinfo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/getcasinochildbalanceinfo', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public liveBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/livebets', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public plByDownline(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/plbydownline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }
        public saPLByDownline(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/saplbydownline', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public plByMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/plbymarket', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public saPLByMarket(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/saplbymarket', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

        public users(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('export/users', data, { responseType: 'arraybuffer', ignoreTimeout: true });
        }

    }
    angular.module('intranet.services').service('exportService', ExportService);
}