var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function BetFilter() {
                return (items, prop) => {
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
            filters.BetFilter = BetFilter;
            function BetSideFilter() {
                return (items, value) => {
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
            filters.BetSideFilter = BetSideFilter;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('betFilter', intranet.common.filters.BetFilter);
angular.module('intranet.common.filters').filter('betSideFilter', intranet.common.filters.BetSideFilter);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function ORFilter() {
                return (items, prop, values) => {
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
            filters.ORFilter = ORFilter;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('orFilter', intranet.common.filters.ORFilter);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function Total() {
                return (items, prop, isNested = false) => {
                    var summed = 0;
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
                            }
                            else {
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
            filters.Total = Total;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('total', intranet.common.filters.Total);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function shortme() {
                return (input, len) => {
                    var shorted = input;
                    if (input && input.length > len) {
                        shorted = input.substring(0, len) + '...';
                    }
                    return shorted;
                };
            }
            filters.shortme = shortme;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('shortme', intranet.common.filters.shortme);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function joinme() {
                return (input) => {
                    var shorted = input;
                    if (shorted)
                        shorted = shorted.replaceAll(' ', '-').toLowerCase();
                    return shorted;
                };
            }
            filters.joinme = joinme;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('joinme', intranet.common.filters.joinme);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function spreadPrice() {
                return (input, len, multiply) => {
                    len = len * -1;
                    var num = 1;
                    while (num.toString().length <= len) {
                        num = num * 10;
                    }
                    var addition = math.divide(10, num);
                    var final = input + (addition * multiply);
                    final = math.round(final, len);
                    return final;
                };
            }
            filters.spreadPrice = spreadPrice;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('spreadPrice', intranet.common.filters.spreadPrice);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function uniqueValues() {
                return function (items, filterOn) {
                    if (filterOn === false) {
                        return items;
                    }
                    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                        var hashCheck = {}, newItems = [];
                        var extractValueToCompare = function (item) {
                            if (angular.isObject(item) && angular.isString(filterOn)) {
                                return item[filterOn];
                            }
                            else {
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
            filters.uniqueValues = uniqueValues;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('unique', intranet.common.filters.uniqueValues);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function safeHtml($sce) {
                return (input) => {
                    return $sce.trustAsHtml(input);
                };
            }
            filters.safeHtml = safeHtml;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('safeHtml', intranet.common.filters.safeHtml);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function SessionPrice() {
                return (item, prop) => {
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
            filters.SessionPrice = SessionPrice;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('sessionPrice', intranet.common.filters.SessionPrice);
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function trustUrl($sce) {
                return (input) => {
                    return $sce.trustAsResourceUrl(input);
                };
            }
            filters.trustUrl = trustUrl;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('trustUrl', intranet.common.filters.trustUrl);
//# sourceMappingURL=bet-filter.js.map