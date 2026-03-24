module intranet.home {

    export interface IRulesModalScope extends intranet.common.IScopeBase {
        market: any;
        modalOptions: any;
    }

    export class RulesModalCtrl extends intranet.common.ControllerBase<IRulesModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IRulesModalScope,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.market = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
            };

            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

    }

    angular.module('intranet.home').controller('rulesModalCtrl', RulesModalCtrl);
}