module intranet.admin {
    export interface IViewSystemLogModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
    }

    export class ViewSystemLogModalCtrl extends intranet.common.ControllerBase<IViewSystemLogModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IViewSystemLogModalScope,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.data = {};
            if (this.modalOptions.data) { this.$scope.data = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private getLogLevel(level: any): string {
            return common.enums.LogLevel[level];
        }
    }


    angular.module('intranet.admin').controller('viewSystemLogModalCtrl', ViewSystemLogModalCtrl);
}