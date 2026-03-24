module intranet.home {
    export interface IStakeConfigModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        data: any
    }

    export class StakeConfigModalCtrl extends intranet.common.ControllerBase<IStakeConfigModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IStakeConfigModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.data = this.modalOptions.data;
            }
            console.log(this.$scope.data);

            this.$scope.modalOptions.ok = result => {
                this.saveConfig();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveConfig(): void {

            var promise: ng.IHttpPromise<any>;
            promise = this.userService.updateStakeConfig(this.$scope.data);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.data);
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    this.$rootScope.$emit(this.settings.StakeConfig);
                }
                else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }

    angular.module('intranet.home').controller('stakeConfigModalCtrl', StakeConfigModalCtrl);
}