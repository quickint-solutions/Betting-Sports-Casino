namespace intranet.common.directives {

    export interface IKTRulesScope extends common.IScopeBase {
        market: any;
        openDate: any;
        isGame: any;
        text: any;
        islts: any;
    }

    class KTRulesController extends ControllerBase<IKTRulesScope>
    {
        /* @ngInject */
        constructor($scope: IKTRulesScope,
            private $filter: any,
            private settings: common.IBaseSettings,
            private marketRuleService: intranet.services.MarketRuleService,
            private modalService: common.services.ModalService) {
            super($scope);

            this.$scope.islts = this.settings.ThemeName == 'lotus';

            super.init(this);
        }

        public showRule(): void {
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
                    var promise: ng.IHttpPromise<any>;
                    //else if (this.settings.ThemeName == "lotus" && this.$scope.isGame != "true") { this.showStatisRules(); }

                    promise = this.marketRuleService.getMarketRulebyId(m.marketRuleId)

                    if (promise) {
                        promise.success((response: common.messaging.IResponse<any>) => {
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

        private showMarketRule(modal: any): void {
            //var msg: string = this.$filter('translate')('market.rules.modal.header');
            //msg = msg.format(this.$scope.market.name);
            modal.header = "Rules";
            modal.size = modal.data.clarification || modal.data.rule ? 'lg' : 'md';
            modal.bodyUrl = 'app/common/components/kt-rules/kt-rules-modal.html';
            modal.controller = 'ktRulesModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private showStatisRules(): void {
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

        private showGameRule(modal: any): void {
            var msg: string = this.$filter('translate')('market.rules.modal.header');
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
        .directive('ktRules', (settings: common.IBaseSettings) => {
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
}