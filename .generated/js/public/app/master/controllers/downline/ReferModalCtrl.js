var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ReferModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $filter, $location, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$location = $location;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                }
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    this.$scope.baseUrl = data.url + '#';
                }).finally(() => { this.getLink(); });
            }
            getLink() {
                this.userService.getReferenceLink(this.$scope.item.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.item.link = response.data.link;
                        this.$scope.item.freeCredit = this.$filter('toRate')(response.data.freeCredit);
                        this.$scope.item.refeLink = this.$scope.baseUrl + '?code=' + response.data.link;
                    }
                });
            }
            generateLink() {
                if (!this.$scope.item.freeCredit) {
                    this.$scope.item.freeCredit = 0;
                }
                var data = { userId: this.$scope.item.id, freeCredit: this.$filter('toGLC')(this.$scope.item.freeCredit) };
                this.userService.generateLInk(data)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.item.link = response.data.link;
                        this.$scope.item.refeLink = this.$scope.baseUrl + '?code=' + response.data.link;
                    }
                    else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            copyCode() {
                this.commonDataService.copyText(this.$scope.item.link);
            }
            copyReferLink() {
                this.commonDataService.copyText(this.$scope.item.refeLink);
            }
        }
        master.ReferModalCtrl = ReferModalCtrl;
        angular.module('intranet.master').controller('referModalCtrl', ReferModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ReferModalCtrl.js.map