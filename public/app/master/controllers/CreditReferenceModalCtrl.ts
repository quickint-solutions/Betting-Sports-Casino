module intranet.master {
    export interface ICreditReferenceModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        creditRef: any
        isCasino: boolean;
    }

    export class CreditReferenceModalCtrl extends intranet.common.ControllerBase<ICreditReferenceModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ICreditReferenceModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.creditRef = {};
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.creditRef.current = this.modalOptions.data.current;
                this.$scope.creditRef.userId = this.modalOptions.data.userId;
                this.$scope.creditRef.isCasino = this.modalOptions.data.isCasino;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveCreditReference();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveCreditReference(): void {
            var promise: ng.IHttpPromise<any>;
            var ref = {
                creditRef: 0,
                userId: this.$scope.creditRef.userId,
                password: this.$scope.creditRef.password
            }
            if (this.$scope.creditRef.isCasino) {
                ref.creditRef = (this.$scope.creditRef.creditRef),
                    promise = this.accountService.updateCasinoCreditRef(ref);
            }
            else {
                ref.creditRef = this.$filter('toGLC')(this.$scope.creditRef.creditRef),
                    promise = this.accountService.updateCreditRef(ref);
            }
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

    angular.module('intranet.master').controller('creditReferenceModalCtrl', CreditReferenceModalCtrl);
}