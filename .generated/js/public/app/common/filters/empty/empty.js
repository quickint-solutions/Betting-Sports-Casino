var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            angular.module('intranet.common.filters')
                .filter('empty', () => input => {
                if (input) {
                    return input;
                }
                else {
                    return '---';
                }
            });
            function NotEmpty() {
                return (items, prop) => {
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
            filters.NotEmpty = NotEmpty;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('notEmpty', intranet.common.filters.NotEmpty);
//# sourceMappingURL=empty.js.map