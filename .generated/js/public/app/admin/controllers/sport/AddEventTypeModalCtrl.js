var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddEventTypeModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, eventTypeService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.eventType = { eventSource: "1" };
                if (this.modalOptions.data) {
                    this.$scope.eventType = this.modalOptions.data;
                    if (this.$scope.eventType.eventSource)
                        this.$scope.eventType.eventSource = this.$scope.eventType.eventSource.toString();
                    if (this.$scope.eventType.code)
                        this.$scope.eventType.code = this.$scope.eventType.code.toString();
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveEventTypeDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var status = intranet.common.enums.EventSource;
                this.$scope.eventSourceList = intranet.common.helpers.Utility.enumToArray(status);
                var codes = intranet.common.enums.PTCode;
                this.$scope.ptCodes = intranet.common.helpers.Utility.enumToArray(codes);
            }
            saveEventTypeDetail() {
                var promise;
                if (this.$scope.eventType.id) {
                    promise = this.eventTypeService.updateEventType(this.$scope.eventType);
                }
                else {
                    promise = this.eventTypeService.addEventType(this.$scope.eventType);
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
        admin.AddEventTypeModalCtrl = AddEventTypeModalCtrl;
        angular.module('intranet.admin').controller('addEventTypeModalCtrl', AddEventTypeModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddEventTypeModalCtrl.js.map