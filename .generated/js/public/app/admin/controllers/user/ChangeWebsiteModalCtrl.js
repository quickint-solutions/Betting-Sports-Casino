var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ChangeWebsiteModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, modalService, userService, websiteService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.userService = userService;
                this.websiteService = websiteService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.user = {};
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                    this.$scope.user.applyAll = false;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveUserDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadWebsites();
            }
            getUserTypeShort(type) {
                return super.getUserTypesShort(type);
            }
            loadWebsites() {
                this.websiteService.getWebsites()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        if (this.$scope.websites) {
                            if (!this.$scope.user.websiteId) {
                                this.$scope.user.websiteId = this.$scope.websites[0].id.toString();
                            }
                            else {
                                this.$scope.user.websiteId = this.$scope.user.websiteId.toString();
                            }
                        }
                    }
                });
            }
            saveUserDetail() {
                if (this.$scope.user.applyAll) {
                    this.modalService.showConfirmation("Are you Mr.Das?", "Website change confirmation").then((result1) => {
                        if (result1.button == intranet.common.services.ModalResult.OK) {
                            this.modalService.showConfirmation("Then are you sure DAS!, you want to change website for ALL CHILD?", "Website change confirmation").then((result2) => {
                                if (result2.button == intranet.common.services.ModalResult.OK) {
                                    this.save();
                                }
                            });
                        }
                        else {
                            this.save();
                        }
                    });
                }
                else {
                    this.save();
                }
            }
            save() {
                var promise;
                promise = this.userService.changeWebsite(this.$scope.user);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        if (response.data && response.data.id) {
                            this.$uibModalInstance.close({ data: response.data, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.ChangeWebsiteModalCtrl = ChangeWebsiteModalCtrl;
        angular.module('intranet.admin').controller('changeWebsiteModalCtrl', ChangeWebsiteModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ChangeWebsiteModalCtrl.js.map