module intranet.admin {
    export interface IAdminScope extends intranet.common.IScopeBase {
        breadcrumbPath: string;
        balanceInfo: any;
        user: any;
        userTypes: any[];
    }

    export class AdminCtrl extends intranet.common.ControllerBase<IAdminScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IAdminScope,
            private settings: common.IBaseSettings,
            private websiteService: services.WebsiteService,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
            private modalService: common.services.ModalService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            protected $rootScope: any,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private $state: any,
            private $window: any,
            private $sce: any,
            private $location: any) {
            super($scope);

            var refreshBalance = this.$rootScope.$on("admin-balance-changed", () => {
                this.getBalance();
            });

            if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'sky' || this.settings.ThemeName == 'lotus') {
                this.$rootScope.viewPort = "";
            }

            document.body.setAttribute('class', 'cbg');

            this.$scope.$on('$destroy', () => {
                refreshBalance();
            });

            this.$scope.breadcrumbPath = this.settings.ThemeName + '/template/breadcrumb.html';
            super.init(this);
        }

        public loadInitialData(): void {
            this.getBalance();
            this.getUserData();
            this.fillUserTypes();
            this.loadEventTypes();

            this.$rootScope.current = { short: 'SA', usertype: common.enums.UserType.SuperAdmin, userId: this.$scope.user.id }
            this.$rootScope.child = { short: 'AD', usertype: common.enums.UserType.Admin }
        }

        private clearCache() {
            this.websiteService.clearAllCache()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'common.cache.clear.success', 3000);
                    }
                });
        }

        private isActive(path: string): string {
            return (this.$location.$$url == path) ? 'active' : '';
        }

        private isContain(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
        }

        private logout(): void {
            this.commonDataService.logout();
        }

        private loadEventTypes(): void {
            this.eventTypeService.getActiveEventtype()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                        }
                    }
                });
        }

        private fillUserTypes(): void {
            this.$scope.userTypes = [];
            this.$scope.userTypes.push({ id: common.enums.UserType.SuperAdmin, name: 'SA' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Manager, name: 'MGR' });
            this.$scope.userTypes.push({ id: common.enums.UserType.CP, name: 'CP' });
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }

        private getBalance(): void {
            this.accountService.getBalance()
                .success((res: common.messaging.IResponse<any>) => {
                    if (res.success) {
                        this.$scope.balanceInfo = res.data;
                    }
                });
        }

        private getUserData(): void {
            this.$scope.user = this.commonDataService.getLoggedInUserData();
        }

        private changePassword(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'profile.password.change.modal.header';
            modal.data = {
                userId: this.$scope.user.id
            }

            modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
            modal.controller = 'changePasswordModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private mobileNotification(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'notification.modal.header';
            modal.size = 'lg';
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/notify-user-modal.html';
            modal.controller = 'notifyUserModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private webNotification(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'notification.modal.header';
            modal.size = 'lg';
            modal.options.actionButton = 'Done';
            modal.bodyUrl = this.settings.ThemeName + '/admin/account/sa-notification-modal.html';
            modal.controller = 'sANotificationModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private openVideo(): void {
            var url = this.$state.href('glctv');
            this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
        }
    }
    angular.module('intranet.admin').controller('adminCtrl', AdminCtrl);
}