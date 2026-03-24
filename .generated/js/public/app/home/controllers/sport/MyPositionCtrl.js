var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyPositionCtrl extends intranet.common.ControllerBase {
            constructor($scope, positionService, settings, $uibModalInstance, modalOptions) {
                super($scope);
                this.positionService = positionService;
                this.settings = settings;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.positions = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.marketId = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => ({ data: null, button: intranet.common.services.ModalResult.Cancel });
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadScorePosition();
            }
            loadScorePosition() {
                var promise;
                promise = this.positionService.getMyScorePosition(this.$scope.marketId);
                if (promise) {
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.positions = response.data;
                        }
                    });
                }
            }
        }
        home.MyPositionCtrl = MyPositionCtrl;
        angular.module('intranet.home').controller('myPositionCtrl', MyPositionCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyPositionCtrl.js.map