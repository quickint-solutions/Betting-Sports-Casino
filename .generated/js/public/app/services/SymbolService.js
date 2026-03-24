var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class SymbolService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getSymbolList(data) {
                return this.baseService.post('symbol', data);
            }
            addSymbol(data) {
                return this.baseService.post('symbol/addsymbol', data);
            }
            updateSymbol(data) {
                return this.baseService.post('symbol/updatesymbol', data);
            }
            deleteSymbol(id) {
                return this.baseService.get('symbol/deletesymbol/' + id);
            }
            changeSymbolStatus(id, isactive) {
                return this.baseService.get('symbol/changestatus/' + id + '/' + isactive);
            }
            getSymbols() {
                return this.baseService.get('symbol/getsymbols');
            }
            getWatchlist() {
                return this.baseService.get('symbol/getmarketwatchtemplate');
            }
            addUpdateMarketWatch(data) {
                return this.baseService.post('symbol/addmarketwatchtemplate', data);
            }
        }
        services.SymbolService = SymbolService;
        angular.module('intranet.services').service('symbolService', SymbolService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SymbolService.js.map