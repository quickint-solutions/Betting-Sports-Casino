module intranet.admin {

    export interface IEventTypeScope extends intranet.common.IScopeBase {
        listNewItems: any[];
        loadAll: boolean;
    }

    export class EventTypeCtrl extends intranet.common.ControllerBase<IEventTypeScope>
        implements intranet.common.init.IInit {
        constructor($scope: IEventTypeScope,
            private modalService: common.services.ModalService,
            private $state: any,
            private settings: common.IBaseSettings,
            private eventTypeService: services.EventTypeService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.listNewItems = [];
            this.$scope.loadAll = false;
        }

        public loadInitialData(): void { this.loadButtonItems(); }

        private loadButtonItems(): void {
            this.$scope.listNewItems.push({
                func: () => this.addEditEventType(),
                name: 'common.button.addnew'
            });
            this.$scope.listNewItems.push({
                func: (() => { this.$scope.loadAll = true; this.$scope.$broadcast('refreshGrid'); }),
                name: 'common.button.loadall'
            });
        }

        private addEditEventType(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.eventtype.edit.modal.header';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    sourceId: item.sourceId,
                    eventSource: item.eventSource,
                    isActive: item.isActive,
                    showInMenu: item.showInMenu,
                    displayOrder: item.displayOrder,
                    code: item.code
                };
            }
            else {
                modal.header = 'admin.eventtype.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-event-type-modal.html';
            modal.controller = 'addEventTypeModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private addEvent(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.event.add.modal.header';
            modal.data = {
                eventtypeId: item.id,
                eventtypeName: item.name
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-event-modal.html';
            modal.controller = 'addEventModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private viewEvents(item: any): void {
            this.$state.go('admin.sports.event', {
                eventtypeid: item.id,
                eventtypename: item.name.toLowerCase()
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchQuery = {
                all: this.$scope.loadAll
            };
            var model = { params: params, filters: filters, searchQuery: searchQuery };
            return this.eventTypeService.getEventTypeList(model);
        }
    }

    angular.module('intranet.admin').controller('eventTypeCtrl', EventTypeCtrl);
}