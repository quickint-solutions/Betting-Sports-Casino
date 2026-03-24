module intranet.admin {

    export interface IAddMarketRuleModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        rule: any;
    }

    export class AddMarketRuleModalCtrl extends intranet.common.ControllerBase<IAddMarketRuleModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddMarketRuleModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance: any,
            private marketRuleService: services.MarketRuleService,
            private commonDataService: common.services.CommonDataService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.rule = {};
            if (this.modalOptions.data) {
                this.$scope.rule = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRule();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveRule(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.rule.id) {
                promise = this.marketRuleService.updateMarketRule(this.$scope.rule);
            }
            else {
                promise = this.marketRuleService.addMarketRule(this.$scope.rule);
            }
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
    angular.module('intranet.admin').controller('addMarketRuleModalCtrl', AddMarketRuleModalCtrl);
}