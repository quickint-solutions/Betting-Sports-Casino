var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BTModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, eventTypeService, commonDataService, userService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.eventTypeService = eventTypeService;
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
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.userId = this.modalOptions.data;
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
                this.getEventTypes();
            }
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                    }
                }).finally(() => { this.getBTConfig(); });
            }
            getBTConfig() {
                this.userService.getBetfairConfig(this.$scope.userId)
                    .success((response) => {
                    if (response.success && response.data) {
                        if (response.data) {
                            this.$scope.isBetfairActiveForUser = response.data.isBetfair;
                            response.data.betfairConfigs.forEach((r) => {
                                this.$scope.eventTypes.forEach((e) => {
                                    if (r.eventTypeId == e.id) {
                                        e.betfairRate = r.betfairRate;
                                    }
                                });
                            });
                        }
                    }
                });
            }
            saveBetConfig(applyToAll = false) {
                var model = {
                    id: this.$scope.userId,
                    betfairConfigs: [],
                    applyAll: applyToAll,
                    isBetfair: this.$scope.isBetfairActiveForUser
                };
                this.$scope.eventTypes.forEach((e) => {
                    model.betfairConfigs.push({ eventTypeId: e.id, betfairRate: e.betfairRate });
                });
                if (model) {
                    var promise;
                    promise = this.userService.updateBTConfig(model);
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
        admin.BTModalCtrl = BTModalCtrl;
        angular.module('intranet.admin').controller('bTModalCtrl', BTModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BTModalCtrl.js.map