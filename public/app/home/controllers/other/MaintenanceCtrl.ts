module intranet.home {
    export interface IMaintenanceScope extends intranet.common.IScopeBase {
        fakeQuery: any;
        timerStatus: any;
        title: any;
        description: any;
    }

    export class MaintenanceCtrl extends intranet.common.ControllerBase<IMaintenanceScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IMaintenanceScope,
            private $timeout: any,
            private settingService: services.SettingService,
            private commonProcessService: common.services.CommonProcessService,
            private settings: intranet.common.IBaseSettings) {
            super($scope);

            this.$scope.fakeQuery = jQuery;
            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timerStatus);
            });

            super.init(this);
        }

        public loadInitialData(): void {
            this.setParticles();
            this.checkAPIstatus();
        }

        private checkAPIstatus(): void {
            this.settingService.checkAPIstatus()
                .then((response: any) => {
                    if (response && response.apiStatus == false) {
                        jQuery('#title').text(response.title);
                        jQuery('#description').text(response.description);
                        if (response.startTime) {
                            this.setTimer(moment(response.startTime).format("YYYY-MM-DD HH:mm"));
                        }
                    } else {
                        this.commonProcessService.siteLiveNow();
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timerStatus = this.$timeout(() => {
                            this.checkAPIstatus();
                        }, 300000);
                    }
                });
        }

        private setTimer(time: any): void {
            this.$scope.fakeQuery('div#counter').countdown(time)
                .on('update.countdown', function (event) {
                    $(this).html(event.strftime('<div class=\"half\">' +
                        '<span>%D <sup>days</sup></span>' +
                        '<span>%H <sup>hours</sup></span>' +
                        '</div>' +
                        '<div class=\"half\">' +
                        '<span>%M <sup>mins</sup></span>' +
                        '<span>%S <sup>secs</sup></span>' +
                        '</div>'));
                });
        }

        private setParticles(): void {
            this.$scope.fakeQuery('.home-particles').particleground({
                dotColor: '#fff',
                lineColor: '#555555',
                particleRadius: 6,
                curveLines: true,
                density: 10000,
                proximity: 150
            });
        }

    }
    angular.module('intranet.home').controller('maintenanceCtrl', MaintenanceCtrl);
}