module intranet.admin {

    export interface IDWModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        request: any;
        forMaster: boolean;
        isTransfer: boolean;

        creditTypeList: any[]; // chips=1,casino=2
        selectedCreditType: any;
    }

    export class DWModalCtrl extends intranet.common.ControllerBase<IDWModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IDWModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
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
            this.$scope.forMaster = false;
            this.$scope.isTransfer = true;

            this.$scope.creditTypeList = [];
            this.$scope.creditTypeList.push({ id: 1, name: 'Chips' });
            this.$scope.creditTypeList.push({ id: 2, name: 'Casino' });
            this.$scope.selectedCreditType = { creditType: 1 };

            this.$scope.modalOptions = this.modalOptions;
            this.$scope.request = {};
            this.$scope.request.dwType = 'D';
            if (this.modalOptions.data) {
                this.$scope.request.userId = this.modalOptions.data.userId;
                this.$scope.forMaster = this.modalOptions.data.forMaster;
                this.$scope.isTransfer = this.modalOptions.data.isTransfer;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveDW();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private creditTypeChanged(selected: any): void {
            this.$scope.selectedCreditType.creditType = selected;
        }

        private saveDW(): void {
            var promise: ng.IHttpPromise<any>;
            var model = {
                isTransfer: true,
                chips: this.$filter('toGLC')(this.$scope.request.chips),
                userId: this.$scope.request.userId,
                dwType: this.$scope.request.dwType,
                comment: this.$scope.request.remarks,
                timestamp: moment().format('x')
            };

            //if (this.$scope.forMaster == true) {
            //    if (this.$scope.selectedCreditType.creditType == 1) {
            //        promise = this.accountService.DW(model);
            //    } else {
            //        promise = this.accountService.DWForCasino(model);
            //    }
            //}
            //else {
            if (model.dwType == 'D') {
                promise = this.accountService.IN(model);
            } else {
                promise = this.accountService.OUT(model);
            }
            //}
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

    angular.module('intranet.admin').controller('dwModalCtrl', DWModalCtrl);
}