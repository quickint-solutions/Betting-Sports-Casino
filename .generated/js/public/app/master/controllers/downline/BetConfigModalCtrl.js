var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class BetConfigModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, configService, commonDataService, userService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.configService = configService;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.eventTypes = [];
                this.$scope.chkColumn = { eventType: false, min: false, max: false, delay: false, exposure: false, profit: false };
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.memberId = this.modalOptions.data;
                }
                this.$scope.modalOptions.extraClick = result => {
                    this.saveBetConfig(true);
                };
                this.$scope.modalOptions.ok = result => {
                    this.saveBetConfig();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.getBetConfig();
            }
            getBetConfig() {
                this.userService.getUserById(this.$scope.memberId)
                    .success((response) => {
                    if (response.success && response.data) {
                        var betConfig = response.data.betConfigs;
                        var eventTypes = [];
                        this.commonDataService.getEventTypes().then((data) => {
                            eventTypes = data;
                            angular.forEach(eventTypes, (e) => {
                                var index = intranet.common.helpers.Utility.IndexOfObject(betConfig, 'eventTypeId', e.id);
                                if (index < 0) {
                                    betConfig.push({
                                        eventTypeId: e.id,
                                        name: e.name,
                                        minBet: 0,
                                        maxBet: 0,
                                        maxExposure: 0,
                                        maxProfit: 0
                                    });
                                }
                            });
                            betConfig.forEach((m) => {
                                m.name = this.commonDataService.getEventTypeName(m.eventTypeId);
                                m.minBet = this.$filter('toRate')(m.minBet);
                                m.maxBet = this.$filter('toRate')(m.maxBet);
                                m.maxExposure = this.$filter('toRate')(m.maxExposure);
                                m.maxProfit = this.$filter('toRate')(m.maxProfit);
                            });
                            this.$scope.eventTypes = betConfig.filter((a) => { return a.name; });
                        });
                    }
                });
            }
            eventTypeChanged(all = false) {
                if (all) {
                    this.$scope.eventTypes.forEach((a) => { a.haveChange = this.$scope.chkColumn.eventType; });
                }
                else {
                    var result = this.$scope.eventTypes.every((a) => { return a.haveChange == true; });
                    this.$scope.chkColumn.eventType = result;
                }
            }
            prepareModal() {
                var model = { id: this.$scope.memberId, betConfigs: [] };
                this.$scope.eventTypes.forEach((m) => {
                    m.minBet = this.$filter('toGLC')(m.minBet);
                    m.maxBet = this.$filter('toGLC')(m.maxBet);
                    m.maxExposure = this.$filter('toGLC')(m.maxExposure);
                    m.maxProfit = this.$filter('toGLC')(m.maxProfit);
                    delete m.name;
                });
                angular.copy(this.$scope.eventTypes, model.betConfigs);
                return model;
            }
            saveBetConfig(applyToAll = false) {
                var model = this.prepareModal();
                if (model) {
                    model.applyAll = applyToAll;
                    var promise;
                    promise = this.userService.updateBetConfig(model);
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        master.BetConfigModalCtrl = BetConfigModalCtrl;
        angular.module('intranet.master').controller('betConfigModalCtrl', BetConfigModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetConfigModalCtrl.js.map