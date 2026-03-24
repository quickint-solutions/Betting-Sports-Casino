module intranet.master {
    export interface IBetConfigModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        eventTypes: any[];
        memberId: any;
        chkColumn: {
            eventType: boolean, min: boolean, max: boolean, delay: boolean, exposure: boolean, profit: boolean
        }
    }

    export class BetConfigModalCtrl extends intranet.common.ControllerBase<IBetConfigModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IBetConfigModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private configService: services.ConfigService,
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.getBetConfig();
        }

        private getBetConfig(): void {
            this.userService.getUserById(this.$scope.memberId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        var betConfig = response.data.betConfigs;
                        var eventTypes = [];

                        this.commonDataService.getEventTypes().then((data: any) => {
                            eventTypes = data;
                            angular.forEach(eventTypes, (e: any) => {
                                var index = common.helpers.Utility.IndexOfObject(betConfig, 'eventTypeId', e.id);
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


                            betConfig.forEach((m: any) => {
                                m.name = this.commonDataService.getEventTypeName(m.eventTypeId);
                                m.minBet = this.$filter('toRate')(m.minBet);
                                m.maxBet = this.$filter('toRate')(m.maxBet);
                                m.maxExposure = this.$filter('toRate')(m.maxExposure);
                                m.maxProfit = this.$filter('toRate')(m.maxProfit);
                            });
                            this.$scope.eventTypes = betConfig.filter((a: any) => { return a.name; });
                        });

                    }
                });
        }

        private eventTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.eventTypes.forEach((a: any) => { a.haveChange = this.$scope.chkColumn.eventType; });
            }
            else {
                var result = this.$scope.eventTypes.every((a: any) => { return a.haveChange == true; });
                this.$scope.chkColumn.eventType = result;
            }
        }

        private prepareModal(): any {
            var model: any = { id: this.$scope.memberId, betConfigs: [] };
            this.$scope.eventTypes.forEach((m: any) => {
                m.minBet = this.$filter('toGLC')(m.minBet);
                m.maxBet = this.$filter('toGLC')(m.maxBet);
                m.maxExposure = this.$filter('toGLC')(m.maxExposure);
                m.maxProfit = this.$filter('toGLC')(m.maxProfit);
                delete m.name;
            });
            angular.copy(this.$scope.eventTypes, model.betConfigs);
            return model;
        }

        private saveBetConfig(applyToAll: boolean = false): void {
            var model = this.prepareModal();
            if (model) {
                model.applyAll = applyToAll;
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.updateBetConfig(model);
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

    angular.module('intranet.master').controller('betConfigModalCtrl', BetConfigModalCtrl);
}