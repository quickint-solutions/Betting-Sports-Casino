module intranet.admin {

    export interface IChangeWebsiteModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        user: any;
        websites: any[];
    }

    export class ChangeWebsiteModalCtrl extends intranet.common.ControllerBase<IChangeWebsiteModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IChangeWebsiteModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private userService: services.UserService,
            private websiteService: services.WebsiteService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadWebsites();
        }

        private getUserTypeShort(type: any): any {
            return super.getUserTypesShort(type);
        }


        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        if (this.$scope.websites) {
                            if (!this.$scope.user.websiteId) {
                                this.$scope.user.websiteId = this.$scope.websites[0].id.toString();
                            } else {
                                this.$scope.user.websiteId = this.$scope.user.websiteId.toString();
                            }
                        }
                    }
                });
        }



        private saveUserDetail(): void {
            if (this.$scope.user.applyAll) {
                this.modalService.showConfirmation("Are you Mr.Das?", "Website change confirmation").then((result1: any) => {
                    if (result1.button == common.services.ModalResult.OK) {
                        this.modalService.showConfirmation("Then are you sure DAS!, you want to change website for ALL CHILD?", "Website change confirmation").then((result2: any) => {
                            if (result2.button == common.services.ModalResult.OK) {
                                this.save();
                            }
                        });
                    } else { this.save(); }
                });
            } else { this.save(); }
        }

        private save() {
            var promise: ng.IHttpPromise<any>;
            promise = this.userService.changeWebsite(this.$scope.user);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data && response.data.id) {
                        this.$uibModalInstance.close({ data: response.data, button: common.services.ModalResult.OK });
                    } else {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    this.toasterService.showMessages(response.messages, 3000);

                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }

    angular.module('intranet.admin').controller('changeWebsiteModalCtrl', ChangeWebsiteModalCtrl);
}