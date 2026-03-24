module intranet.mobile {

    export interface IOpenBetsModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        eventBets: any;
        eventName: any;

        allEventBets: any;
        selectedEvent: any;

        betViewType: any;//1=event,2=all event
        betPromiseTracker: any;
    }

    export class OpenBetsModalCtrl extends intranet.common.ControllerBase<IOpenBetsModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IOpenBetsModalScope,
            private betService: services.BetService,
            private $uibModalInstance,
            private promiseTracker: any,
            private $filter: any,
            private modalOptions: any) {
            super($scope);

            this.$scope.betPromiseTracker = this.promiseTracker({ activationDelay: 50, minDuration: 750 });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) {
                this.$scope.eventBets = this.modalOptions.data.bets;
                this.$scope.eventName = this.modalOptions.data.eventName;
            }

            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData() {
            if (this.$scope.eventName) {
                this.$scope.betViewType = 1;
            } else {
                this.$scope.betViewType = 2;
                this.betViewChanged();
            }
        }

        private matchedBetFilter(bets: any[]): any {
            bets = this.$filter('betFilter')(bets, 'sizeMatched');
            bets = this.$filter('orderBy')(bets, 'createdOn', true);
            return bets;
        }

        private betViewChanged() {
            if (this.$scope.betViewType == 2) {
                var promise = this.betService.getOpenBetByEvent();
                this.$scope.betPromiseTracker.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.allEventBets = response.data;
                        if (this.$scope.allEventBets.length > 0) {
                            this.$scope.selectedEvent = this.$scope.allEventBets[0].eventId.toString();
                        }
                    }
                });

            }
        }

    }
    angular.module('intranet.mobile').controller('openBetsModalCtrl', OpenBetsModalCtrl);
}