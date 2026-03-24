module intranet.admin {

    export interface IAddEventTypeModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        eventType: any;
        eventSourceList: any[];
        ptCodes: any[];
    }

    export class AddEventTypeModalCtrl extends intranet.common.ControllerBase<IAddEventTypeModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddEventTypeModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.eventType = { eventSource: "1" };
            if (this.modalOptions.data) {
                this.$scope.eventType = this.modalOptions.data;
                if (this.$scope.eventType.eventSource) this.$scope.eventType.eventSource = this.$scope.eventType.eventSource.toString();
                if (this.$scope.eventType.code) this.$scope.eventType.code = this.$scope.eventType.code.toString();
            }

            this.$scope.modalOptions.ok = result => {
                this.saveEventTypeDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var status: any = common.enums.EventSource;
            this.$scope.eventSourceList = common.helpers.Utility.enumToArray<common.enums.EventSource>(status);

            var codes: any = common.enums.PTCode;
            this.$scope.ptCodes = common.helpers.Utility.enumToArray<common.enums.PTCode>(codes);
        }

        private saveEventTypeDetail(): void {

            var promise: ng.IHttpPromise<any>;
            if (this.$scope.eventType.id) { promise = this.eventTypeService.updateEventType(this.$scope.eventType) }
            else { promise = this.eventTypeService.addEventType(this.$scope.eventType); }

            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }
    angular.module('intranet.admin').controller('addEventTypeModalCtrl', AddEventTypeModalCtrl);
}