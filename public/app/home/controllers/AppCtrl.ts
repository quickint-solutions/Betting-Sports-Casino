module intranet.home {
    export interface IAppScope extends intranet.common.IScopeBase {
        title: string;
        fav_icon: string;

        theme_color: string;
        toastConfig: any;
        viewPort: string;


        timer_visible: any;
        blurStarted: any;

        isLoading: any;
        loadderTemplate: any;
        logoPath: string;

        afterLoginSplashLoading: boolean;
        afterLoginSplashGif: any;
    }

    export class AppCtrl extends intranet.common.ControllerBase<IAppScope>
        implements intranet.common.init.IInit {
        constructor($scope: IAppScope,
            private settings: intranet.common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private websiteService: services.WebsiteService,
            private $timeout: ng.ITimeoutService,
            private userService: services.UserService,
            public WSSocketService: any,
            public WSFairTradeSocketService: any,
            private isMobile: any,
            public $rootScope: any) {
            super($scope);

            if (this.settings.WebApp == 'gameok' || this.settings.WebApp == 'gameokin'
                || this.settings.WebApp == 'gameokinb2b') { jQuery('body').addClass('dark-mode'); }

            this.$rootScope.showTemplate = ((index: any) => {
                if (this.settings.ThemeName != 'dimd') {
                    this.commonDataService.showLotusFooterMsg(this.$scope, index);
                }
            });

            this.$rootScope.$on("fc-chat-restoreid-store", (event, response) => {
                this.storeChatRestoreId(response.data);
            });

            this.$rootScope.$on('run-after-login-splash', () => {
                this.playAfterLoginSplash();
            });

            var wsListnerMarketCount = this.$rootScope.$on("ws-other-login-found", (event, response) => {
                this.commonDataService.otherLoginMessage(response.data);
            });
            //this.commonDataService.otherLoginMessage('user.login.other');


            var self = this;
            ifvisible.on("idle", function () {
                var idleInfo = ifvisible.getIdleInfo();
                if (idleInfo.isIdle) {
                    // Stop auto updating the live data
                    //console.log(self.settings.IdleTime + ' user idle ' + new Date());
                    self.commonDataService.checkIdle().then(() => {
                        self.$rootScope.$emit("balance-changed");
                        ifvisible.setIdleDuration(self.settings.IdleTime);
                    });
                }

            });

            ifvisible.on("blur", function () {
                self.$scope.blurStarted = (new Date());
                ifvisible.setIdleDuration(self.settings.IdleTime);
                //console.log('blur...' + self.$scope.blurStarted);
                self.startVisibleCheker();
            });
            ifvisible.on("focus", function () { });

            window.addEventListener('online', (e) => {
                //console.log('online ' + moment().format("HH:mm:ss SSS"));
                self.WSSocketService.connetWs();
                //self.WSFairTradeSocketService.connetWs();
            });
            window.addEventListener('offline', (e) => { self.$rootScope.socketConnected = false; });


            super.init(this);
        }

        private startVisibleCheker(): void {
            //console.log('visible check');
            if (ifvisible.now()) {
                var now: any = (new Date());
                var diff = (now - this.$scope.blurStarted) / 1000;
                //console.log('visible...' + diff);

                if (diff >= 120) {
                    this.commonDataService.userWakeup();
                }
                this.$timeout.cancel(this.$scope.timer_visible);
            }
            else {
                this.$scope.timer_visible = this.$timeout(() => {
                    this.startVisibleCheker();
                }, 1000);
            }
        }

        public initScopeValues(): void {
            if (this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') {
                this.$scope.isLoading = true;

                this.$scope.logoPath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png';

                this.$scope.loadderTemplate = this.settings.ThemeName + '/template/splash-loader.html';
                this.$timeout(() => { this.$scope.isLoading = false; }, 700);
            }

            this.$scope.title = this.settings.Title;
            this.$scope.theme_color = this.settings.ThemeColor;
            this.$rootScope.highlightOnOddsChange = true;
            this.$scope.fav_icon = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/fav.png';
            this.$rootScope.betQueue = [];

            if (this.isMobile.any) {
                this.$scope.toastConfig = { 'close-button': true, 'position-class': 'mobile toast-top-full-width' }
            } else {
                this.$scope.toastConfig = { 'close-button': true, 'position-class': 'toast-top-center' }
            }

            this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";

        }

        public loadInitialData() {
            this.addDimd2Css();
            this.decideFont();
            this.addDimdAssets();
            this.addSportsAssets();
            this.loadWebsiteDetail();
            this.addGTag();
            this.addMetaTag();
            this.add3rdPartyFilesPublic();
            this.addCricfeed();
        }

        private addCricfeed() {
            var newScript = document.createElement("script");
            newScript.src = "https://feed.cricfeed.com/embed.js?divId=cricfeed-scorecard&token=19520ded4ed5fa958171315376a70465f28130b3220409a8";
            document.head.appendChild(newScript);
        }


        private loadWebsiteDetail(): void {
            this.websiteService.getSupportDetail()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        if (this.settings.WebSiteIdealFor == 3) {
                            this.settings.StorageMode = response.data.storageMode;
                        }
                        else {
                            this.settings.StorageMode = common.enums.StorageMode.LocalStorage;
                        }
                        this.settings.IsBetfairLabel = response.data.isBetfair;
                        this.commonDataService.setSupportDetails(response.data);
                        if (response.data.isWalletSignInEnabled) { this.addWeb3(); }
                    }
                });
        }

        private playAfterLoginSplash() {
            if (this.settings.WebApp == 'lionkingexch') {
                this.$scope.isLoading = false;
                this.$scope.afterLoginSplashGif = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/lionking-splash.gif';
                this.$scope.afterLoginSplashLoading = true;
                this.$timeout(() => {
                    this.$scope.afterLoginSplashLoading = false;
                }, 5000);
            }
        }

        private addGTag(): void {
            if (this.settings.WebApp == 'baazibook') {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-5D8XBL6B";
                document.getElementById('noscript1').appendChild(iframe);

                var inlineScript = document.createTextNode("(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(), event: 'gtm.js'}); var f = d.getElementsByTagName(s)[0],j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src ='https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);})(window, document, 'script', 'dataLayer', 'GTM-5D8XBL6B');");
                document.getElementById('external_script').appendChild(inlineScript);
            }
            if (this.settings.WebApp == 'fairbook') {
                const script = document.createElement("script");
                script.async = true;
                script.src = "https://www.googletagmanager.com/gtag/js?id=G-ZT8HP2FF6R";
                document.head.appendChild(script);

                var inlineScript = document.createTextNode("window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-ZT8HP2FF6R');");
                document.getElementById('external_script').appendChild(inlineScript);
            }
        }

        private addMetaTag() {
            if (this.settings.WebApp == 'fairbook') {
                var inlineScript = document.createTextNode("!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '867129218750967');fbq('track', 'PageView');");
                document.getElementById('meta_script').appendChild(inlineScript);

                var newScript = document.createElement("img");
                newScript.src = "https://www.facebook.com/tr?id=867129218750967&ev=PageView&noscript=1";
                newScript.style.display = 'none';
                newScript.height = 1;
                newScript.width = 1;
                document.getElementById('meta_noscript').appendChild(newScript);
            }
        }

        private addDimdAssets(): void {
            if (this.settings.ThemeName == "dimd") {
                var stylelink = document.createElement("link");
                stylelink.rel = 'stylesheet';
                stylelink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap';
                document.head.appendChild(stylelink);

                var fnaws: any = document.createElement("link");
                fnaws.rel = 'stylesheet';
                //fnaws.integrity = 'sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg';
                //fnaws.crossOrigin = 'anonymous';
                //  fnaws.href = 'https://use.fontawesome.com/releases/v5.0.10/css/all.css';
                fnaws.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css';
                document.head.appendChild(fnaws);

                var btStrap: any = document.createElement("link");
                btStrap.rel = 'stylesheet';
                btStrap.integrity = 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm';
                btStrap.crossOrigin = 'anonymous';
                btStrap.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
                document.head.appendChild(btStrap);

            }
        }

        private addDimd2Css() {
            if (this.settings.ThemeName == "dimd2") {
                var newScript2 = document.createElement("script");
                newScript2.src = "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.5.3/lottie_svg.min.js";
                newScript2.onload = function () {
                    var animation = bodymovin.loadAnimation({
                        animationData: common.helpers.CommonHelper.getDimd2Loading(),
                        container: document.getElementById('bodymovinanim'), // required
                        // path: 'data.json', // required
                        renderer: 'svg', // required
                        loop: true, // optional
                        autoplay: true, // optional
                        name: "Demo Animation", // optional
                    });
                };
                document.head.appendChild(newScript2);

                var fawes: any = document.createElement("link");
                fawes.rel = 'stylesheet';
                fawes.crossOrigin = 'anonymous';
                fawes.href = 'https://use.fontawesome.com/releases/v5.7.0/css/all.css';
                document.head.appendChild(fawes);

                var btStrap: any = document.createElement("link");
                btStrap.rel = 'stylesheet';
                btStrap.crossOrigin = 'anonymous';
                btStrap.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
                document.head.appendChild(btStrap);

                var newScript = document.createElement("script");
                newScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.bundle.min.js";
                document.body.appendChild(newScript);

                var animatecss: any = document.createElement("link");
                animatecss.rel = 'stylesheet';
                animatecss.crossOrigin = 'anonymous';
                animatecss.href = 'https://cdn.jsdelivr.net/npm/animate.css@3.5.1';
                document.head.appendChild(animatecss);


                jQuery(window).scroll(function () {
                    if (jQuery(this).scrollTop() > 6) {
                        jQuery(".right-sidebar").addClass("sticky");
                    }
                    if (jQuery(this).scrollTop() < 6) {
                        jQuery(".right-sidebar").removeClass("sticky");
                    }
                });

                jQuery(document).on("click", ".nav-tabs .nav-item", function () {
                    centerItFixedWidth(jQuery(this), jQuery(this).parent());
                });

                jQuery(document).on("click", ".nav-pills .nav-item", function () {
                    centerItFixedWidth(jQuery(this), jQuery(this).parent());
                });

                jQuery(window).scroll(function () {
                    var winScrollTop = jQuery(window).scrollTop();
                    var winHeight = jQuery(window).height();
                    var fromBottom = (winHeight * 50) / 100;
                    var top = winScrollTop + fromBottom;
                    jQuery("#floater").css({
                        top: top + "px",
                    });
                });

                function centerItFixedWidth(target, outer) {
                    var out = jQuery(outer);
                    var tar = jQuery(target);
                    var x = out.width();
                    var y = tar.outerWidth(true);
                    var z = tar.index();
                    var q = 0;
                    var m = out.find("li");
                    //Just need to add up the width of all the elements before our target.
                    for (var i = 0; i < z; i++) {
                        q += jQuery(m[i]).outerWidth(true);
                    }
                    out.animate(
                        {
                            scrollLeft: Math.max(0, q - (x - y) / 2),
                        },
                        300
                    );
                }
            }
        }

        private addSportsAssets() {
            if (this.settings.ThemeName == "sports") {
                var stylelink = document.createElement("link");
                stylelink.rel = 'stylesheet';
                stylelink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
                document.head.appendChild(stylelink);

                var btStrap: any = document.createElement("link");
                btStrap.rel = 'stylesheet';
                btStrap.crossOrigin = 'anonymous';
                btStrap.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
                document.head.appendChild(btStrap);

                var newScript = document.createElement("script");
                newScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.bundle.min.js";
                newScript.async = true;
                document.body.appendChild(newScript);

                var swiper: any = document.createElement("link");
                swiper.rel = 'stylesheet';
                swiper.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
                document.head.appendChild(swiper);

                var newScript2 = document.createElement("script");
                newScript2.async = true;
                newScript2.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js';
                document.head.appendChild(newScript2);
            }
        }

        private storeChatRestoreId(data) {
            this.userService.setChatRestoreId(data.restoreId);
        }

        private addWeb3() {
            var newScript = document.createElement("script");
            newScript.src = "https://unpkg.com/web3modal";
            newScript.async = true;
            document.head.appendChild(newScript);

            var newScript2 = document.createElement("script");
            newScript2.src = "https://unpkg.com/@walletconnect/web3-provider";
            newScript2.async = true;
            document.head.appendChild(newScript2);
        }

        private add3rdPartyFilesPublic() {
            var videojs = document.createElement("script");
            videojs.src = "https://vjs.zencdn.net/8.3.0/video.min.js";
            videojs.async = true;
            document.body.appendChild(videojs);

            var highchart = document.createElement("script");
            highchart.src = "https://code.highcharts.com/7.0.3/highcharts.js";
            highchart.async = true;
            document.body.appendChild(highchart);

            //var mathjs = document.createElement("script");
            //mathjs.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjs/3.16.5/math.min.js";
            //mathjs.async = true;
            //document.body.appendChild(mathjs);
        }


        private decideFont() {
            switch (this.settings.WebApp) {
                case 'one247':
                case 'drpapaya_admin':
                case 'bookpro':
                case 'lotusbook':
                case 'exch444':
                case 'gameok':
                case 'gameokin':
                case 'gameokpk':
                case 'lotusplay365':
                case 'lionkingexch':
                case 'kheloindia247':
                case 'kantara247':
                case 'wicket777_admin':
                case 'inrbook':
                case 'bookiebash':
                case 'jack247':
                case 'betinexchange99':
                case 'king247':
                    this.AddMontserrat();
                    this.AddLato();
                    break;
               
                case 'southexch':
                case 'lucky7':
                case 'sportsbar11':
                case 'royalexch':
                case 'rock7':
                case 'betbai9':
                case 'jaibook':
                case 'dream11game':
                case 'jackpot247':
                case 'winjoy365':
                case 'lucky77':
                case 'kubera247':
                case 'morya365':
                case 'balajibook':
                case 'scorpionbook':
                    this.AddExo2();
                    break;
                case 'exch333':
                case 'bazigar':
                case 'abexch9':
                case 'jetid333':
                    this.AddLato();
                    break;
                case 'fourexch':
                case 'ultra365exch_admin':
                case 'publicexch_admin':
                    this.AddPoppins();
                    break;

            }
            switch (this.settings.ThemeName) {
                case 'bking': this.AddOpenSans(); this.AddMontserrat(); break;
                case 'dimd2': this.AddRoboto();
                case 'sports':
                    this.AddRoboto();
                    this.AddMaterialIcon(); break;
            }
        }

        private AddOpenSans() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700';
            document.head.appendChild(stylelink);
        }
        private AddOswald() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Oswald:300,400,500,600,700';
            document.head.appendChild(stylelink);
        }
        private AddLato() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Lato';
            document.head.appendChild(stylelink);
        }
        private AddNunito() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Nunito&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddWendy() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Wendy+One&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddRoboto() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900&subset=latin,latin-ext&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddPoppins() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css?family=Poppins:400,500&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddMontserrat() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddExo2() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600&display=swap';
            document.head.appendChild(stylelink);
        }
        private AddMaterialIcon() {
            var stylelink = document.createElement("link");
            stylelink.rel = 'stylesheet';
            stylelink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round';
            document.head.appendChild(stylelink);
        }

    }
    angular.module('intranet.home').controller('appCtrl', AppCtrl);
}