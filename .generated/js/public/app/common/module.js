var intranet;
(function (intranet) {
    var common;
    (function (common) {
        angular.module('intranet.common.cache', []);
        angular.module('intranet.common.services', ['toaster']);
        angular.module('kt.components', ['ajoslin.promise-tracker']);
        angular.module('intranet.common.filters', []);
        angular.module('intranet.common', [
            'intranet.common.services',
            'intranet.common.cache',
            'kt.components',
            'intranet.common.filters'
        ]);
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=module.js.map