module intranet.admin {

    export interface ISABetRateModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        bet: any;
    }

    export class SABetRateModalCtrl extends intranet.common.ControllerBase<ISABetRateModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ISABetRateModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private betService: services.BetService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];

            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.bet = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.save();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

        }

        private save() {
            var item: any = {};
            item.password = this.$scope.bet.password;
            item.betId = this.$scope.bet.id;
            item.price = this.$scope.bet.price;
            item.side = this.$scope.bet.side;
            item.betDetails = this.$scope.bet.betDetails;

            var promise: ng.IHttpPromise<any>;
            promise = this.betService.editRate(item);
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

    angular.module('intranet.admin').controller('sABetRateModalCtrl', SABetRateModalCtrl);
}