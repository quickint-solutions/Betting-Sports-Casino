var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class OpenBetsModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, betService, $uibModalInstance, promiseTracker, $filter, modalOptions) {
                super($scope);
                this.betService = betService;
                this.$uibModalInstance = $uibModalInstance;
                this.promiseTracker = promiseTracker;
                this.$filter = $filter;
                this.modalOptions = modalOptions;
                this.$scope.betPromiseTracker = this.promiseTracker({ activationDelay: 50, minDuration: 750 });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.eventBets = this.modalOptions.data.bets;
                    this.$scope.eventName = this.modalOptions.data.eventName;
                }
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                if (this.$scope.eventName) {
                    this.$scope.betViewType = 1;
                }
                else {
                    this.$scope.betViewType = 2;
                    this.betViewChanged();
                }
            }
            matchedBetFilter(bets) {
                bets = this.$filter('betFilter')(bets, 'sizeMatched');
                bets = this.$filter('orderBy')(bets, 'createdOn', true);
                return bets;
            }
            betViewChanged() {
                if (this.$scope.betViewType == 2) {
                    var promise = this.betService.getOpenBetByEvent();
                    this.$scope.betPromiseTracker.addPromise(promise);
                    promise.success((response) => {
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
        mobile.OpenBetsModalCtrl = OpenBetsModalCtrl;
        angular.module('intranet.mobile').controller('openBetsModalCtrl', OpenBetsModalCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OpenBetsModalCtrl.js.map