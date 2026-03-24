var intranet;
(function (intranet) {
    var livegamedemo;
    (function (livegamedemo) {
        class LiveGameDemoCtrl extends intranet.common.ControllerBase {
            constructor($scope, $sce, $state, commonDataService, localStorageHelper, isMobile, toasterService, $rootScope, $timeout, $window, $location, fdService, settings) {
                super($scope);
                this.$sce = $sce;
                this.$state = $state;
                this.commonDataService = commonDataService;
                this.localStorageHelper = localStorageHelper;
                this.isMobile = isMobile;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$timeout = $timeout;
                this.$window = $window;
                this.$location = $location;
                this.fdService = fdService;
                this.settings = settings;
                this.$scope.$on('$destroy', () => {
                    this.close();
                });
                super.init(this);
            }
            loadInitialData() {
                this.getStakeRange();
                this.commonDataService.getSupportDetails().then((data) => {
                    this.$scope.domain = data.url;
                    this.launchLiveGame();
                });
            }
            getStakeRange() {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) {
                    this.$scope.stakes = result.stake.filter((a) => { return a.isActive; }).map((a) => { return a.stake; }).join(',');
                    this.$scope.oneClick = result.oneClickStake.map((a) => { return a.stake; }).join(',');
                }
            }
            launchLiveGame() {
                this.fdService.launchFairDeal()
                    .success((response) => {
                    if (response.success) {
                        var tableId = this.commonDataService.getGameId();
                        var homeUrl = this.$location.$$absUrl.split('#')[0];
                        if (this.isMobile.any) {
                            if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                homeUrl = homeUrl + this.$state.href('mobile.seven.base.home');
                            }
                            else {
                                homeUrl = homeUrl + this.$state.href('mobile.base.home');
                            }
                        }
                        else {
                            homeUrl = homeUrl + this.$state.href('base.home');
                        }
                        var logo = this.$scope.domain + 'images/' + this.settings.WebApp + '/casino-logo.png';
                        if (tableId) {
                            var path = this.isMobile.any ? 'eg/2/list/-1' : 'list/-1';
                            if (this.isMobile.any) {
                                var url = this.settings.FairXIFrameUrl + 'fs/mhome/' + path + '?token='
                                    + response.data.token
                                    + '&tableId=' + tableId
                                    + '&operatorId=' + response.data.operatorId
                                    + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                                this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                            }
                            else {
                                var url = this.settings.FairXIFrameUrl + 'fs/hm/2/' + path + '?token='
                                    + response.data.token
                                    + '&tableId=' + tableId
                                    + '&operatorId=' + response.data.operatorId
                                    + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                                this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                            }
                        }
                        else {
                            var url = this.settings.FairXIFrameUrl + 'fs?token='
                                + response.data.token
                                + '&operatorId=' + response.data.operatorId
                                + '&language=en&stakes=' + this.$scope.stakes + '&oneclickstakes=' + this.$scope.oneClick + '&homeurl=' + encodeURIComponent(homeUrl) + '&logo=' + encodeURIComponent(logo);
                            this.$scope.gameUrl = this.$sce.trustAsResourceUrl(url);
                        }
                    }
                    else {
                        this.toasterService.showMessages(response.messages);
                        this.$timeout(() => { this.close(); }, 5000);
                    }
                }).finally(() => {
                    this.commonDataService.setGameId('');
                    this.$window.scrollTop = document.body.scrollHeight;
                    document.body.scrollTop = document.body.scrollHeight;
                });
            }
            close() {
                this.$rootScope.$emit("balance-changed");
            }
            home() {
                var wn = document.getElementById('fairxcasino');
                wn.contentWindow.postMessage('TakeMeHomePleasE', this.settings.FairXIFrameUrl);
            }
        }
        livegamedemo.LiveGameDemoCtrl = LiveGameDemoCtrl;
        angular.module('intranet.livegamedemo').controller('liveGameDemoCtrl', LiveGameDemoCtrl);
    })(livegamedemo = intranet.livegamedemo || (intranet.livegamedemo = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=liveGameDemoCtrl.js.map