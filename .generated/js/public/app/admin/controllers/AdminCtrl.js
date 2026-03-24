var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AdminCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, websiteService, toasterService, accountService, modalService, localStorageHelper, $rootScope, eventTypeService, commonDataService, $state, $window, $sce, $location) {
                super($scope);
                this.settings = settings;
                this.websiteService = websiteService;
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.modalService = modalService;
                this.localStorageHelper = localStorageHelper;
                this.$rootScope = $rootScope;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.$state = $state;
                this.$window = $window;
                this.$sce = $sce;
                this.$location = $location;
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
            loadInitialData() {
                this.getBalance();
                this.getUserData();
                this.fillUserTypes();
                this.loadEventTypes();
                this.$rootScope.current = { short: 'SA', usertype: intranet.common.enums.UserType.SuperAdmin, userId: this.$scope.user.id };
                this.$rootScope.child = { short: 'AD', usertype: intranet.common.enums.UserType.Admin };
            }
            clearCache() {
                this.websiteService.clearAllCache()
                    .success((response) => {
                    if (response.success) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'common.cache.clear.success', 3000);
                    }
                });
            }
            isActive(path) {
                return (this.$location.$$url == path) ? 'active' : '';
            }
            isContain(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
            }
            logout() {
                this.commonDataService.logout();
            }
            loadEventTypes() {
                this.eventTypeService.getActiveEventtype()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                        }
                    }
                });
            }
            fillUserTypes() {
                this.$scope.userTypes = [];
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperAdmin, name: 'SA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Manager, name: 'MGR' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.CP, name: 'CP' });
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            getBalance() {
                this.accountService.getBalance()
                    .success((res) => {
                    if (res.success) {
                        this.$scope.balanceInfo = res.data;
                    }
                });
            }
            getUserData() {
                this.$scope.user = this.commonDataService.getLoggedInUserData();
            }
            changePassword() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'profile.password.change.modal.header';
                modal.data = {
                    userId: this.$scope.user.id
                };
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            mobileNotification() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'notification.modal.header';
                modal.size = 'lg';
                modal.bodyUrl = this.settings.ThemeName + '/admin/user/notify-user-modal.html';
                modal.controller = 'notifyUserModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            webNotification() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'notification.modal.header';
                modal.size = 'lg';
                modal.options.actionButton = 'Done';
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/sa-notification-modal.html';
                modal.controller = 'sANotificationModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            openVideo() {
                var url = this.$state.href('glctv');
                this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
            }
        }
        admin.AdminCtrl = AdminCtrl;
        angular.module('intranet.admin').controller('adminCtrl', AdminCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AdminCtrl.js.map