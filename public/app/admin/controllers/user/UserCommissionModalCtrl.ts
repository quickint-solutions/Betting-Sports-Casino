module intranet.admin {

    export interface IUserCommissionModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        userId: any;
        username: string;
        onlyCommission: boolean;

        existingCommission: any[];

        bettingTypeList: any[];
        commissionOnList: any[];
        commissionTypeList: any[];
        commissionFromList: any[];
    }

    export class UserCommissionModalCtrl extends intranet.common.ControllerBase<IUserCommissionModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IUserCommissionModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private commissionService: services.CommissionService,
            private $q: ng.IQService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.getUserCommission().then(() => {
                this.loadBettingTypes();
                this.loadCommissionOn();
                this.loadCommissionType();
                this.loadCommissionFrom();
            });
        }

        private loadBettingTypes(): void {
            var types: any = common.enums.BettingType;
            var bettingType = common.helpers.Utility.enumToArray<common.enums.UserType>(types);
            this.$scope.bettingTypeList = bettingType.filter((a: any) => {
                return a.id != common.enums.BettingType.RANGE
            });

            if (this.$scope.existingCommission.length > 0) {
                this.$scope.existingCommission.forEach((m: any) => {
                    this.$scope.bettingTypeList.forEach((b: any) => {
                        if (b.id == m.bettingType) {
                            if (m.commissionOn) { b.commissionOn = m.commissionOn.toString(); } else { b.commissionOn = '1'; }
                            if (m.commissionType) { b.commissionType = m.commissionType.toString(); } else { b.commissionType = '1'; }
                            if (m.commissionFrom) { b.commissionFrom = m.commissionFrom.toString(); } else { b.commissionFrom = '1'; }
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
            } else {
                this.$scope.bettingTypeList.forEach((b: any) => { b.commissionOn = '1'; b.commissionType = '1'; });
            }
        }

        private loadCommissionOn(): void {
            var commissionOn: any = common.enums.CommissionOn;
            this.$scope.commissionOnList = common.helpers.Utility.enumToArray<common.enums.CommissionOn>(commissionOn);
        }

        private loadCommissionFrom(): void {
            var commissionFrom: any = common.enums.CommissionFrom;
            this.$scope.commissionFromList = common.helpers.Utility.enumToArray<common.enums.CommissionFrom>(commissionFrom);
        }

        private getUserCommission(): ng.IPromise<any> {
            var defer = this.$q.defer();
            this.userService.getUserById(this.$scope.userId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.commissions) this.$scope.existingCommission = response.data.commissions;
                    }
                }).finally(() => { defer.resolve(); });
            return defer.promise;
        }

        private loadCommissionType(): void {
            var commissionType: any = common.enums.CommissionType;
            this.$scope.commissionTypeList = common.helpers.Utility.enumToArray<common.enums.CommissionType>(commissionType);
        }

        private saveUserCommission(applyToAll: boolean = false): void {
            var model = { id: this.$scope.userId, commissions: [], applyAll: applyToAll };
            this.$scope.bettingTypeList.forEach((b: any) => {
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

            var promise: ng.IHttpPromise<any>;
            if (this.$scope.onlyCommission) {
                promise = this.userService.setCommission(model);
            }
            else {
                promise = this.userService.setFullCommission(model);
            }
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }

    angular.module('intranet.admin').controller('userCommissionModalCtrl', UserCommissionModalCtrl);
}