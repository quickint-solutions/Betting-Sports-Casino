module intranet.admin {

    export interface IRunnerScope extends intranet.common.IScopeBase {
        search: any;
    }

    export class RunnerCtrl extends intranet.common.ControllerBase<IRunnerScope>
    {
        constructor($scope: IRunnerScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private runnerService: services.RunnerService) {
            super($scope);
            this.$scope.search = {};
        }

        private addEditRunner(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.runner.edit.modal.header';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    sourceId: item.sourceId,
                    runnerMetadata: item.runnerMetadata
                };
            }
            else {
                modal.header = 'admin.runner.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runner-modal.html';
            modal.controller = 'addRunnerModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private resetCriteria(): void {
            this.$scope.search.id = undefined;
            this.$scope.search.name = undefined;
            this.refreshGrid();
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            if (this.$scope.search.id) { searchquery.id = this.$scope.search.id; }
            if (this.$scope.search.name) { searchquery.name = this.$scope.search.name; }
            var model = { params: params, filters: filters, searchQuery: searchquery };
            return this.runnerService.getRunnerList(model);
        }
    }

    angular.module('intranet.admin').controller('runnerCtrl', RunnerCtrl);
}