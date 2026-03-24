var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddMarketModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, marketService, runnerService, marketRuleService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.marketService = marketService;
                this.runnerService = runnerService;
                this.marketRuleService = marketRuleService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
                var activeDate = moment();
                if ($view == 'day') {
                    activeDate = moment().subtract(1, 'd');
                }
                if ($view == 'hour') {
                    activeDate = moment().subtract(1, 'h');
                }
                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf();
                }).forEach(function (date) {
                    date.selectable = false;
                });
            }
            loadInitialData() {
                var ladder = intranet.common.enums.PriceLadderType;
                this.$scope.ladderTypeList = intranet.common.helpers.Utility.enumToArray(ladder);
                if (!this.$scope.market.priceLadderType) {
                    this.$scope.market.priceLadderType = this.$scope.ladderTypeList[0].id.toString();
                }
                else {
                    this.$scope.market.priceLadderType = this.$scope.market.priceLadderType.toString();
                }
                var bettingType = intranet.common.enums.BettingType;
                this.$scope.bettingTypeList = intranet.common.helpers.Utility.enumToArray(bettingType);
                if (!this.$scope.market.bettingType) {
                    this.$scope.market.bettingType = this.$scope.bettingTypeList[0].id.toString();
                }
                else {
                    this.$scope.market.bettingType = this.$scope.market.bettingType.toString();
                }
                if (this.$scope.market.marketRunner && this.$scope.market.marketRunner.length > 0) {
                    this.$scope.market.selectedRunner = [];
                    this.$scope.market.marketRunner.forEach((mr) => {
                        this.$scope.market.selectedRunner.push({ name: mr.runner.name, id: mr.runner.id });
                    });
                }
                var marketGroup = intranet.common.enums.MarketGroup;
                this.$scope.marketGroupList = intranet.common.helpers.Utility.enumToArray(marketGroup);
                if (!this.$scope.market.group) {
                    this.$scope.market.group = this.$scope.marketGroupList[0].id.toString();
                }
                else {
                    this.$scope.market.group = this.$scope.market.group.toString();
                }
                this.$scope.marketTypeList = [];
                this.$scope.marketTypeList.push({ id: null, name: 'None' });
                this.$scope.marketTypeList.push({ id: 'EXCHANGE_GAME', name: 'EXCHANGE_GAME' });
                this.$scope.marketTypeList.push({ id: 'MATCH_ODDS', name: 'MATCH_ODDS' });
                this.$scope.marketTypeList.push({ id: 'BINARY', name: 'BINARY' });
                this.loadMarketRules();
                this.loadGameType();
            }
            loadGameType() {
                this.$scope.gameTypeList = [];
                var gameType = intranet.common.enums.GameType;
                this.$scope.gameTypeList = intranet.common.helpers.Utility.enumToArray(gameType);
                this.$scope.gameTypeList.push({ id: null, name: 'None' });
                if (this.$scope.market.gameType) {
                    this.$scope.market.gameType = this.$scope.market.gameType.toString();
                }
                else {
                    this.$scope.market.gameType = null;
                }
            }
            loadMarketRules() {
                this.marketRuleService.getMarketRules()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketRulesList = response.data;
                        this.$scope.marketRulesList.splice(0, 0, { id: '0', name: '-- Select Market Rule --' });
                        if (!this.$scope.market.marketRuleId) {
                            this.$scope.market.marketRuleId = '0';
                        }
                        else {
                            this.$scope.market.marketRuleId = this.$scope.market.marketRuleId.toString();
                        }
                    }
                });
            }
            searchRunner(search) {
                if (search) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.runnerService.searchRunner({ Name: search });
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.runnerList = response.data;
                            if (search) {
                                var existed = this.$scope.runnerList.some((a) => { return a.name.toLowerCase() == search.toLowerCase(); });
                                if (!existed) {
                                    this.$scope.runnerList.push({ name: search });
                                }
                            }
                            if (this.$scope.runnerList.length > 0) {
                                if (this.$scope.market.selectedRunner) {
                                    this.$scope.market.selectedRunner.forEach((sr) => {
                                        var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.runnerList, 'name', sr.name, true);
                                        if (index > -1) {
                                            this.$scope.runnerList.splice(index, 1);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                else {
                    this.$scope.runnerList = [];
                }
            }
            saveMarket() {
                this.$scope.market.marketRunner = [];
                angular.forEach(this.$scope.market.selectedRunner, (value) => {
                    var runner = { name: value.name, id: value.id };
                    this.$scope.market.marketRunner.push({ runner: runner });
                });
                if (this.$scope.market.marketRuleId == '0') {
                    this.$scope.market.marketRuleId = null;
                }
                var promise;
                if (this.$scope.market.id) {
                    promise = this.marketService.updateMarket(this.$scope.market);
                }
                else {
                    promise = this.marketService.addMarket(this.$scope.market);
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
        admin.AddMarketModalCtrl = AddMarketModalCtrl;
        angular.module('intranet.admin').controller('addMarketModalCtrl', AddMarketModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddMarketModalCtrl.js.map