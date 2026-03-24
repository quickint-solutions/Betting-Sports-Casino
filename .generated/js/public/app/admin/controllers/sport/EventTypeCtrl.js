var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class EventTypeCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, $state, settings, eventTypeService) {
                super($scope);
                this.modalService = modalService;
                this.$state = $state;
                this.settings = settings;
                this.eventTypeService = eventTypeService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
                this.$scope.loadAll = false;
            }
            loadInitialData() { this.loadButtonItems(); }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.addEditEventType(),
                    name: 'common.button.addnew'
                });
                this.$scope.listNewItems.push({
                    func: (() => { this.$scope.loadAll = true; this.$scope.$broadcast('refreshGrid'); }),
                    name: 'common.button.loadall'
                });
            }
            addEditEventType(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                    eventtypeId: item.id,
                    eventtypeName: item.name
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-event-modal.html';
                modal.controller = 'addEventModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            viewEvents(item) {
                this.$state.go('admin.sports.event', {
                    eventtypeid: item.id,
                    eventtypename: item.name.toLowerCase()
                });
            }
            getItems(params, filters) {
                var searchQuery = {
                    all: this.$scope.loadAll
                };
                var model = { params: params, filters: filters, searchQuery: searchQuery };
                return this.eventTypeService.getEventTypeList(model);
            }
        }
        admin.EventTypeCtrl = EventTypeCtrl;
        angular.module('intranet.admin').controller('eventTypeCtrl', EventTypeCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventTypeCtrl.js.map