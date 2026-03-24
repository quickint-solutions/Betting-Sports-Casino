module intranet.master {
    export interface ISetDWLimitsModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
    }

    export class SetDWLimitsModalCtrl extends intranet.common.ControllerBase<ISetDWLimitsModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ISetDWLimitsModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private websiteService: services.WebsiteService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.item = {};
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
                this.$scope.item.minDeposit = this.$filter('toRateOnly')(this.$scope.item.minDeposit);
                this.$scope.item.maxDeposit = this.$filter('toRateOnly')(this.$scope.item.maxDeposit);
                this.$scope.item.minWithdrwal = this.$filter('toRateOnly')(this.$scope.item.minWithdrwal);
                this.$scope.item.maxWithdrwal = this.$filter('toRateOnly')(this.$scope.item.maxWithdrwal);

            }

            this.$scope.modalOptions.ok = result => {
                this.saveDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveDetail(): void {
            var promise: ng.IHttpPromise<any>;
            var model: any = {};
            model.minDeposit = this.$filter('toGLC')(this.$scope.item.minDeposit);
            model.maxDeposit = this.$filter('toGLC')(this.$scope.item.maxDeposit);
            model.minWithdrwal = this.$filter('toGLC')(this.$scope.item.minWithdrwal);
            model.maxWithdrwal = this.$filter('toGLC')(this.$scope.item.maxWithdrwal);

            promise = this.websiteService.updateOffPaymentDetails(model);

            if (promise) {
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }

    }

    angular.module('intranet.master').controller('setDWLimitsModalCtrl', SetDWLimitsModalCtrl);
}