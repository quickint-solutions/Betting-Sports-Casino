var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddCompetitionModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, competitionService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.competitionService = competitionService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.competition = {};
                if (this.modalOptions.data) {
                    this.$scope.competition = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveCompetitionDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveCompetitionDetail() {
                var promise;
                if (this.$scope.competition.id) {
                    promise = this.competitionService.updateCompetition(this.$scope.competition);
                }
                else {
                    promise = this.competitionService.addCompetition(this.$scope.competition);
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
        admin.AddCompetitionModalCtrl = AddCompetitionModalCtrl;
        angular.module('intranet.admin').controller('addCompetitionModalCtrl', AddCompetitionModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddCompetitionModalCtrl.js.map