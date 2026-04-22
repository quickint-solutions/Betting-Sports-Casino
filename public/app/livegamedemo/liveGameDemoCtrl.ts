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
                        var pendingGame = this.commonDataService.getPendingGame();

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

                        // Build the iframe URL.
                        //
                        // URL strategy (decided after inspecting the iframe app's routing + controllers):
                        //
                        // The iframe exposes three relevant states per table provider:
                        //   - fs.home.list          -> `fs/hm/:topid/list/:gameid`            (lobby — always has content)
                        //   - fs.home.egamesmarket  -> `fs/hm/:topid/game-market/:gametableid` (specific Fairdeal live-dealer table)
                        //   - fs.home.fawk          -> `fs/hm/:topid/fawk/:tableid`            (FAWK poker client — always has content)
                        //
                        // For Fairdeal casino tables (all current catalog entries), the game-market view only renders
                        // when there is an active live round / video stream (wcs_video is set from gameTable.streamName;
                        // the rest of the template is ng-if'd behind fullMarket populating from gameRoundService.getGameInfo).
                        // If the dealer is offline, that page is genuinely blank — this matches the iframe's own behavior
                        // when the user clicks an offline table from its own lobby.
                        //
                        // To avoid landing users on a blank page for offline tables, we open the LOBBY (list/-1) which
                        // is always populated, and include ?tableId=... as a hint (ignored by the iframe today; safe
                        // if the iframe is ever updated to read it). Users see all games and click their choice.
                        // For FAWK-type games (provider-specific routing), extend this switch when catalog gains those.

                        var commonQs = 'token=' + response.data.token
                            + '&operatorId=' + response.data.operatorId
                            + '&language=en&stakes=' + this.$scope.stakes
                            + '&oneclickstakes=' + this.$scope.oneClick
                            + '&homeurl=' + encodeURIComponent(homeUrl)
                            + '&logo=' + encodeURIComponent(logo);

                        var gameUrl = '';
                        if (pendingGame && pendingGame.providerId) {
                            // Direct provider-specific route (e.g. fs/hm/2/fawk/{uniqueKey} for FAWK,
                            // fs/hm/2/game-market/{id} for Fairdeal live tables). Skips the generic lobby.
                            var route = services.GameListService.buildIframeRoute(pendingGame, !!this.isMobile.any);
                            gameUrl = this.settings.FairXIFrameUrl + route + '?' + commonQs;
                        } else if (tableId) {
                            var tableQs = '&tableId=' + encodeURIComponent(tableId);
                            if (this.isMobile.any) {
                                gameUrl = this.settings.FairXIFrameUrl + 'fs/mhome/eg/2/list/-1?' + commonQs + tableQs;
                            } else {
                                gameUrl = this.settings.FairXIFrameUrl + 'fs/hm/2/list/-1?' + commonQs + tableQs;
                            }
                        } else {
                            gameUrl = this.settings.FairXIFrameUrl + 'fs?' + commonQs;
                        }

                        // Direct redirect to the game URL (no iframe wrapper)
                        this.commonDataService.setGameId('');
                        this.commonDataService.setPendingGame(null);
                        this.$window.location.href = gameUrl;
                    } else {
                        this.toasterService.showMessages(response.messages);
                        this.$timeout(() => { this.close(); }, 5000);
                    }
                }).finally(() => {
                    // game id cleared above on success; still clear on failure
                    this.commonDataService.setGameId('');
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