var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTGameRulesModalCtrl extends common.ControllerBase {
                constructor($scope, $uibModalInstance, settings, modalOptions) {
                    super($scope);
                    this.$uibModalInstance = $uibModalInstance;
                    this.settings = settings;
                    this.modalOptions = modalOptions;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.showCardRank = false;
                    this.$scope.modalOptions = this.modalOptions;
                    this.$scope.imagePath = this.settings.ImagePath + 'images/';
                    if (this.modalOptions.data) {
                        this.$scope.market = this.modalOptions.data;
                        if (this.$scope.market.gameType == common.enums.GameType.Patti2
                            || this.$scope.market.gameType == common.enums.GameType.Patti3
                            || this.$scope.market.gameType == common.enums.GameType.PattiODI) {
                            this.$scope.showCardRank = true;
                        }
                    }
                    this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
                    this.$scope.modalOptions.close = result => {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
                    };
                }
            }
            directives.KTGameRulesModalCtrl = KTGameRulesModalCtrl;
            angular.module('kt.components').controller('ktGameRulesModalCtrl', KTGameRulesModalCtrl);
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-game-rules-modal-controller.js.map