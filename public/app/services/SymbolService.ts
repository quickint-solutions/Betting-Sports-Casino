namespace intranet.services {
    export class SymbolService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getSymbolList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('symbol', data);
        }
        public addSymbol(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('symbol/addsymbol', data);
        }
        public updateSymbol(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('symbol/updatesymbol', data);
        }
        public deleteSymbol(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('symbol/deletesymbol/' + id);
        }
        public changeSymbolStatus(id: any, isactive: boolean): ng.IHttpPromise<any> {
            return this.baseService.get('symbol/changestatus/' + id+'/'+isactive);
        }
        public getSymbols(): ng.IHttpPromise<any> {
            return this.baseService.get('symbol/getsymbols');
        }

        public getWatchlist(): ng.IHttpPromise<any> {
            return this.baseService.get('symbol/getmarketwatchtemplate');
        }
        public addUpdateMarketWatch(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('symbol/addmarketwatchtemplate', data);
        }
    }
    angular.module('intranet.services').service('symbolService', SymbolService);
}