var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var interceptors;
        (function (interceptors) {
            class ExportFactory {
                static excel() {
                    var factory = ($window, $timeout) => {
                        var uri = 'data:application/vnd.ms-excel;base64,';
                        var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
                        var base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); };
                        var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
                        return {
                            tableToExcel: function (tableId, worksheetName) {
                                var table = jQuery('#' + tableId);
                                var ctx = { worksheet: worksheetName, table: table.html() };
                                var href = uri + base64(format(template, ctx));
                                $timeout(function () { location.href = href; }, 100);
                            },
                            tableStringToExcel: function (table, worksheetName) {
                                var ctx = { worksheet: worksheetName, table: table };
                                var href = uri + base64(format(template, ctx));
                                var $a = $('<a>', {
                                    href: href,
                                    target: '_self',
                                    download: worksheetName
                                });
                                $(document.body).append($a);
                                $a[0].click();
                                $a.remove();
                            }
                        };
                    };
                    factory.$inject = ['$window', '$timeout'];
                    return factory;
                }
            }
            interceptors.ExportFactory = ExportFactory;
            angular.module('intranet.common.services').factory('ExportFactory', ExportFactory.excel());
            class FileReaderFactory {
                static create() {
                    var factory = ($q, $log) => {
                        var onLoad = function (reader, deferred, scope) {
                            return function () {
                                scope.$apply(function () {
                                    deferred.resolve(reader.result);
                                });
                            };
                        };
                        var onError = function (reader, deferred, scope) {
                            return function () {
                                scope.$apply(function () {
                                    deferred.reject(reader.result);
                                });
                            };
                        };
                        var onProgress = function (reader, scope) {
                            return function (event) {
                                scope.$broadcast("fileProgress", {
                                    total: event.total,
                                    loaded: event.loaded
                                });
                            };
                        };
                        var getReader = function (deferred, scope) {
                            var reader = new FileReader();
                            reader.onload = onLoad(reader, deferred, scope);
                            reader.onerror = onError(reader, deferred, scope);
                            reader.onprogress = onProgress(reader, scope);
                            return reader;
                        };
                        var readAsDataURL = function (file, scope) {
                            var deferred = $q.defer();
                            var reader = getReader(deferred, scope);
                            reader.readAsDataURL(file);
                            return deferred.promise;
                        };
                        return {
                            readAsDataUrl: readAsDataURL
                        };
                    };
                    factory.$inject = ['$q', '$log'];
                    return factory;
                }
            }
            interceptors.FileReaderFactory = FileReaderFactory;
            angular.module('intranet.common.services').factory('FileReaderFactory', FileReaderFactory.create());
        })(interceptors = common.interceptors || (common.interceptors = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ExportFactory.js.map