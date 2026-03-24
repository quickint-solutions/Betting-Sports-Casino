module intranet.livegamedemo {
    export interface ILiveGameDemoScope extends intranet.common.IScopeBase {
        gameUrl: string;
        stakeConfig: any;

        stakes: any;
        oneClick: any;
        domain: any;

        iframeHeight: any;
    }

    export class LiveGameDemoCtrl extends intranet.common.ControllerBase<ILiveGameDemoScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: ILiveGameDemoScope,
            private $sce: any,
            private $state: ng.ui.IStateService,
            private commonDataService: common.services.CommonDataService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private isMobile: any,
            private toasterService: common.services.ToasterService,
            protected $rootScope: any,
            private $timeout: any,
            private $window: any,
            private $location: any,
            private fdService: services.FDService,
            private settings: intranet.common.IBaseSettings) {
            super($scope);

            //var pathArray = this.settings.FairXIFrameUrl.split('/');
            //var protocol = pathArray[0];
            //var host = pathArray[2];
            //var origin = protocol + '//' + host;

            //this.$scope.iframeHeight = '800px';
            //var iframeDoc = document.getElementById('fairxcasino');
            //iframeDoc.style.height = '800px';

            //function receiveMessage(evt) {
            //    if (evt.data.type === 'fairxCasinoHeightChanged') {
            //        console.log(evt.data);
            //        if (evt.origin === origin) {
            //            iframeDoc.style.height = evt.data.height + 'px';
            //        }
            //    }
            //}
            //var msgListner = window.addEventListener('message', receiveMessage, false);

            this.$scope.$on('$destroy', () => {

                this.close();
            });

            super.init(this);
        }

        public loadInitialData(): void {
            this.getStakeRange();
            this.commonDataService.getSupportDetails().then((data: any) => {
                this.$scope.domain = data.url;
                this.launchLiveGame();
            });
        }

        private getStakeRange() {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) {
                this.$scope.stakes = result.stake.filter((a: any) => { return a.isActive }).map((a: any) => { return a.stake }).join(',');
                this.$scope.oneClick = result.oneClickStake.map((a: any) => { return a.stake }).join(',');
            }
        }

        private launchLiveGame(): void {
            this.fdService.launchFairDeal()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var tableId = this.commonDataService.getGameId();

                        var homeUrl = this.$location.$$absUrl.split('#')[0];
                        if (this.isMobile.any) {
                            if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                homeUrl = homeUrl + this.$state.href('mobile.seven.base.home');
                            } else {
                                homeUrl = homeUrl + this.$state.href('mobile.base.home');
                            }
                        } else {
                            homeUrl = homeUrl + this.$state.href('base.home');
                        }


                        var logo = this.$scope.domain + 'images/' + this.settings.WebApp + '/casino-logo.png';

                        //  this.settings.FairXIFrameUrl = 'http://localhost:9009/public/#/';

                        if (tableId) {
                            var path = this.isMobile.any ? 'eg/2/list/-1' : 'list/-1';
                            if (this.isMobile.any) {
                                var url = this.settings.FairXIFrameUrl + 'fs/mhome/' + path + '?token='
                                    + response.data.token
                                    + '&tableId=' + tableId
                                    + '&operatorId=' + response.data.operatorId
                                    + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                                this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                            } else {
                                var url = this.settings.FairXIFrameUrl + 'fs/hm/2/' + path + '?token='
                                    + response.data.token
                                    + '&tableId=' + tableId
                                    + '&operatorId=' + response.data.operatorId
                                    + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                                this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                            }
                        } else {
                            var url = this.settings.FairXIFrameUrl + 'fs?token='
                                + response.data.token
                                + '&operatorId=' + response.data.operatorId
                                + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                            this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                        }
                    } else {
                        this.toasterService.showMessages(response.messages);
                        this.$timeout(() => { this.close(); }, 5000);
                    }
                }).finally(() => {
                    this.commonDataService.setGameId('');
                    this.$window.scrollTop = document.body.scrollHeight;
                    document.body.scrollTop = document.body.scrollHeight;
                });
        }

        private close() {
            this.$rootScope.$emit("balance-changed");
            //if (this.isMobile.any) {
            //    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
            //        this.$state.go('mobile.seven.base.home');
            //    }
            //    else {
            //        this.$state.go('mobile.base.home');
            //    }
            //} else {
            //    this.$state.go('base.home');
            //}
        }

        private home() {
            var wn: any = document.getElementById('fairxcasino');
            wn.contentWindow.postMessage('TakeMeHomePleasE', this.settings.FairXIFrameUrl);
        }
    }
    angular.module('intranet.livegamedemo').controller('liveGameDemoCtrl', LiveGameDemoCtrl);
}