module intranet.master {

    export interface IFDLiveBetsScope extends intranet.common.IScopeBase {
        gridItems: any;
        listNewItems: any;
    }

    export class FDLiveBetsCtrl extends intranet.common.ControllerBase<IFDLiveBetsScope>
        implements intranet.common.init.IInitScopeValues {
        constructor($scope: IFDLiveBetsScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private fdService: services.FDService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.listNewItems = [];
            this.loadButtonItems();
        }

        private loadButtonItems(): void {
            this.$scope.listNewItems.push({
                func: () => this.refreshData(),
                name: 'Refresh Data',
                cssClass: 'fa fa-refresh'
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.fdService.getRunningFDExposure(model);
        }

        private refreshData() {
            this.$scope.$broadcast('refreshGrid');
        }

        public getProvider(provider): any {
            return common.enums.TableProvider[provider];
        }
    }

    angular.module('intranet.master').controller('fDLiveBetsCtrl', FDLiveBetsCtrl);
}