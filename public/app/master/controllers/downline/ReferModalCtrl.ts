module intranet.master {
    export interface IReferModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        baseUrl: any;
    }

    export class ReferModalCtrl extends intranet.common.ControllerBase<IReferModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IReferModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $location: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
            }

            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    this.$scope.baseUrl = data.url + '#';
                }).finally(() => { this.getLink(); });
        }

        private getLink() {
            this.userService.getReferenceLink(this.$scope.item.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.item.link = response.data.link;
                        this.$scope.item.freeCredit = this.$filter('toRate')(response.data.freeCredit);
                        this.$scope.item.refeLink = this.$scope.baseUrl + '?code=' + response.data.link;
                    }
                });
        }

        public generateLink() {
            if (!this.$scope.item.freeCredit) { this.$scope.item.freeCredit = 0;}
            var data = { userId: this.$scope.item.id, freeCredit: this.$filter('toGLC')(this.$scope.item.freeCredit) };
            this.userService.generateLInk(data)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.item.link = response.data.link;
                        this.$scope.item.refeLink = this.$scope.baseUrl + '?code=' + response.data.link;
                    } else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
        }

        public copyCode() {
            this.commonDataService.copyText(this.$scope.item.link);
        }

        public copyReferLink() {
            this.commonDataService.copyText(this.$scope.item.refeLink);
        }
    }

    angular.module('intranet.master').controller('referModalCtrl', ReferModalCtrl);
}