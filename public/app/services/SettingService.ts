module intranet.services {

    export class SettingService {
        constructor(private baseService: common.services.BaseService,
            private settings: common.IBaseSettings,
            private $q: ng.IQService) {
        }

        public getSettings(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting', data);
        }

        public addSetting(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/addsetting', data);
        }

        public updateSetting(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/updatesetting', data);
        }

        public deleteSetting(settingId: any): ng.IHttpPromise<any> {
            return this.baseService.get('setting/deletesetting/' + settingId);
        }

        public getNotification(): ng.IHttpPromise<any> {
            return this.baseService.get('setting/getnotification');
        }

        public getNotifications(): ng.IHttpPromise<any> {
            return this.baseService.get('setting/getnotifications');
        }

        public updateNotifications(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/updatenotification', data);
        }

        public getCountryList(): ng.IHttpPromise<any> {
            return this.baseService.get('setting/getcountrylist');
        }

        public checkAPIstatus(): ng.IPromise<any> {
            var defer = this.$q.defer();
            this.baseService.outsideGet('https://cdn-tech-network.com/apistatus.json?t=' + moment().format("YYYYMMDDHHmmSSS"))
                .success((response: any) => {
                    if (response && response[this.settings.Maintenance_Obj]) {
                        defer.resolve(response[this.settings.Maintenance_Obj]);
                    } else { defer.resolve({}); }
                })
                .finally(() => {
                    defer.resolve({});
                });
            return defer.promise;
        }

        public getCountries(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/getcountries', data);
        }

        public addCountry(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/addcountry', data);
        }

        public updateCountry(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('setting/updatecountry', data);
        }
    }

    angular.module('intranet.services').service('settingService', SettingService);
}