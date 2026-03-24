module intranet.master {
    export interface ITransferAllModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        ids: any;
        comment: any;
    }

    export class TransferAllModalCtrl extends intranet.common.ControllerBase<ITransferAllModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ITransferAllModalScope,
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
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.ids = this.modalOptions.data;

            }

            this.$scope.modalOptions.ok = result => {
                this.transferBalance();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private transferBalance(): void {
            var model = { comment: this.$scope.comment, userIds: this.$scope.ids, timestamp: moment().format('x') };
            console.log(model);
            //this.accountService.bulkTransfer(model)
            //    .success((response: common.messaging.IResponse<any>) => {
            //        console.log(response);
            //        if (response.success) {
            //            this.toasterService.showMessages(response.messages, 3000);
            //            this.$uibModalInstance.close({ data: response.data, button: common.services.ModalResult.OK });
            //        }
            //        else {
            //            this.$scope.messages = response.messages;
            //        }
            //    });
        }
    }

    angular.module('intranet.master').controller('transferAllModalCtrl', TransferAllModalCtrl);
}