var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var interceptors;
        (function (interceptors) {
            class ResponseInterceptorFactory {
                static create() {
                    var factory = ($q) => {
                        var interceptor = {};
                        interceptor.response = (response) => {
                            var deferred = $q.defer();
                            var responseObj = response.data;
                            if (responseObj && responseObj.hasOwnProperty('data')) {
                                if (responseObj.success) {
                                    deferred.resolve(response);
                                }
                                else {
                                    deferred.reject(response);
                                }
                            }
                            else {
                                deferred.resolve(response);
                            }
                            return deferred.promise;
                        };
                        return interceptor;
                    };
                    factory.$inject = ['$q'];
                    return factory;
                }
            }
            interceptors.ResponseInterceptorFactory = ResponseInterceptorFactory;
        })(interceptors = common.interceptors || (common.interceptors = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ResponseInterceptorFactory.js.map