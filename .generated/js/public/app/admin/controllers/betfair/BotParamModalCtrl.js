var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BotParamModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, betfairService, marketRuleService, localStorageHelper, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.betfairService = betfairService;
                this.marketRuleService = marketRuleService;
                this.localStorageHelper = localStorageHelper;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.temporaryStatusList = [];
                this.$scope.messages = [];
                this.$scope.onlyRate = false;
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.market = { syncData: false, allowCommission: false, volumeRate: 10, inPlayVolumeRate: 80, allowLimit: true, inPlayAllowLimit: true };
                if (this.modalOptions.data) {
                    this.$scope.onlyRate = this.modalOptions.data.onlyRate;
                    this.$scope.market.volumeRate = this.modalOptions.data.volumeRate;
                    this.$scope.market.inPlayVolumeRate = this.modalOptions.data.inPlayVolumeRate;
                    this.$scope.market.maxBet = this.modalOptions.data.maxBet;
                    this.$scope.market.maxLiability = this.modalOptions.data.maxLiability;
                    this.$scope.market.maxProfit = this.modalOptions.data.maxProfit;
                    this.$scope.market.marketRuleId = this.modalOptions.data.marketRuleId;
                    this.$scope.market.allowLimit = this.modalOptions.data.allowLimit;
                    this.$scope.market.inPlayAllowLimit = this.modalOptions.data.inPlayAllowLimit;
                    this.$scope.market.temporaryStatus = this.modalOptions.data.temporaryStatus;
                    this.$scope.market.betOpenTime = this.modalOptions.data.betOpenTime;
                    this.$scope.market.betCloseTime = this.modalOptions.data.betCloseTime;
                    this.$scope.market.displayOrder = this.modalOptions.data.displayOrder;
                    this.$scope.market.allowBetUpTo = this.modalOptions.data.allowBetUpTo;
                    this.$scope.market.allowBetDownTo = this.modalOptions.data.allowBetDownTo;
                    this.$scope.market.limitOddsDiff = this.modalOptions.data.limitOddsDiff;
                    this.$scope.market.betDelay = this.modalOptions.data.betDelay;
                }
                else {
                    var bot = this.localStorageHelper.getCookie('market.bot.param');
                    if (bot != undefined) {
                        this.$scope.market.volumeRate = bot.volumeRate;
                        this.$scope.market.inPlayVolumeRate = bot.inPlayVolumeRate;
                        this.$scope.market.maxBet = bot.maxBet;
                        this.$scope.market.maxLiability = bot.maxLiability;
                        this.$scope.market.maxProfit = bot.maxProfit;
                        this.$scope.market.marketRuleId = bot.marketRuleId;
                        this.$scope.market.allowLimit = bot.allowLimit;
                        this.$scope.market.syncData = bot.syncData;
                        this.$scope.market.allowCommission = bot.allowCommission;
                        this.$scope.market.inPlayAllowLimit = bot.inPlayAllowLimit;
                        this.$scope.market.temporaryStatus = bot.temporaryStatus;
                        this.$scope.market.displayOrder = bot.displayOrder;
                        this.$scope.market.group = bot.group;
                        this.$scope.market.allowBetUpTo = bot.allowBetUpTo;
                        this.$scope.market.allowBetDownTo = bot.allowBetDownTo;
                        this.$scope.market.limitOddsDiff = bot.limitOddsDiff;
                        this.$scope.market.betDelay = bot.betDelay;
                    }
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveBetfairAccount();
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
            loadTemporaryStatus() {
                this.$scope.temporaryStatusList.push({ id: 1, name: 'Open' });
                this.$scope.temporaryStatusList.push({ id: 3, name: 'StopBetting' });
                if (!this.$scope.market.temporaryStatus) {
                    this.$scope.market.temporaryStatus = this.$scope.temporaryStatusList[0].id.toString();
                }
            }
            loadInitialData() {
                this.loadTemporaryStatus();
                this.loadMarketRules();
                var marketGroup = intranet.common.enums.MarketGroup;
                this.$scope.marketGroupList = intranet.common.helpers.Utility.enumToArray(marketGroup);
                if (!this.$scope.market.group)
                    this.$scope.market.group = this.$scope.marketGroupList[0].id.toString();
                var scoresource = intranet.common.enums.ScoreSource;
                this.$scope.scoreSourceList = intranet.common.helpers.Utility.enumToArray(scoresource);
                if (!this.$scope.market.scoreSource)
                    this.$scope.market.scoreSource = this.$scope.scoreSourceList[1].id.toString();
            }
            saveBetfairAccount() {
                this.localStorageHelper.setCookie('market.bot.param', this.$scope.market);
                this.$uibModalInstance.close({ data: this.$scope.market, button: intranet.common.services.ModalResult.OK });
            }
        }
        admin.BotParamModalCtrl = BotParamModalCtrl;
        angular.module('intranet.admin').controller('botParamModalCtrl', BotParamModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BotParamModalCtrl.js.map