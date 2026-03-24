module intranet.admin {

    export interface IUpdateSMSConfigModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        user: any;
        eventTypes: any[];
        allEventTypeSelected: boolean;

        bettingTypes: any[];
        allBettingTypeSelected: boolean;
    }

    export class UpdateSMSConfigModalCtrl extends intranet.common.ControllerBase<IUpdateSMSConfigModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IUpdateSMSConfigModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var bettingType: any = common.enums.BettingType;
            this.$scope.bettingTypes = common.helpers.Utility.enumToArray<common.enums.BettingType>(bettingType);

            this.loadSMSConfig();
        }

        private getUserTypeShort(type: any): any {
            return super.getUserTypesShort(type);
        }

        private loadSMSConfig(): void {
            this.userService.getSMSConfig(this.$scope.user.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data && response.data.smsConfigs) {
                            this.$scope.user.smsConfigs = response.data.smsConfigs;
                        }
                    }
                }).finally(() => {
                    this.getEventTypes();
                    if (this.$scope.user.smsConfigs) {
                        angular.forEach(this.$scope.user.smsConfigs.bettingTypes, (b: any) => {
                            angular.forEach(this.$scope.bettingTypes, (bt: any) => {
                                if (b == bt.id) { bt.selected = true;}
                            });
                        });
                        this.bettingTypeChanged();
                    }
                });
        }

        private getEventTypes(): void {
            this.commonDataService.getEventTypes().then((data: any) => {
                angular.copy(data, this.$scope.eventTypes);
                if (this.$scope.user.smsConfigs) {
                    angular.forEach(this.$scope.user.smsConfigs.eventTypeIds, (e: any) => {
                        angular.forEach(this.$scope.eventTypes, (et: any) => {
                            if (e == et.id) { et.selected = true; }
                        });
                    });
                }
            }).finally(() => { this.eventTypeChanged(); });
        }

        private eventTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.eventTypes.forEach((a: any) => { a.selected = this.$scope.allEventTypeSelected; });
            }
            else {
                var result = this.$scope.eventTypes.every((a: any) => { return a.selected == true; });
                this.$scope.allEventTypeSelected = result;
            }
        }

        private bettingTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.bettingTypes.forEach((a: any) => { a.selected = this.$scope.allBettingTypeSelected; });
            }
            else {
                var result = this.$scope.bettingTypes.every((a: any) => { return a.selected == true; });
                this.$scope.allBettingTypeSelected = result;
            }
        }

        private saveUserDetail(): void {
            var model: any = {
                id: this.$scope.user.id, smsConfigs: {}
            };

            model.smsConfigs.mobileNo = this.$scope.user.smsConfigs.mobileNo;
            model.smsConfigs.eventTypeIds = (this.$scope.eventTypes.filter((a: any) => { return a.selected; }) || []).map((b: any) => { return b.id; });
            model.smsConfigs.bettingTypes = (this.$scope.bettingTypes.filter((a: any) => { return a.selected; }) || []).map((b: any) => { return b.id; });
            model.smsConfigs.isEnabled = this.$scope.user.smsConfigs.isEnabled;

            var promise: ng.IHttpPromise<any>;

            promise = this.userService.updateSMSConfig(model);

            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data && response.data.id) {
                        this.$uibModalInstance.close({ data: response.data, button: common.services.ModalResult.OK });
                    } else {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    this.toasterService.showMessages(response.messages, 3000);

                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }

    angular.module('intranet.admin').controller('updateSMSConfigModalCtrl', UpdateSMSConfigModalCtrl);
}