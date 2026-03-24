namespace intranet.common.filters {
    export function BetFilter() {
        return (items: any,
            prop: any) => {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item[prop] > 0) {
                    filtered.push(item);
                }
            }
            return filtered;
        };
    }

    export function BetSideFilter() {
        return (items: any,
            value: any) => {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.side == value) {
                    filtered.push(item);
                }
            }
            return filtered;
        };
    }
}
angular.module('intranet.common.filters').filter('betFilter', intranet.common.filters.BetFilter);
angular.module('intranet.common.filters').filter('betSideFilter', intranet.common.filters.BetSideFilter);

namespace intranet.common.filters {
    export function ORFilter() {
        return (items: any, prop: any, values: any[]) => {
            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (values.length > 0) {
                    if (values.indexOf(item[prop]) > -1) {
                        filtered.push(item);
                    }
                }
            }
            return filtered;
        };
    }
}
angular.module('intranet.common.filters').filter('orFilter', intranet.common.filters.ORFilter);

namespace intranet.common.filters {
    export function Total() {
        return (items: any, prop: any, isNested: boolean = false) => {
            var summed: any = 0;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (!isNested) {
                        if (item[prop] && item[prop] != 0) {
                            if (typeof item[prop] == 'string') {
                                item[prop] = item[prop].replaceAll(',', '');
                            }
                            summed = math.add(summed, item[prop]);
                        }
                    } else {
                        var splt = prop.split('.');
                        if (item[splt[0]] && item[splt[0]][splt[1]] && item[splt[0]][splt[1]] != 0) {
                            if (typeof item[splt[0]][splt[1]] == 'string') {
                                item[splt[0]].splt[1] = item[splt[0]][splt[1]].replaceAll(',', '');
                            }
                            summed = math.add(summed, item[splt[0]][splt[1]]);
                        }
                    }
                }
            }
            return summed;
        };
    }
}
angular.module('intranet.common.filters').filter('total', intranet.common.filters.Total);

namespace intranet.common.filters {
    export function shortme() {
        return (input: string,
            len: any) => {
            var shorted = input;
            if (input && input.length > len) {
                shorted = input.substring(0, len) + '...';
            }
            return shorted;
        };
    }
}
angular.module('intranet.common.filters').filter('shortme', intranet.common.filters.shortme);

namespace intranet.common.filters {
    export function joinme() {
        return (input: string) => {
            var shorted = input;
            if (shorted) shorted = shorted.replaceAll(' ', '-').toLowerCase();
            return shorted;
        };
    }
}
angular.module('intranet.common.filters').filter('joinme', intranet.common.filters.joinme);

namespace intranet.common.filters {
    export function spreadPrice() {
        return (input: string, len: any, multiply: any) => {
            len = len * -1;
            var num: any = 1;
            while (num.toString().length <= len) { num = num * 10; }
            var addition = math.divide(10, num);
            var final: any = input + (addition * multiply);
            final = math.round(final, len);
            return final
        };
    }
}
angular.module('intranet.common.filters').filter('spreadPrice', intranet.common.filters.spreadPrice);

namespace intranet.common.filters {
    export function uniqueValues() {
        return function (items, filterOn) {
            if (filterOn === false) {
                return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var hashCheck = {}, newItems = [];

                var extractValueToCompare = function (item) {
                    if (angular.isObject(item) && angular.isString(filterOn)) {
                        return item[filterOn];
                    } else {
                        return item;
                    }
                };

                angular.forEach(items, function (item) {
                    var valueToCheck, isDuplicate = false;

                    for (var i = 0; i < newItems.length; i++) {
                        if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        newItems.push(item);
                    }

                });
                items = newItems;
            }
            return items;
        };
    }
}
angular.module('intranet.common.filters').filter('unique', intranet.common.filters.uniqueValues);

namespace intranet.common.filters {
    export function safeHtml($sce: any) {
        return (input: string) => {
            return $sce.trustAsHtml(input);
        };
    }
}
angular.module('intranet.common.filters').filter('safeHtml', intranet.common.filters.safeHtml);
namespace intranet.common.filters {
    export function SessionPrice() {
        return (item: any,
            prop: any) => {
            if (!item.backPrice || item.backPrice.length <= 0) {
                item.backPrice = [{ price: '', size: '', percentage: '' }];
            }
            if (!item.layPrice || item.layPrice.length <= 0) {
                item.layPrice = [{ price: '', size: '', percentage: '' }];
            }
            if (item.backPrice.length != item.layPrice.length) {
                if (item.backPrice.length < item.layPrice.length) {
                    item.backPrice.push({ price: '', size: '', percentage: '' });
                }
                else {
                    item.layPrice.push({ price: '', size: '', percentage: '' });
                }
            }
            return item;
        };
    }
}
angular.module('intranet.common.filters').filter('sessionPrice', intranet.common.filters.SessionPrice);


namespace intranet.common.filters {
    export function trustUrl($sce: any) {
        return (input: string) => {
            return $sce.trustAsResourceUrl(input);
        };
    }
}
angular.module('intranet.common.filters').filter('trustUrl', intranet.common.filters.trustUrl);