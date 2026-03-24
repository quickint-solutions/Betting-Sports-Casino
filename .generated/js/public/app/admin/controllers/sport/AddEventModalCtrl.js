var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddEventModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, eventService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.eventService = eventService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.event = {};
                if (this.modalOptions.data) {
                    this.$scope.event = this.modalOptions.data;
                }
                var scoresource = intranet.common.enums.ScoreSource;
                this.$scope.scoreSourceList = intranet.common.helpers.Utility.enumToArray(scoresource);
                if (!this.$scope.event.scoreSource)
                    this.$scope.event.scoreSource = this.$scope.scoreSourceList[1].id.toString();
                else {
                    this.$scope.event.scoreSource = this.$scope.event.scoreSource.toString();
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveEventDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
                var activeDate = moment();
                if ($view == 'day') {
                    activeDate = moment().subtract(1, 'd');
                }
                if ($view == 'hour') {
                    activeDate = moment().subtract(1, 'h');
                }
                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf();
                }).forEach(function (date) {
                    date.selectable = false;
                });
            }
            saveEventDetail() {
                var promise;
                if (this.$scope.event.id) {
                    promise = this.eventService.updateEvent(this.$scope.event);
                }
                else {
                    promise = this.eventService.addEvent(this.$scope.event);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.AddEventModalCtrl = AddEventModalCtrl;
        angular.module('intranet.admin').controller('addEventModalCtrl', AddEventModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddEventModalCtrl.js.map