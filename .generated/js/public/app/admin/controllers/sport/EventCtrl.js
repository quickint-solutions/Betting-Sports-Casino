var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class EventCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, $stateParams, $state, eventService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.eventService = eventService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
                this.$scope.loadAll = false;
            }
            loadInitialData() { this.loadButtonItems(); }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.addEditEvent(),
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
            addEditEvent(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            viewMarket(item) {
                this.$state.go('admin.sports.event.market', {
                    eventid: item.id,
                    eventname: item.name.toLowerCase()
                });
            }
            linkVideo(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'admin.event.linkvideo.modal.header';
                modal.data = {
                    eventId: item.id,
                    eventName: item.name,
                    id: item.videoId,
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/link-video-modal.html';
                modal.controller = 'linkVideoModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            getItems(params, filters) {
                var searchQuery = {
                    all: this.$scope.loadAll
                };
                var model = { params: params, id: this.$stateParams.eventtypeid, searchQuery: searchQuery };
                return this.eventService.getEventList(model);
            }
        }
        admin.EventCtrl = EventCtrl;
        angular.module('intranet.admin').controller('eventCtrl', EventCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventCtrl.js.map