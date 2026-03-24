namespace intranet.common.filters {
    export function ResponseMessageFilter() {
        return (messages: common.messaging.IResponseMessage[],
            typeMessage: common.messaging.ResponseMessageType) => {

            if (messages) {
                return messages.filter(r => r.responseMessageType === typeMessage);
            }
            return [];
        };
    }
}
angular.module('intranet.common.filters').filter('responseMessage', intranet.common.filters.ResponseMessageFilter);
