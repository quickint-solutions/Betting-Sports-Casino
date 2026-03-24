module intranet.master {
    export interface IViewBficTransactionModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        statusList: any[];
    }

    export class ViewBficTransactionModalCtrl extends intranet.common.ControllerBase<IViewBficTransactionModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IViewBficTransactionModalScope,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
            }

            this.$scope.statusList = [];
            this.$scope.statusList.push({ id: '', name: 'All' });
            this.$scope.statusList.push({ id: 1, name: 'Init' });
            this.$scope.statusList.push({ id: 2, name: 'Confirmed' });
          
            this.$scope.modalOptions.ok = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private getStatus(s: any) { return this.$scope.statusList[s].name; }
    }

    angular.module('intranet.master').controller('viewBficTransactionModalCtrl', ViewBficTransactionModalCtrl);
}