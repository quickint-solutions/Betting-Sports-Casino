module intranet.common.directives {

    export interface IConfirmBetScope extends intranet.common.IScopeBase {
        bet: any;
        modalOptions: any;
    }

    export class ConfirmBetCtrl extends intranet.common.ControllerBase<IConfirmBetScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IConfirmBetScope,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.bet = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }
    }

    angular.module('kt.components').controller('confirmBetCtrl', ConfirmBetCtrl);
}