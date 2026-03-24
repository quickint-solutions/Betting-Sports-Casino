
module intranet.master {

    export interface IEventMgmtScope extends intranet.common.IScopeBase {
        eventTypes: any[];
        selectedEventType: any;
        eventList: any[];

        showCasinoBar: boolean;
        isCasinoLock: boolean;
    }

    export class EventMgmtCtrl extends intranet.common.ControllerBase<IEventMgmtScope>
        implements common.init.IInit {
        constructor($scope: IEventMgmtScope,
            private commonDataService: common.services.CommonDataService,
            private eventService: services.EventService,
            private toasterService: common.services.ToasterService,
            private modalService: common.services.ModalService,
            private $q: ng.IQService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.eventTypes = [];
            this.$scope.eventList = [];

            this.$scope.showCasinoBar = false;
        }

        public loadInitialData(): void {
            this.getCasinoLockStatus();
            this.loadEventTypes().then(() => {
                this.getEvents();
            });
        }

        private loadEventTypes(): ng.IPromise<any> {
            var defer = this.$q.defer();
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                angular.copy(value.filter((a: any) => { return a.displayOrder >= 0; }), this.$scope.eventTypes);
                this.$scope.selectedEventType = this.$scope.eventTypes[0].id;
                this.$scope.eventTypes.splice(0, 0, { id: -1, name: 'All' });
                this.$scope.eventTypes.splice(0, 0, { id: -2, name: 'Casino' });
                defer.resolve();
            });
            return defer.promise;
        }

        private getEvents(): void {
            if (this.$scope.selectedEventType == -2) { this.$scope.showCasinoBar = true; }
            else {
                this.$scope.showCasinoBar = false;
                this.eventService.GetMarketPtStatus(this.$scope.selectedEventType)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.eventList = response.data;
                        }
                    });
            }
        }

        private ptStatusChanged(node: any, parent: any = undefined): void {
            if (parent && parent.isLock == true && node.isLock == false) {
                var msg = 'Please first swith Off Lock for ' + parent.name;
                this.toasterService.showToast(common.helpers.ToastType.Error, msg);
                node.isLock = !node.isLock;
            }
            else if (node.nodeType < 4) {
                var msg = '';
                switch (node.nodeType) {
                    case 1: msg = "All <b><i>" + node.name + "</i></b> competitions and events will have <b><i>Bet lock " + (node.isLock ? "On" : "Off") + '</i></b>'; break;
                    case 2: msg = "All events for <b><i>" + node.name + "</i></b> will have <b><i>Betting Lock " + (node.isLock ? "On" : "Off") + '</i></b>'; break;
                }

                this.modalService.showConfirmation(msg).then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.UpdatePtStatus(node);
                    } else {
                        node.isLock = !node.isLock;
                    }
                });
            } else {
                this.UpdatePtStatus(node);
            }
        }

        private UpdatePtStatus(node: any): void {
            var self = this;
            var changeChildrenStatus = ((child: any[], newPTStatus: any) => {
                angular.forEach(child, (c: any) => {
                    c.isLock = newPTStatus;
                    if (c.children) { changeChildrenStatus(c.children, newPTStatus); }
                });
            });

            var model: any = {};
            model.nodeId = node.id;
            model.isLock = node.isLock;
            model.nodeType = node.nodeType;
            //model.maxBet = node.maxBet;
            //model.maxLiability = node.maxLiability;
            //model.maxProfit = node.maxProfit;

            this.eventService.UpdateMarketPtStatus(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data == true) {
                            if (node.children) {
                                changeChildrenStatus(node.children, node.isLock);
                            }
                        } else {
                            node.isLock = !node.isLock;
                        }
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }

        private getCasinoLockStatus() {
            this.eventService.getCasinoLock()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.isCasinoLock = response.data.isLock; }
                });
        }

        private casinoStatusChanged(isCasinoLock: boolean) {
            var model: any = { isLock: isCasinoLock };
            this.eventService.updateCasinoLock(model)
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                });
        }

    }
    angular.module('intranet.master').controller('eventMgmtCtrl', EventMgmtCtrl);
}