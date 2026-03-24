var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class SettingService {
            constructor(baseService, settings, $q) {
                this.baseService = baseService;
                this.settings = settings;
                this.$q = $q;
            }
            getSettings(data) {
                return this.baseService.post('setting', data);
            }
            addSetting(data) {
                return this.baseService.post('setting/addsetting', data);
            }
            updateSetting(data) {
                return this.baseService.post('setting/updatesetting', data);
            }
            deleteSetting(settingId) {
                return this.baseService.get('setting/deletesetting/' + settingId);
            }
            getNotification() {
                return this.baseService.get('setting/getnotification');
            }
            getNotifications() {
                return this.baseService.get('setting/getnotifications');
            }
            updateNotifications(data) {
                return this.baseService.post('setting/updatenotification', data);
            }
            getCountryList() {
                return this.baseService.get('setting/getcountrylist');
            }
            checkAPIstatus() {
                var defer = this.$q.defer();
                this.baseService.outsideGet('https://cdn-tech-network.com/apistatus.json?t=' + moment().format("YYYYMMDDHHmmSSS"))
                    .success((response) => {
                    if (response && response[this.settings.Maintenance_Obj]) {
                        defer.resolve(response[this.settings.Maintenance_Obj]);
                    }
                    else {
                        defer.resolve({});
                    }
                })
                    .finally(() => {
                    defer.resolve({});
                });
                return defer.promise;
            }
            getCountries(data) {
                return this.baseService.post('setting/getcountries', data);
            }
            addCountry(data) {
                return this.baseService.post('setting/addcountry', data);
            }
            updateCountry(data) {
                return this.baseService.post('setting/updatecountry', data);
            }
        }
        services.SettingService = SettingService;
        angular.module('intranet.services').service('settingService', SettingService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SettingService.js.map