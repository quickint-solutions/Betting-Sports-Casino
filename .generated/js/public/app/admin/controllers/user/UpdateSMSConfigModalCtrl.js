var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class UpdateSMSConfigModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, userService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.eventTypes = [];
                this.$scope.bettingTypes = [];
                this.$scope.allEventTypeSelected = false;
                this.$scope.allBettingTypeSelected = false;
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.user = {};
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveUserDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var bettingType = intranet.common.enums.BettingType;
                this.$scope.bettingTypes = intranet.common.helpers.Utility.enumToArray(bettingType);
                this.loadSMSConfig();
            }
            getUserTypeShort(type) {
                return super.getUserTypesShort(type);
            }
            loadSMSConfig() {
                this.userService.getSMSConfig(this.$scope.user.id)
                    .success((response) => {
                    if (response.success) {
                        if (response.data && response.data.smsConfigs) {
                            this.$scope.user.smsConfigs = response.data.smsConfigs;
                        }
                    }
                }).finally(() => {
                    this.getEventTypes();
                    if (this.$scope.user.smsConfigs) {
                        angular.forEach(this.$scope.user.smsConfigs.bettingTypes, (b) => {
                            angular.forEach(this.$scope.bettingTypes, (bt) => {
                                if (b == bt.id) {
                                    bt.selected = true;
                                }
                            });
                        });
                        this.bettingTypeChanged();
                    }
                });
            }
            getEventTypes() {
                this.commonDataService.getEventTypes().then((data) => {
                    angular.copy(data, this.$scope.eventTypes);
                    if (this.$scope.user.smsConfigs) {
                        angular.forEach(this.$scope.user.smsConfigs.eventTypeIds, (e) => {
                            angular.forEach(this.$scope.eventTypes, (et) => {
                                if (e == et.id) {
                                    et.selected = true;
                                }
                            });
                        });
                    }
                }).finally(() => { this.eventTypeChanged(); });
            }
            eventTypeChanged(all = false) {
                if (all) {
                    this.$scope.eventTypes.forEach((a) => { a.selected = this.$scope.allEventTypeSelected; });
                }
                else {
                    var result = this.$scope.eventTypes.every((a) => { return a.selected == true; });
                    this.$scope.allEventTypeSelected = result;
                }
            }
            bettingTypeChanged(all = false) {
                if (all) {
                    this.$scope.bettingTypes.forEach((a) => { a.selected = this.$scope.allBettingTypeSelected; });
                }
                else {
                    var result = this.$scope.bettingTypes.every((a) => { return a.selected == true; });
                    this.$scope.allBettingTypeSelected = result;
                }
            }
            saveUserDetail() {
                var model = {
                    id: this.$scope.user.id, smsConfigs: {}
                };
                model.smsConfigs.mobileNo = this.$scope.user.smsConfigs.mobileNo;
                model.smsConfigs.eventTypeIds = (this.$scope.eventTypes.filter((a) => { return a.selected; }) || []).map((b) => { return b.id; });
                model.smsConfigs.bettingTypes = (this.$scope.bettingTypes.filter((a) => { return a.selected; }) || []).map((b) => { return b.id; });
                model.smsConfigs.isEnabled = this.$scope.user.smsConfigs.isEnabled;
                var promise;
                promise = this.userService.updateSMSConfig(model);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        if (response.data && response.data.id) {
                            this.$uibModalInstance.close({ data: response.data, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.UpdateSMSConfigModalCtrl = UpdateSMSConfigModalCtrl;
        angular.module('intranet.admin').controller('updateSMSConfigModalCtrl', UpdateSMSConfigModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UpdateSMSConfigModalCtrl.js.map