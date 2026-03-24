module intranet.admin {

    export interface ISymbolScope extends intranet.common.IScopeBase {
        search: any;
        segmentList: any[];
        activeStatus: any[];
    }

    export class SymbolCtrl extends intranet.common.ControllerBase<ISymbolScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: ISymbolScope,
            private modalService: common.services.ModalService,
            private toasterService: common.services.ToasterService,
            private settings: common.IBaseSettings,
            private symbolService: services.SymbolService) {
            super($scope);
            this.$scope.search = {};

            super.init(this);
        }

        public loadInitialData(): void {
            var status: any = common.enums.Segment;
            this.$scope.segmentList = common.helpers.Utility.enumToArray<common.enums.Segment>(status);
            this.$scope.segmentList.splice(0, 0, { id: '-1', name: '-- Select Segment --' });
            this.$scope.search = { segment: '-1' };

            this.$scope.activeStatus = [];
            this.$scope.activeStatus.push({ id: true, name: 'true' });
            this.$scope.activeStatus.push({ id: false, name: 'false' });
        }

        private getSegement(id: any): any {
            return common.enums.Segment[id];
        }

        private activeStatusChanged(active: any, item: any): void {
            this.symbolService.changeSymbolStatus(item.id, active)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.isActive = active;
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'Symbol status changed.');
                    } else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
        }

        private addEditRunner(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'Edit Symbol';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    segment: item.segment,
                    code: item.code,
                    lotSize: item.lotSize
                };
            }
            else {
                modal.header = 'Add Symbol';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/symbol/add-symbol-modal.html';
            modal.controller = 'addSymbolModalCtrl';
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
            this.$scope.search.segment = undefined;
            this.$scope.search.name = undefined;
            this.refreshGrid();
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            if (this.$scope.search.segment != '-1') { searchquery.segment = this.$scope.search.segment; }
            if (this.$scope.search.name) { searchquery.name = this.$scope.search.name; }
            var model = { params: params, filters: filters, searchQuery: searchquery };
            return this.symbolService.getSymbolList(model);
        }
    }

    angular.module('intranet.admin').controller('symbolCtrl', SymbolCtrl);
}