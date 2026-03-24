var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class CompetitionCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, $stateParams, $state, competitionService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.competitionService = competitionService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
                this.$scope.loadAll = false;
            }
            loadInitialData() { this.loadButtonItems(); }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.addEditCompetition(),
                    name: 'common.button.addnew'
                });
                this.$scope.listNewItems.push({
                    func: (() => { this.$scope.loadAll = true; this.$scope.$broadcast('refreshGrid'); }),
                    name: 'common.button.loadall'
                });
            }
            getMarketStatus(status) {
                return intranet.common.enums.MarketStatus[status];
            }
            addEditCompetition(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            addEvent(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
            viewEvents(item) {
                this.$state.go('admin.sports.competition.event', {
                    competitionid: item.id,
                    competitionname: item.name.toLowerCase()
                });
            }
            getItems(params, filters) {
                var searchQuery = {
                    all: this.$scope.loadAll
                };
                var model = { params: params, id: this.$stateParams.eventtypeid, searchQuery: searchQuery };
                return this.competitionService.getCompetitionList(model);
            }
        }
        admin.CompetitionCtrl = CompetitionCtrl;
        angular.module('intranet.admin').controller('competitionCtrl', CompetitionCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CompetitionCtrl.js.map