module intranet.common.directives {

    export interface IKTRulesModalScope extends common.IScopeBase {
        market: any;
        modalOptions: any;
    }

    export class KTRulesModalCtrl extends common.ControllerBase<IKTRulesModalScope>
        implements common.init.IInitScopeValues {

        constructor($scope: IKTRulesModalScope,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.market = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

    }

    angular.module('kt.components').controller('ktRulesModalCtrl', KTRulesModalCtrl);
}