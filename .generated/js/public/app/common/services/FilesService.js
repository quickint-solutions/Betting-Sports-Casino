var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class FileService {
                constructor($log, settings, $timeout) {
                    this.$log = $log;
                    this.settings = settings;
                    this.$timeout = $timeout;
                }
                downloadFile(filename) {
                    var url = this.settings.ApiBaseUrl + 'content/export/' + filename;
                    var $a = $('<a>', {
                        href: url,
                        target: '_blank'
                    });
                    $(document.body).append($a);
                    $a[0].click();
                    $a.remove();
                }
                downloadByPath(filepath) {
                    var $a = $('<a>', {
                        href: filepath,
                        target: '_blank'
                    });
                    $(document.body).append($a);
                    $a[0].click();
                    $a.remove();
                }
                downloadFileStream(url) {
                    var $a = $('<a>', {
                        href: url,
                        target: '_self',
                        download: 'url.pdf'
                    });
                    $(document.body).append($a);
                    $a[0].click();
                    $a.remove();
                }
                downloadGeneratedFile(id) {
                    var url = this.settings.ApiBaseUrl + 'core/files/download/generated/' + id;
                    var $a;
                    $a = $('<a>', {
                        href: url,
                        target: '_self'
                    });
                    $(document.body).append($a);
                    this.$timeout(() => {
                        $a[0].click();
                        $a.remove();
                    }, 0, false);
                }
                downloadFileByPath(file, blank = false) {
                    var url = this.settings.ApiBaseUrl + 'core/files/download/path/';
                    var encodedUrl = window.btoa(file).replace(/\//g, '-').replace(/=/g, '_');
                    while (encodedUrl.length > 0) {
                        var substring = encodedUrl.substr(0, 200);
                        url += substring + '/';
                        encodedUrl = encodedUrl.replace(substring, '');
                    }
                    ;
                    url = url.substr(0, url.length - 1);
                    var $a;
                    if (blank === false) {
                        $a = $('<a>', {
                            href: url,
                            target: '_self'
                        });
                    }
                    else {
                        $a = $('<a>', {
                            href: url,
                            target: '_blank'
                        });
                    }
                    $(document.body).append($a);
                    $a[0].click();
                    $a.remove();
                }
                getUrlFileByPath(file, blank = false) {
                    var url = this.settings.ApiBaseUrl + 'core/files/download/path/';
                    var encodedUrl = window.btoa(file).replace(/\//g, '-').replace(/=/g, '_');
                    while (encodedUrl.length > 0) {
                        var substring = encodedUrl.substr(0, 200);
                        url += substring + '/';
                        encodedUrl = encodedUrl.replace(substring, '');
                    }
                    ;
                    url = url.substr(0, url.length - 1);
                    return url;
                }
                downloadFileData(data, contentType, filename) {
                    var urlCreator = window.URL;
                    if (urlCreator) {
                        var blob = new Blob([data], { type: contentType });
                        var url = urlCreator.createObjectURL(blob);
                        var $a = $('<a>', {
                            href: url,
                            target: '_blank',
                            download: filename
                        });
                        $(document.body).append($a);
                        $a[0].click();
                        $a.remove();
                    }
                }
            }
            services.FileService = FileService;
            angular.module('intranet.common.services').service('fileService', FileService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FilesService.js.map