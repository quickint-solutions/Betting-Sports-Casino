module intranet.home {
    export interface ILoginScope extends intranet.common.IScopeBase {
        model: { username: string, password: string, captcha: string };
        captcha: any;
        refreshCaptcha: any;
        imagePath: any;

        isBFLabel: boolean;
        isRegisterEnabled: any;
        supportDetail: any;

        spinnerImg: any;
        showLoading: boolean;

        // 0=all themes, 1=winexch/top365, 2=fairbook, 3=royalpatti, 4=lvexh
        loginMode: any;
        currentWebApp: string;
        currentWebTitle: string;

        // 1=login, 2=change password
        formMode: number;
        cp_messages: common.messaging.ResponseMessage[];
        cp_model: { oldpassword: string, newpassword: string, confirmpassword: string };
        userId: any;

        //download app
        hasAPK: boolean;

        cloudInterval: any;
        captchBG: any;

        captchaMode: any;
        gWidgetId: any;
        gCaptchaPromise: any;
        gCaptchKey: any;

        sports: any[];
        races: any[];
        popularMarkets: any[];
        odds: any[];
        hasAnyDrawMarket: any;
        messages: any[];

        startDemoLogin: any;
    }

    export class LoginCtrl extends intranet.common.ControllerBase<ILoginScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILoginScope,
            private baseAuthenticationService: common.services.BaseAuthenticationService,
            private userService: services.UserService,
            private authorizationService: intranet.common.services.AuthorizationService,
            public $timeout: ng.ITimeoutService,
            public toasterService: common.services.ToasterService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private $translate: any,
            private $filter: any,
            private $sce: any,
            private $window: any,
            private $interval: ng.IIntervalService,
            public $rootScope: any,
            private vcRecaptchaService: any,
            public WSSocketService: any,
            private isMobile: any,
            private $q: ng.IQService,
            private $stateParams: any,
            public settings: common.IBaseSettings,
            private websiteService: services.WebsiteService,
            private $state: ng.ui.IStateService) {
            super($scope);



            this.commonDataService.setBackground();

            this.$scope.gCaptchaPromise = this.$q.defer();

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.refreshCaptcha);
                if (this.$scope.cloudInterval) { this.$interval.cancel(this.$scope.cloudInterval); }
            });
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.messages = [];
            this.$scope.cp_messages = [];
            this.$scope.formMode = 1;
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.captchaMode = 0;
            this.$scope.loginMode = 0;


            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.hasAPK = this.settings.HasAPK;
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.showLoading = false;
            this.$scope.isBFLabel = this.settings.IsBetfairLabel;

            this.$scope.supportDetail = {};
            this.$scope.currentWebTitle = this.settings.Title;

            this.$scope.odds = [];
            this.$scope.popularMarkets = [];

            if (this.settings.WebApp == 'fourexch') { this.$scope.loginMode = 4; }
            if (this.settings.WebApp == 'exch444') { this.$scope.loginMode = 7; }
            if (this.settings.WebApp == 'lucky7' || this.settings.WebApp == 'rock7') { this.$scope.loginMode = 1; }
            if (this.settings.WebApp == 'exch333' || this.settings.WebApp == 'sarkarex' || this.settings.WebApp == 'bazigar' || this.settings.WebApp == 'election' || this.settings.WebApp == 'abexch9' || this.settings.WebApp == 'jetid333') { this.$scope.loginMode = 6; }

        }

        public loadInitialData() {

            if (this.$scope.model) { this.$scope.model.username = ''; this.$scope.model.password = ''; this.$scope.model.captcha = ''; }
            if (this.$scope.cp_model) { this.$scope.cp_model.oldpassword = ''; this.$scope.cp_model.newpassword = ''; this.$scope.cp_model.confirmpassword = ''; }
            if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                this.$state.go(this.$state.current.name, { msg: '' });
            }
            else {
                this.$rootScope.$emit('run-after-login-splash');
                this.commonDataService.clearStorage();
                this.loadWebsiteDetail();
            }
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((response: any) => {
                    if (response) {
                        this.$scope.captchaMode = response.captchaMode;
                        this.$scope.isRegisterEnabled = response.isRegisterEnabled;

                        if (response.supportDetails && response.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(response.supportDetails);
                            this.$scope.gCaptchKey = this.$scope.supportDetail.recaptchaSiteKey;
                        }
                    }
                }).finally(() => {
                    if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                        this.getCaptcha();
                    } else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                        this.addGoogleCaptcha();
                    }
                });
        }

        public getCaptcha(refresh: boolean = true) {
            if (this.$scope.loginMode == 5) {
                this.$scope.captchBG = "c" + common.helpers.CommonHelper.randomGenerator(1, 7);
            }

            if (this.$scope.refreshCaptcha) { this.$timeout.cancel(this.$scope.refreshCaptcha); }
            this.userService.getCaptcha()
                .success((response: intranet.common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        this.$scope.captcha = response.data;
                    }
                }).finally(() => {
                    if (refresh) {
                        this.$scope.refreshCaptcha = this.$timeout(() => {
                            this.getCaptcha();
                        }, 120000);
                    }
                });
        }


        private addGoogleCaptcha(): void {
            this.vcRecaptchaService.create('captchaholder', {
                key: this.$scope.gCaptchKey,
                size: 'invisible'
            }).then((id: any) => { this.$scope.gWidgetId = id; });
        }

        private executeGcaptcha(id: any, recursive: boolean = false): void {
            if (!recursive) this.vcRecaptchaService.execute(id);

            var response = this.vcRecaptchaService.getResponse();
            if (!response) { this.$timeout(() => { this.executeGcaptcha(id, true); }, 1000); }
            else {
                this.$scope.gCaptchaPromise.resolve(response);
            }
        }

        private getCaptchaResponse(): ng.IHttpPromise<any> {
            if (this.$scope.gCaptchaPromise.promise.$$state.status != 0) { this.$scope.gCaptchaPromise = this.$q.defer(); }
            if (this.$scope.gWidgetId != undefined) {
                this.executeGcaptcha(this.$scope.gWidgetId);
            }
            else {
                this.$scope.gWidgetId = this.vcRecaptchaService.create('captchaholder', {
                    key: this.$scope.gCaptchKey,
                    size: 'invisible'
                }).then((id: any) => {
                    this.executeGcaptcha(id);
                });
            }
            return this.$q.when(this.$scope.gCaptchaPromise.promise);
        }



        public login(): void {
            this.$scope.showLoading = true;
            var userToken = this.localStorageHelper.getUserTokenFromCookie();

            var model = {
                key: '',
                captcha: this.$scope.model.captcha,
                IMEI: userToken,
                device: 'web',
                mode: 2,
                username: this.$scope.model.username,
                password: this.$scope.model.password
            };

            if (this.$scope.startDemoLogin) {
                model.username = this.$scope.supportDetail.demoUsername;
                model.password = this.$scope.supportDetail.demoPassword;
            }

            if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                model.key = this.$scope.captcha.key;
                this.executeLogin(model);
            }
            else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                this.getCaptchaResponse().then((data: any) => {
                    model.key = data;
                    this.executeLogin(model);
                });
            }
        }

        private executeLogin(model: any): void {
            var res = this.baseAuthenticationService.authenticate(model.username, model.password, model.IMEI, model);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.messages) this.$scope.messages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    if (response.data.user.isMobileConfirm == false) {
                        this.verifyMobile(response.data);
                    }
                    else {
                        this.afterLogin(response.data);
                    }
                }
                else if (status == 401 || status == 403 || status == -1) {
                    this.$scope.messages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Error, "Username or Password is wrong.", ''));
                    this.$scope.showLoading = false;
                } else {
                    this.$scope.messages = response.messages;
                    this.$scope.showLoading = false;
                }
            }).error(() => { this.$scope.showLoading = false; });
        }

        private afterLogin(data: any): void {
            if (data) {
                // translate content by user's language
                var id = data.user.languageId.toString();
                this.$translate.use(id);

                if (data.user.changePasswordOnLogin == true) {
                    if ((data.user.userType == common.enums.UserType.Admin ||
                        data.user.userType == common.enums.UserType.Master ||
                        data.user.userType == common.enums.UserType.SuperMaster ||
                        data.user.userType == common.enums.UserType.Agent ||
                        data.user.userType == common.enums.UserType.CP) &&
                        this.settings.WebSiteIdealFor == 2) {
                        this.$state.go(this.$state.current.name, { msg: 'r' });

                    } else if (data.user.userType == common.enums.UserType.Player && this.settings.WebSiteIdealFor == 3) {
                        this.$state.go(this.$state.current.name, { msg: 'r' });
                    }
                    else {
                        this.$scope.formMode = 2;
                        this.$scope.userId = data.user.id;
                        this.$scope.showLoading = false;
                    }
                }
                else {

                    if (data.claims) {
                        this.authorizationService.loadClaims(data.claims, data.user.userType, data.parent ? data.parent.isOBD : false).then(() => {
                            this.settings.IsFirstLogin = data.user.isFirstLogin;
                            // set currency
                            if (data.currency) {
                                this.settings.CurrencyRate = data.currency.rate;
                                this.settings.CurrencyCode = data.currency.code;
                                this.settings.CurrencyFraction = data.currency.fractional;
                            }

                            //store user detail
                            this.localStorageHelper.set(this.settings.UserData, data);
                            if (data.user && data.user.betConfigs) {
                                this.commonDataService.setUserBetConfig(data.user.betConfigs);
                            }

                            // start web socket
                            this.WSSocketService.connetWs();

                            if (data.user.userType == common.enums.UserType.SuperAdmin ||
                                data.user.userType == common.enums.UserType.Manager) {
                                this.$state.go('admin');
                            }
                            else if ((data.user.userType == common.enums.UserType.Admin ||
                                data.user.userType == common.enums.UserType.Master ||
                                data.user.userType == common.enums.UserType.SuperMaster ||
                                data.user.userType == common.enums.UserType.Agent ||
                                data.user.userType == common.enums.UserType.CP) &&
                                (this.settings.WebSiteIdealFor == 1 || this.settings.WebSiteIdealFor == 3)) {

                                // set parentid in self id while usertype CP
                                if (data.user.userType == common.enums.UserType.CP) {
                                    data.user.cpId = data.user.id;
                                    data.user.cpUserType = data.user.userType;
                                    data.user.id = data.parent.id;
                                    data.user.userType = data.parent.userType;
                                    this.localStorageHelper.set(this.settings.UserData, data);
                                }

                                this.$state.go('master.dashboard');
                                this.openPromotion();
                            }
                            else if (data.user.userType == common.enums.UserType.Operator) {
                                this.$state.go('operator.dashboard');
                            }
                            else if (data.user.userType == common.enums.UserType.BM || data.user.userType == common.enums.UserType.SBM) {
                                this.$state.go('book.base.feed');
                            }
                            else if (this.settings.WebSiteIdealFor <= 2
                                && (data.user.userType == common.enums.UserType.Player || data.user.userType == common.enums.UserType.Radar)) {

                                this.checkAgentBanners();

                                if (this.isMobile.any) {
                                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                        this.$state.go('mobile.seven.base.home');
                                        // this.openPromotion();
                                    }
                                    else {
                                        this.$state.go('mobile.base.home');
                                        //this.openPromotion();
                                    }
                                } else {
                                    this.$state.go('base.home');
                                    //this.openPromotion();
                                }
                            } else {
                                this.commonDataService.logout(0, false);
                                this.$scope.messages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Error, "Username/Password is wrong.", ''));
                            }
                            this.$scope.showLoading = false;
                        });
                    }
                }
            }
        }


        private verifyMobile(data: any): void {
            if (data) {
                // translate content by user's language
                var id = data.user.languageId.toString();
                this.$translate.use(id);

                this.authorizationService.loadClaims(data.claims, data.user.userType, data.parent ? data.parent.isOBD : false).then(() => {
                    // set currency
                    if (data.currency) {
                        this.settings.CurrencyRate = data.currency.rate;
                        this.settings.CurrencyCode = data.currency.code;
                        this.settings.CurrencyFraction = data.currency.fractional;
                    }

                    //store user detail
                    this.localStorageHelper.set(this.settings.UserData, data);

                    if (this.isMobile.any) {
                        this.$state.go('mobile.verify');
                    } else {
                        this.$state.go('verify');
                    }
                });
            }
        }

        public changePassword(): void {
            if (this.validatePassword()) {
                var model = {
                    currentPassword: this.$scope.cp_model.oldpassword,
                    newPassword: this.$scope.cp_model.newpassword,
                    userId: this.$scope.userId
                };
                this.$scope.showLoading = true;
                this.userService.changePassword(model)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.model.password = '';
                            this.$scope.formMode = 1;
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$state.reload();

                            //if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                            //    this.$scope.model.captcha = '';
                            //    this.getCaptcha();
                            //} else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                            //    this.addGoogleCaptcha();
                            //}

                        } else {
                            this.$scope.cp_messages.splice(0);
                            this.$scope.cp_messages = response.messages;
                        }
                    }).finally(() => { this.$scope.showLoading = false; });;
            }
        }

        private validatePassword(): boolean {
            this.$scope.cp_messages.splice(0);
            if (!this.commonDataService.validatePassword(this.$scope.cp_model.newpassword)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.cp_messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.cp_model.newpassword !== this.$scope.cp_model.confirmpassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.$scope.cp_messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }


        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        private register(): void {
            this.$state.go('signup');
        }

        private registerMobile(): void {
            this.$state.go('mobile.signup');
        }


        private openPromotion(): void {
            this.commonDataService.ShowPromoBanners();
        }

        private checkAgentBanners() {
            this.websiteService.getBannerCount(this.isMobile.any)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var count = response.data;
                        var today = moment();
                        var promo = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
                        var diff = promo && promo.date ? today.diff(promo.date, 'h') : 4;
                        if (diff >= 4 || !promo || promo.count != count) {
                            this.websiteService.getBanners(this.isMobile.any)
                                .success((res: common.messaging.IResponse<any>) => {
                                    if (res.success && res.data) {
                                        this.commonDataService.ShowAgentBanners(res.data, count);
                                    }
                                });
                        }
                    }
                });
        }



        private openPrivacyPolicy(): void {
            var url = this.$state.href('privacypolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openCookiePolicy(): void {
            var url = this.$state.href('cookiepolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openTermsConditions(): void {
            var url = this.$state.href('termsconditions');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openResponsibleGambling(): void {
            var url = this.$state.href('responsiblegambling');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }


    }
    angular.module('intranet.home').controller('loginCtrl', LoginCtrl);
}