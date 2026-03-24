module intranet.admin {

    export interface ICompetitionScope extends intranet.common.IScopeBase {
        listNewItems: any[];
        loadAll: boolean;
    }

    export class CompetitionCtrl extends intranet.common.ControllerBase<ICompetitionScope>
        implements intranet.common.init.IInit {
        constructor($scope: ICompetitionScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $state: any,
            private competitionService: services.CompetitionService) {
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
                func: () => this.addEditCompetition(),
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

        private addEditCompetition(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.competition.edit.modal.header';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    sourceId: item.sourceId,
                    eventTypeId: item.eventTypeId,
                    eventTypeName: this.$stateParams.eventtypename
                };
            }
            else {
                modal.header = 'admin.competition.add.modal.header';
                modal.data = {
                    eventTypeId: this.$stateParams.eventtypeid,
                    eventTypeName: this.$stateParams.eventtypename
                };
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-competition-modal.html';
            modal.controller = 'addCompetitionModalCtrl';
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
                competitionId: item.id,
                competitionName: item.name
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-event-modal.html';
            modal.controller = 'addEventModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private viewEvents(item: any): void {
            this.$state.go('admin.sports.competition.event', {
                competitionid: item.id,
                competitionname: item.name.toLowerCase()
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchQuery = {
                all: this.$scope.loadAll
            };
            var model = { params: params, id: this.$stateParams.eventtypeid, searchQuery: searchQuery };
            return this.competitionService.getCompetitionList(model);
        }
    }

    angular.module('intranet.admin').controller('competitionCtrl', CompetitionCtrl);
}