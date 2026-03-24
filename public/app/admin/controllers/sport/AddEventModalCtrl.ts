module intranet.admin {

    export interface IAddEventModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        event: any;
        scoreSourceList: any[];
    }

    export class AddEventModalCtrl extends intranet.common.ControllerBase<IAddEventModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddEventModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private eventService: services.EventService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.event = {};
            if (this.modalOptions.data) {
                this.$scope.event = this.modalOptions.data;
            }

            var scoresource: any = common.enums.ScoreSource;
            this.$scope.scoreSourceList = common.helpers.Utility.enumToArray<common.enums.ScoreSource>(scoresource);
            if (!this.$scope.event.scoreSource) this.$scope.event.scoreSource = this.$scope.scoreSourceList[1].id.toString();
            else { this.$scope.event.scoreSource = this.$scope.event.scoreSource.toString();}

            this.$scope.modalOptions.ok = result => {
                this.saveEventDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
            var activeDate = moment();
            if ($view == 'day') { activeDate = moment().subtract(1, 'd'); }
            if ($view == 'hour') { activeDate = moment().subtract(1, 'h'); }
            $dates.filter(function (date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false
            })
        }

        private saveEventDetail(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.event.id) {
                promise = this.eventService.updateEvent(this.$scope.event);
            }
            else { promise = this.eventService.addEvent(this.$scope.event); }

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
    angular.module('intranet.admin').controller('addEventModalCtrl', AddEventModalCtrl);
}