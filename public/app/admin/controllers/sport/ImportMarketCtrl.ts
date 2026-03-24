module intranet.admin {

    export interface IImportMarketScope extends intranet.common.IScopeBase {
        jsonDataFile: any;
        markets: any;
        allSelected: any;

        search: any;
        promiseItem: any;

        eventname: any;
    }

    export class ImportMarketCtrl extends intranet.common.ControllerBase<IImportMarketScope>
        implements common.init.IInit {
        constructor($scope: IImportMarketScope,
            private $stateParams: any,
            private runnerService: services.RunnerService,
            private marketService: services.MarketService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {};
            this.$scope.allSelected = true;
            this.$scope.eventname = this.$stateParams.eventName;
        }

        public loadInitialData(): void {
        }
        
        private marketSelectionChanged(all: boolean = false): void {
            if (all) {
                this.$scope.markets.forEach((a: any) => {
                    a.selected = this.$scope.allSelected;
                    delete a.eventId;
                });
            }
            else {
                var result = this.$scope.markets.every((a: any) => { return a.selected == true; });
                this.$scope.allSelected = result;
            }

        }

        private getBettingType(t: any): any {
            return common.enums.BettingType[t];
        }

        private getPriceLadder(t: any): any {
            return common.enums.PriceLadderType[t];
        }

        private getGroup(t: any): any {
            return common.enums.MarketGroup[t];
        }

        public processFile(): void {
            var reader = new FileReader();
            var self = this;
            reader.onload = function () {
                if (reader.result) {
                    self.$scope.markets = JSON.parse(reader.result);
                    self.marketSelectionChanged(true);
                    self.$scope.$apply();
                }
            };
            reader.readAsText(this.$scope.ctrl.jsonDataFile);
        }

        private reset(): void {
            this.$scope.markets = [];
        }

        private searchRunner(search: string, m: any): void {
            if (search) {

                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }

                this.$scope.promiseItem = this.runnerService.searchRunner({ Name: search });
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        m.runnerList = response.data;
                        if (search) {
                            var existed = m.runnerList.some((a: any) => { return a.name.toLowerCase() == search.toLowerCase(); });
                            if (!existed) { m.runnerList.push({ name: search }); }
                        }
                        if (m.runnerList.length > 0) {
                            if (m.selectedRunner) {
                                m.selectedRunner.forEach((sr: any) => {
                                    var index = common.helpers.Utility.IndexOfObject(m.runnerList, 'name', sr.name, true);
                                    if (index > -1) {
                                        m.runnerList.splice(index, 1);
                                    }
                                });
                            }
                        }
                    });
                }

            } else {
                m.runnerList = [];
            }
        }

        private submitMarkets(): void {
            var selectedmr = this.$scope.markets.filter((a: any) => { return a.selected == true });
            console.log("Total selected market is " + selectedmr.length);
            console.log(angular.toJson(selectedmr));

            if (this.$stateParams.eventId) {
                angular.forEach(this.$scope.markets, (m: any) => {
                    if (m.selected == true) {
                        m.eventId = this.$stateParams.eventId;
                        m.marketRunner = [];
                        if (m.selectedRunner.length > 0) {
                            angular.forEach(m.selectedRunner, (value: any) => {
                                var runner = { name: value.name, id: value.id }
                                m.marketRunner.push({ runner: runner });
                            });
                            this.marketService.addMarket(m)
                                .success((response: common.messaging.IResponse<any>) => {
                                    if (response.success) {
                                        this.toasterService.showToast(common.helpers.ToastType.Success, m.name, 3000);
                                        m.selected = false;
                                    } else {
                                        this.toasterService.showToast(common.helpers.ToastType.Success, m.name, 3000);
                                    }
                                });
                        }
                    }
                });
            } else { this.toasterService.showToast(common.helpers.ToastType.Error, "Loda pela EVENT select kar ne", 3000); }
        }

        private replaceTeamName(): void {
            if (this.$scope.search.teamA.length > 0 && this.$scope.search.teamB.length > 0) {
                angular.forEach(this.$scope.markets, (m: any) => {
                    if (m.name.indexOf('{team-a}') > -1) {
                        m.name = m.name.replaceAll('{team-a}', this.$scope.search.teamA);
                    }
                    if (m.name.indexOf('{team-b}') > -1) {
                        m.name = m.name.replaceAll('{team-b}', this.$scope.search.teamB);
                    }
                });
            }
        }
    }

    angular.module('intranet.admin').controller('importMarketCtrl', ImportMarketCtrl);
}