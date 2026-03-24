var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function ResponseMessageFilter() {
                return (messages, typeMessage) => {
                    if (messages) {
                        return messages.filter(r => r.responseMessageType === typeMessage);
                    }
                    return [];
                };
            }
            filters.ResponseMessageFilter = ResponseMessageFilter;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('responseMessage', intranet.common.filters.ResponseMessageFilter);
//# sourceMappingURL=response-message.js.map