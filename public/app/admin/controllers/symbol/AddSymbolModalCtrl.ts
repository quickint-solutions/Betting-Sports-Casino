module intranet.admin {

    export interface IAddSymbolModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        symbol: any;
        segmentList: any[];
    }

    export class AddSymbolModalCtrl extends intranet.common.ControllerBase<IAddSymbolModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddSymbolModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private symbolService: services.SymbolService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.symbol = {};
            if (this.modalOptions.data) {
                this.$scope.symbol = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRunner();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            var status: any = common.enums.Segment;
            this.$scope.segmentList = common.helpers.Utility.enumToArray<common.enums.Segment>(status);
            if (this.$scope.symbol.segment) { this.$scope.symbol.segment = this.$scope.symbol.segment.toString(); }
            else { this.$scope.symbol.segment = this.$scope.segmentList[0].id.toString();}
        }

        private saveRunner(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.symbol.id) {
                promise = this.symbolService.updateSymbol(this.$scope.symbol);
            }
            else { promise = this.symbolService.addSymbol(this.$scope.symbol); }
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
    angular.module('intranet.admin').controller('addSymbolModalCtrl', AddSymbolModalCtrl);
}