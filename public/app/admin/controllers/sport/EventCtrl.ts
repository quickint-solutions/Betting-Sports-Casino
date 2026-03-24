module intranet.admin {

    export interface IEventScope extends intranet.common.IScopeBase {
        listNewItems: any[];
        loadAll: boolean;
    }

    export class EventCtrl extends intranet.common.ControllerBase<IEventScope>
        implements intranet.common.init.IInit {
        constructor($scope: IEventScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $state: any,
            private eventService: services.EventService) {
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
                func: () => this.addEditEvent(),
                name: 'common.button.addnew'
            });
            this.$scope.listNewItems.push({
                func: (() => { this.$scope.loadAll = true; this.$scope.$broadcast('refreshGrid'); }),
                name: 'common.button.loadall'
            });
        }

        public getMarketStatus(status: any): string {
            return common.enums.MarketStatus[status];
        }

        private addEditEvent(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.event.edit.modal.header';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    sourceId: item.sourceId,
                    countryCode: item.countryCode,
                    timezone: item.timezone,
                    venue: item.venue,
                    openDate: item.openDate,
                    eventTypeId: this.$stateParams.eventtypeid,
                    eventtypeName: this.$stateParams.eventtypename,
                    scoreSource: item.scoreSource,
                    scoreSourceId: item.scoreSourceId
                };
            }
            else {
                modal.header = 'admin.event.add.modal.header';
                modal.data = {
                    eventTypeId: this.$stateParams.eventtypeid,
                    eventtypeName: this.$stateParams.eventtypename,
                };
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-event-modal.html';
            modal.controller = 'addEventModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private viewMarket(item: any): void {
            this.$state.go('admin.sports.event.market', {
                eventid: item.id,
                eventname: item.name.toLowerCase()
            });
        }

        private linkVideo(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.event.linkvideo.modal.header';
            modal.data = {
                eventId: item.id,
                eventName: item.name,
                id: item.videoId,
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/link-video-modal.html';
            modal.controller = 'linkVideoModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchQuery = {
                all: this.$scope.loadAll
            };
            var model = { params: params, id: this.$stateParams.eventtypeid, searchQuery: searchQuery };
            return this.eventService.getEventList(model);
        }
    }

    angular.module('intranet.admin').controller('eventCtrl', EventCtrl);
}