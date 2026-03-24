var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTRulesController extends common.ControllerBase {
                constructor($scope, $filter, settings, marketRuleService, modalService) {
                    super($scope);
                    this.$filter = $filter;
                    this.settings = settings;
                    this.marketRuleService = marketRuleService;
                    this.modalService = modalService;
                    this.$scope.islts = this.settings.ThemeName == 'lotus';
                    super.init(this);
                }
                showRule() {
                    if (this.$scope.market) {
                        var m = this.$scope.market;
                        var modal = new common.helpers.CreateModal();
                        modal.data = {
                            clarification: m.clarification,
                            maxBet: m.maxBet,
                            maxLiability: m.maxLiability,
                            maxProfit: m.maxProfit,
                            gameType: m.gameType,
                            allowBetUpTo: m.allowBetUpTo,
                            allowLimit: m.allowLimit,
                            inPlayAllowLimit: m.inPlayAllowLimit,
                        };
                        if (m.marketRuleId) {
                            var promise;
                            promise = this.marketRuleService.getMarketRulebyId(m.marketRuleId);
                            if (promise) {
                                promise.success((response) => {
                                    if (response.success) {
                                        modal.data.rule = response.data.rule;
                                    }
                                }).finally(() => {
                                    if (this.$scope.isGame == "true") {
                                        this.showGameRule(modal);
                                    }
                                    else {
                                        modal.data.startTime = m.event ? m.event.openDate : '';
                                        modal.data.betOpenTime = m.betOpenTime;
                                        modal.data.betCloseTime = m.betCloseTime;
                                        this.showMarketRule(modal);
                                    }
                                });
                            }
                        }
                    }
                }
                showMarketRule(modal) {
                    modal.header = "Rules";
                    modal.size = modal.data.clarification || modal.data.rule ? 'lg' : 'md';
                    modal.bodyUrl = 'app/common/components/kt-rules/kt-rules-modal.html';
                    modal.controller = 'ktRulesModalCtrl';
                    modal.options.actionButton = '';
                    modal.options.closeButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
                showStatisRules() {
                    var modal = new common.helpers.CreateModal();
                    modal.header = "Rules";
                    modal.size = 'lg';
                    modal.bodyUrl = this.settings.ThemeName + '/home/rules-modal.html';
                    modal.controller = 'rulesModalCtrl';
                    modal.options.actionButton = '';
                    modal.options.closeButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
                showGameRule(modal) {
                    var msg = this.$filter('translate')('market.rules.modal.header');
                    msg = msg.format(this.$scope.market.name);
                    modal.header = msg;
                    modal.size = modal.data.clarification || modal.data.rule ? 'lg' : 'sm';
                    modal.bodyUrl = 'app/common/components/kt-rules/kt-game-rules-modal.html';
                    modal.controller = 'ktGameRulesModalCtrl';
                    modal.options.actionButton = '';
                    modal.options.closeButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
            }
            angular.module('kt.components')
                .controller('KTRulesController', KTRulesController);
            angular.module('kt.components')
                .directive('ktRules', (settings) => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        market: '=',
                        openDate: '@?',
                        isGame: '@?',
                        text: '@?'
                    },
                    templateUrl: settings.ThemeName == 'betfair'
                        ? 'app/common/components/kt-rules/kt-rules-betfair.html'
                        : 'app/common/components/kt-rules/kt-rules.html',
                    controller: 'KTRulesController',
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-rules-controller.js.map