namespace intranet.common.interceptors {

    export class ResponseInterceptorFactory {

        static create(): ng.IHttpInterceptorFactory {
            var factory = ($q: ng.IQService) => {
                var interceptor: ng.IHttpInterceptor = {};
                interceptor.response = (response) => {
                    var deferred = $q.defer();

                    var responseObj: any = response.data;
                    if (responseObj && responseObj.hasOwnProperty('data')) {
                        //this is our custom response object
                        if (responseObj.success) {
                            //resolve deferred obj
                            deferred.resolve(response);
                        } else {
                            //reject deferred obj
                            deferred.reject(response);
                        }
                    } else {
                        deferred.resolve(response);
                    }
                    //other response
                    return deferred.promise;
                };
                return interceptor;
            };
            factory.$inject = ['$q'];
            return factory;
        }
    }
}