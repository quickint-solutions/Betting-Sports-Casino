var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class EventMgmtCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, eventService, toasterService, modalService, $q) {
                super($scope);
                this.commonDataService = commonDataService;
                this.eventService = eventService;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.$q = $q;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.eventTypes = [];
                this.$scope.eventList = [];
                this.$scope.showCasinoBar = false;
            }
            loadInitialData() {
                this.getCasinoLockStatus();
                this.loadEventTypes().then(() => {
                    this.getEvents();
                });
            }
            loadEventTypes() {
                var defer = this.$q.defer();
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    angular.copy(value.filter((a) => { return a.displayOrder >= 0; }), this.$scope.eventTypes);
                    this.$scope.selectedEventType = this.$scope.eventTypes[0].id;
                    this.$scope.eventTypes.splice(0, 0, { id: -1, name: 'All' });
                    this.$scope.eventTypes.splice(0, 0, { id: -2, name: 'Casino' });
                    defer.resolve();
                });
                return defer.promise;
            }
            getEvents() {
                if (this.$scope.selectedEventType == -2) {
                    this.$scope.showCasinoBar = true;
                }
                else {
                    this.$scope.showCasinoBar = false;
                    this.eventService.GetMarketPtStatus(this.$scope.selectedEventType)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.eventList = response.data;
                        }
                    });
                }
            }
            ptStatusChanged(node, parent = undefined) {
                if (parent && parent.isLock == true && node.isLock == false) {
                    var msg = 'Please first swith Off Lock for ' + parent.name;
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Error, msg);
                    node.isLock = !node.isLock;
                }
                else if (node.nodeType < 4) {
                    var msg = '';
                    switch (node.nodeType) {
                        case 1:
                            msg = "All <b><i>" + node.name + "</i></b> competitions and events will have <b><i>Bet lock " + (node.isLock ? "On" : "Off") + '</i></b>';
                            break;
                        case 2:
                            msg = "All events for <b><i>" + node.name + "</i></b> will have <b><i>Betting Lock " + (node.isLock ? "On" : "Off") + '</i></b>';
                            break;
                    }
                    this.modalService.showConfirmation(msg).then((result) => {
                        if (result.button == intranet.common.services.ModalResult.OK) {
                            this.UpdatePtStatus(node);
                        }
                        else {
                            node.isLock = !node.isLock;
                        }
                    });
                }
                else {
                    this.UpdatePtStatus(node);
                }
            }
            UpdatePtStatus(node) {
                var self = this;
                var changeChildrenStatus = ((child, newPTStatus) => {
                    angular.forEach(child, (c) => {
                        c.isLock = newPTStatus;
                        if (c.children) {
                            changeChildrenStatus(c.children, newPTStatus);
                        }
                    });
                });
                var model = {};
                model.nodeId = node.id;
                model.isLock = node.isLock;
                model.nodeType = node.nodeType;
                this.eventService.UpdateMarketPtStatus(model)
                    .success((response) => {
                    if (response.success) {
                        if (response.data == true) {
                            if (node.children) {
                                changeChildrenStatus(node.children, node.isLock);
                            }
                        }
                        else {
                            node.isLock = !node.isLock;
                        }
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            getCasinoLockStatus() {
                this.eventService.getCasinoLock()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.isCasinoLock = response.data.isLock;
                    }
                });
            }
            casinoStatusChanged(isCasinoLock) {
                var model = { isLock: isCasinoLock };
                this.eventService.updateCasinoLock(model)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                });
            }
        }
        master.EventMgmtCtrl = EventMgmtCtrl;
        angular.module('intranet.master').controller('eventMgmtCtrl', EventMgmtCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventMgmtCtrl.js.map