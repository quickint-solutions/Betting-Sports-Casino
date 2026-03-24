namespace intranet.common.filters {

    /**
     * @ngdoc filter
     * @name filter:empty
     * @description
     * A filter for returning the string '---' when the value is falsy (null/undefined/empty string/..)
     */
    angular.module('intranet.common.filters')
        .filter('empty', () => input => {
            if (input) {
                return input;
            } else {
                return '---';
            }
        });

    export type IEmptyFilter = (value: string) => string;

    export function NotEmpty() {
        return (items: any, prop: any) => {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item[prop] && item[prop] != '' && item[prop] != undefined) {
                    filtered.push(item);
                }
            }
            return filtered;
        };
    }
}
angular.module('intranet.common.filters').filter('notEmpty', intranet.common.filters.NotEmpty);