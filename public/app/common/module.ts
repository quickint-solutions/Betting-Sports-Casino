/// <reference path='../reference.ts' />
namespace intranet.common {

    angular.module('intranet.common.cache', []);
    angular.module('intranet.common.services', ['toaster']);

    // components
    angular.module('kt.components', ['ajoslin.promise-tracker']);
    angular.module('intranet.common.filters', []);

    angular.module('intranet.common',
        [
            'intranet.common.services',
            'intranet.common.cache',
            'kt.components',
            'intranet.common.filters'
        ]);
}