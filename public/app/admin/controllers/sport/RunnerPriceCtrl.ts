module intranet.admin {

    export interface IRunnerPriceScope extends intranet.common.IScopeBase {

    }

    export class RunnerPriceCtrl extends intranet.common.ControllerBase<IRunnerPriceScope>
    {
        constructor($scope: IRunnerPriceScope,
            private modalService: common.services.ModalService,
            private toasterService: common.services.ToasterService,
            private settings: common.IBaseSettings,
            private runnerPriceService: services.RunnerPriceService) {
            super($scope);
        }

        private addEditRunnerPrice(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.runnerprice.edit.modal.header';
                modal.data = {
                    id: item.id,
                    runnerId: item.runnerId,
                    runnerName: item.runnerName,
                    gameType: item.gameType,
                    price: item.price,
                    backSize: item.backSize,
                    laySize: item.laySize,
                    increament: item.increament
                };
            }
            else {
                modal.header = 'admin.runnerprice.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runnerprice-modal.html';
            modal.controller = 'addRunnerPriceModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });
        }

        public getGameType(gameType: any): string {
            return common.enums.GameType[gameType];
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private resetCriteria(): void {
            this.refreshGrid();
        }

        private deleteRunnerPrice(id: any): void {
            this.runnerPriceService.deleteRunnerPrice(id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.runnerPriceService.getRunnerList(model);
        }
    }

    angular.module('intranet.admin').controller('runnerPriceCtrl', RunnerPriceCtrl);
}