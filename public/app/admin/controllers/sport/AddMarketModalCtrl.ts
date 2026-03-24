module intranet.admin {

    export interface IAddMarketModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        market: any;

        ladderTypeList: any[];
        bettingTypeList: any[];
        marketGroupList: any[];
        marketRulesList: any[];
        marketTypeList: any[];
        gameTypeList: any[];

        // for auto complete
        runnerList: any[];
        promiseItem: any;
    }

    export class AddMarketModalCtrl extends intranet.common.ControllerBase<IAddMarketModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddMarketModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private marketService: services.MarketService,
            private runnerService: services.RunnerService,
            private marketRuleService: services.MarketRuleService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.market = {};
            if (this.modalOptions.data) {
                this.$scope.market = this.modalOptions.data;
            }
            if (!this.$scope.market.id) {
                this.$scope.market.allowCommission = false;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveMarket();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
            var activeDate = moment();
            if ($view == 'day') { activeDate = moment().subtract(1, 'd'); }
            if ($view == 'hour') { activeDate = moment().subtract(1, 'h'); }
            $dates.filter(function (date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false
            })
        }

        public loadInitialData(): void {
            var ladder: any = common.enums.PriceLadderType;
            this.$scope.ladderTypeList = common.helpers.Utility.enumToArray<common.enums.PriceLadderType>(ladder);
            if (!this.$scope.market.priceLadderType)
            { this.$scope.market.priceLadderType = this.$scope.ladderTypeList[0].id.toString(); }
            else { this.$scope.market.priceLadderType = this.$scope.market.priceLadderType.toString(); }

            var bettingType: any = common.enums.BettingType;
            this.$scope.bettingTypeList = common.helpers.Utility.enumToArray<common.enums.BettingType>(bettingType);
            if (!this.$scope.market.bettingType)
            { this.$scope.market.bettingType = this.$scope.bettingTypeList[0].id.toString(); }
            else { this.$scope.market.bettingType = this.$scope.market.bettingType.toString(); }

            if (this.$scope.market.marketRunner && this.$scope.market.marketRunner.length > 0) {
                this.$scope.market.selectedRunner = [];
                this.$scope.market.marketRunner.forEach((mr: any) => {
                    this.$scope.market.selectedRunner.push({ name: mr.runner.name, id: mr.runner.id });
                });
            }

            var marketGroup: any = common.enums.MarketGroup;
            this.$scope.marketGroupList = common.helpers.Utility.enumToArray<common.enums.PriceLadderType>(marketGroup);
            if (!this.$scope.market.group)
            { this.$scope.market.group = this.$scope.marketGroupList[0].id.toString(); }
            else { this.$scope.market.group = this.$scope.market.group.toString(); }

            this.$scope.marketTypeList = [];
            this.$scope.marketTypeList.push({ id: null, name: 'None' });
            this.$scope.marketTypeList.push({ id: 'EXCHANGE_GAME', name: 'EXCHANGE_GAME' });
            this.$scope.marketTypeList.push({ id: 'MATCH_ODDS', name: 'MATCH_ODDS' });
            this.$scope.marketTypeList.push({ id: 'BINARY', name: 'BINARY' });


            this.loadMarketRules();
            this.loadGameType();
        }

        private loadGameType(): void {
            this.$scope.gameTypeList = [];
            var gameType: any = common.enums.GameType;
            this.$scope.gameTypeList = common.helpers.Utility.enumToArray<common.enums.GameType>(gameType);
            this.$scope.gameTypeList.push({ id: null, name: 'None' });

            if (this.$scope.market.gameType) {
                this.$scope.market.gameType = this.$scope.market.gameType.toString();
            } else {
                this.$scope.market.gameType = null;
            }

        }

        private loadMarketRules(): void {
            this.marketRuleService.getMarketRules()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.marketRulesList = response.data;
                        this.$scope.marketRulesList.splice(0, 0, { id: '0', name: '-- Select Market Rule --' });

                        if (!this.$scope.market.marketRuleId)
                        { this.$scope.market.marketRuleId = '0'; }
                        else { this.$scope.market.marketRuleId = this.$scope.market.marketRuleId.toString(); }

                    }
                });
        }

        private searchRunner(search: string): void {
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
                        this.$scope.runnerList = response.data;
                        if (search) {
                            var existed = this.$scope.runnerList.some((a: any) => { return a.name.toLowerCase() == search.toLowerCase(); });
                            if (!existed) { this.$scope.runnerList.push({ name: search }); }
                        }
                        if (this.$scope.runnerList.length > 0) {
                            if (this.$scope.market.selectedRunner) {
                                this.$scope.market.selectedRunner.forEach((sr: any) => {
                                    var index = common.helpers.Utility.IndexOfObject(this.$scope.runnerList, 'name', sr.name, true);
                                    if (index > -1) {
                                        this.$scope.runnerList.splice(index, 1);
                                    }
                                });
                            }
                        }
                    });
                }

            } else {
                this.$scope.runnerList = [];
            }
        }

        private saveMarket(): void {
            this.$scope.market.marketRunner = [];
            angular.forEach(this.$scope.market.selectedRunner, (value: any) => {
                var runner = { name: value.name, id: value.id };
                this.$scope.market.marketRunner.push({ runner: runner });
            });

            if (this.$scope.market.marketRuleId == '0') { this.$scope.market.marketRuleId = null; }
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.market.id) {
                promise = this.marketService.updateMarket(this.$scope.market);
            }
            else {
                promise = this.marketService.addMarket(this.$scope.market);
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
    angular.module('intranet.admin').controller('addMarketModalCtrl', AddMarketModalCtrl);
}