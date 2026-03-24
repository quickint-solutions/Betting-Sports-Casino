namespace intranet.common.services {
    export class FileService {

        /* @ngInject */
        constructor(private $log: ng.ILogService,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService) {
        }

        public downloadFile(filename: any) {
            var url = this.settings.ApiBaseUrl + 'content/export/' + filename;
            var $a = $('<a>', {
                href: url,
                target: '_blank'
            });

            $(document.body).append($a);
            $a[0].click();
            $a.remove();
        }

        public downloadByPath(filepath: any) {
            var $a = $('<a>', {
                href: filepath,
                target: '_blank'
            });

            $(document.body).append($a);
            $a[0].click();
            $a.remove();
        }

        public downloadFileStream(url: any) {
            var $a = $('<a>', {
                href: url,
                target: '_self',
                download: 'url.pdf'
            });

            $(document.body).append($a);
            $a[0].click();
            $a.remove();
        }

        public downloadGeneratedFile(id: any) {
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

        public downloadFileByPath(file: any, blank: boolean = false) {
            var url = this.settings.ApiBaseUrl + 'core/files/download/path/';
            var encodedUrl = window.btoa(file).replace(/\//g, '-').replace(/=/g, '_'); // replace invalid characters in url

            //There is a string length limit in the routing for every entry, so break it into multiple strings
            while (encodedUrl.length > 0) {
                var substring = encodedUrl.substr(0, 200);
                url += substring + '/';
                encodedUrl = encodedUrl.replace(substring, '');
            };

            url = url.substr(0, url.length - 1);

            var $a;
            if (blank === false) {
                $a = $('<a>', {
                    href: url,
                    target: '_self'
                });
            } else {
                $a = $('<a>', {
                    href: url,
                    target: '_blank'
                });
            }

            $(document.body).append($a);
            $a[0].click();
            $a.remove();
        }

        public getUrlFileByPath(file: any, blank: boolean = false): string {
            var url = this.settings.ApiBaseUrl + 'core/files/download/path/';
            var encodedUrl = window.btoa(file).replace(/\//g, '-').replace(/=/g, '_'); // replace invalid characters in url

            //There is a string length limit in the routing for every entry, so break it into multiple strings
            while (encodedUrl.length > 0) {
                var substring = encodedUrl.substr(0, 200);
                url += substring + '/';
                encodedUrl = encodedUrl.replace(substring, '');
            };

            url = url.substr(0, url.length - 1);
            return url;
        }

        public downloadFileData(data: any, contentType: any, filename: any): void {
            var urlCreator = window.URL;
            if (urlCreator) {
                var blob = new Blob([data], { type: contentType });
                var url = urlCreator.createObjectURL(blob);
                // var a: any = document.createElement("a");
                //  document.body.appendChild(a);
                //  a.style = "display: none";
                //  a.href = url;
                //  a.download = filename;  
                //  a.click();
                //   window.URL.revokeObjectURL(url);

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
    angular.module('intranet.common.services').service('fileService', FileService);
}