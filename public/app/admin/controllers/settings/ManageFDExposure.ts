module intranet.admin {

    export interface IManageFDExposureScope extends intranet.common.IScopeBase {
        providerList: any[];
        gridItems: any;
        listNewItems: any;
        search: any;
    }

    export class ManageFDExposureCtrl extends intranet.common.ControllerBase<IManageFDExposureScope>
        implements intranet.common.init.IInitScopeValues {
        constructor($scope: IManageFDExposureScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private fdService: services.FDService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.providerList = [];
            var betType: any = common.enums.TableProvider;
            this.$scope.providerList = common.helpers.Utility.enumToArray<common.enums.TableProvider>(betType);
            this.$scope.providerList.splice(0, 0, { id: -1, name: '-- Select Provider --' });

            this.$scope.search = { provider: '-1' };
            this.$scope.listNewItems = [];
            this.loadButtonItems();
        }

        private loadButtonItems(): void {
            this.$scope.listNewItems.push({
                func: () => this.refreshGrid(),
                name: 'Refresh Data',
                cssClass: 'fa fa-refresh'
            });
            this.$scope.listNewItems.push({
                func: () => this.selectAllMarkets(),
                name: 'Select All Exposure',
                cssClass: 'fa fa-check-square-o'
            });
            this.$scope.listNewItems.push({
                func: () => this.deleteExposureForSelected(),
                name: 'Delete Selected',
                cssClass: 'fa fa-trash'
            });
        }

        private selectAllMarkets(): void {
            if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                this.$scope.gridItems.forEach((x: any) => { x.isDelete = true; });
            }
        }

        private deleteExposureForSelected() {
            var ids = this.$scope.gridItems.filter((m: any) => { return m.isDelete == true; }).map((a: any) => { return a.id; });
            if (ids.length > 0) {
                this.modalService.showDeleteConfirmation().then((result: any) => {
                    if (result == common.services.ModalResult.OK) {
                        this.fdService.removePendingFDExposure(ids)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.refreshGrid();
                                }
                                this.toasterService.showMessages(response.messages, 3000);
                            });
                    }
                });
            }
        }

        private deleteExposure(item: any): void {
            var ids = [];
            ids.push(item.id);
            this.fdService.removePendingFDExposure(ids)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                    this.toasterService.showMessages(response.messages, 3000);
                });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = { provider: this.$scope.search.provider };
            var model = { params: params, filters: filters, searchQuery: searchquery };
            return this.fdService.getPendingFDExposure(model);
        }

        private resetCriteria(): void {
            this.$scope.search.provider = '-1';
            this.refreshGrid();
        }


        private refreshGrid() {
            this.$scope.$broadcast('refreshGrid');
        }

        public getProvider(provider): any {
            return common.enums.TableProvider[provider];
        }
    }

    angular.module('intranet.admin').controller('manageFDExposureCtrl', ManageFDExposureCtrl);
}