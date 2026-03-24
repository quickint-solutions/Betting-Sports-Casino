var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class UserCommissionModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, userService, commonDataService, commissionService, $q, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.commissionService = commissionService;
                this.$q = $q;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.bettingTypeList = [];
                this.$scope.commissionOnList = [];
                this.$scope.commissionTypeList = [];
                this.$scope.commissionFromList = [];
                this.$scope.existingCommission = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.userId = this.modalOptions.data.userId;
                    this.$scope.username = this.modalOptions.data.username;
                    this.$scope.onlyCommission = this.modalOptions.data.onlyCommission;
                }
                this.$scope.modalOptions.extraClick = result => {
                    this.saveUserCommission(true);
                };
                this.$scope.modalOptions.ok = result => {
                    this.saveUserCommission();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.getUserCommission().then(() => {
                    this.loadBettingTypes();
                    this.loadCommissionOn();
                    this.loadCommissionType();
                    this.loadCommissionFrom();
                });
            }
            loadBettingTypes() {
                var types = intranet.common.enums.BettingType;
                var bettingType = intranet.common.helpers.Utility.enumToArray(types);
                this.$scope.bettingTypeList = bettingType.filter((a) => {
                    return a.id != intranet.common.enums.BettingType.RANGE;
                });
                if (this.$scope.existingCommission.length > 0) {
                    this.$scope.existingCommission.forEach((m) => {
                        this.$scope.bettingTypeList.forEach((b) => {
                            if (b.id == m.bettingType) {
                                if (m.commissionOn) {
                                    b.commissionOn = m.commissionOn.toString();
                                }
                                else {
                                    b.commissionOn = '1';
                                }
                                if (m.commissionType) {
                                    b.commissionType = m.commissionType.toString();
                                }
                                else {
                                    b.commissionType = '1';
                                }
                                if (m.commissionFrom) {
                                    b.commissionFrom = m.commissionFrom.toString();
                                }
                                else {
                                    b.commissionFrom = '1';
                                }
                                b.percentage = m.percentage;
                                b.commissionUpTo = m.commissionUpTo;
                                b.excludeLowerPrice = m.excludeLowerPrice;
                                b.excludeUpperPrice = m.excludeUpperPrice;
                                b.superAdminShare = m.superAdminShare;
                                b.adminShare = m.adminShare;
                                b.superMasterShare = m.superMasterShare;
                                b.masterShare = m.masterShare;
                                b.agentShare = m.agentShare;
                            }
                        });
                    });
                }
                else {
                    this.$scope.bettingTypeList.forEach((b) => { b.commissionOn = '1'; b.commissionType = '1'; });
                }
            }
            loadCommissionOn() {
                var commissionOn = intranet.common.enums.CommissionOn;
                this.$scope.commissionOnList = intranet.common.helpers.Utility.enumToArray(commissionOn);
            }
            loadCommissionFrom() {
                var commissionFrom = intranet.common.enums.CommissionFrom;
                this.$scope.commissionFromList = intranet.common.helpers.Utility.enumToArray(commissionFrom);
            }
            getUserCommission() {
                var defer = this.$q.defer();
                this.userService.getUserById(this.$scope.userId)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.commissions)
                            this.$scope.existingCommission = response.data.commissions;
                    }
                }).finally(() => { defer.resolve(); });
                return defer.promise;
            }
            loadCommissionType() {
                var commissionType = intranet.common.enums.CommissionType;
                this.$scope.commissionTypeList = intranet.common.helpers.Utility.enumToArray(commissionType);
            }
            saveUserCommission(applyToAll = false) {
                var model = { id: this.$scope.userId, commissions: [], applyAll: applyToAll };
                this.$scope.bettingTypeList.forEach((b) => {
                    if (b.percentage > 0) {
                        model.commissions.push({
                            percentage: b.percentage,
                            bettingType: b.id,
                            commissionOn: b.commissionOn,
                            commissionType: b.commissionType,
                            commissionUpTo: b.commissionUpTo,
                            excludeLowerPrice: b.excludeLowerPrice,
                            excludeUpperPrice: b.excludeUpperPrice,
                            superAdminShare: b.superAdminShare,
                            adminShare: b.adminShare,
                            superMasterShare: b.superMasterShare,
                            masterShare: b.masterShare,
                            agentShare: b.agentShare
                        });
                    }
                });
                var promise;
                if (this.$scope.onlyCommission) {
                    promise = this.userService.setCommission(model);
                }
                else {
                    promise = this.userService.setFullCommission(model);
                }
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
        admin.UserCommissionModalCtrl = UserCommissionModalCtrl;
        angular.module('intranet.admin').controller('userCommissionModalCtrl', UserCommissionModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserCommissionModalCtrl.js.map