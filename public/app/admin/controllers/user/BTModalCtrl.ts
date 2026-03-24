module intranet.admin {
    export interface IBTModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        eventTypes: any[];
        userId: any;
        isBetfairActiveForUser: boolean;
    }

    export class BTModalCtrl extends intranet.common.ControllerBase<IBTModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IBTModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.getEventTypes();
        }

        private getEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                    }

                }).finally(() => { this.getBTConfig(); });
        }

        private getBTConfig(): void {
            this.userService.getBetfairConfig(this.$scope.userId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        if (response.data) {
                            this.$scope.isBetfairActiveForUser = response.data.isBetfair;
                            response.data.betfairConfigs.forEach((r: any) => {
                                this.$scope.eventTypes.forEach((e: any) => {
                                    if (r.eventTypeId == e.id) {
                                        e.betfairRate = r.betfairRate;
                                    }
                                });
                            });
                        }
                    }
                });
        }

        private saveBetConfig(applyToAll: boolean = false): void {
            var model = {
                id: this.$scope.userId,
                betfairConfigs: [],
                applyAll: applyToAll,
                isBetfair: this.$scope.isBetfairActiveForUser
            };
            this.$scope.eventTypes.forEach((e: any) => {
                model.betfairConfigs.push({ eventTypeId: e.id, betfairRate: e.betfairRate });
            });
            if (model) {
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.updateBTConfig(model);
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
    }

    angular.module('intranet.admin').controller('bTModalCtrl', BTModalCtrl);
}