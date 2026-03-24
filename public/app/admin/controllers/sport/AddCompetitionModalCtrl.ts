module intranet.admin {

    export interface IAddCompetitionModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        competition: any;
    }

    export class AddCompetitionModalCtrl extends intranet.common.ControllerBase<IAddCompetitionModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddCompetitionModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private competitionService: services.CompetitionService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }
        
        private saveCompetitionDetail(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.competition.id) { promise = this.competitionService.updateCompetition(this.$scope.competition); }
            else { promise = this.competitionService.addCompetition(this.$scope.competition); }
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
    angular.module('intranet.admin').controller('addCompetitionModalCtrl', AddCompetitionModalCtrl);
}