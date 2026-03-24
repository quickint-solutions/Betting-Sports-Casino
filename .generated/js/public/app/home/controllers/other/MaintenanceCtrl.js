var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MaintenanceCtrl extends intranet.common.ControllerBase {
            constructor($scope, $timeout, settingService, commonProcessService, settings) {
                super($scope);
                this.$timeout = $timeout;
                this.settingService = settingService;
                this.commonProcessService = commonProcessService;
                this.settings = settings;
                this.$scope.fakeQuery = jQuery;
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timerStatus);
                });
                super.init(this);
            }
            loadInitialData() {
                this.setParticles();
                this.checkAPIstatus();
            }
            checkAPIstatus() {
                this.settingService.checkAPIstatus()
                    .then((response) => {
                    if (response && response.apiStatus == false) {
                        jQuery('#title').text(response.title);
                        jQuery('#description').text(response.description);
                        if (response.startTime) {
                            this.setTimer(moment(response.startTime).format("YYYY-MM-DD HH:mm"));
                        }
                    }
                    else {
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
            setTimer(time) {
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
            setParticles() {
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
        home.MaintenanceCtrl = MaintenanceCtrl;
        angular.module('intranet.home').controller('maintenanceCtrl', MaintenanceCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MaintenanceCtrl.js.map