var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class LiveBetByMarketCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $timeout, commonDataService, betService, $rootScope) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$timeout = $timeout;
                this.commonDataService = commonDataService;
                this.betService = betService;
                this.$rootScope = $rootScope;
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (data.MarketId == this.$stateParams.marketId) {
                            this.fetchLiveBetsData();
                            this.playAudio();
                            this.$rootScope.$emit('master-balance-changed');
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_livebet);
                    wsListner();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.betSides = [];
                this.$scope.userPTtree = [];
            }
            loadInitialData() {
                this.fillBetSide();
                this.buildUserTreeForPT();
            }
            fillBetSide() {
                this.$scope.betSides.push({ id: -1, name: 'All' });
                this.$scope.betSides.push({ id: 1, name: 'Back' });
                this.$scope.betSides.push({ id: 2, name: 'Lay' });
            }
            buildUserTreeForPT() {
                if (this.$stateParams.usertype) {
                    this.$scope.userPTtree = super.getUserTypeForPT(math.add(this.$stateParams.usertype, 1));
                    this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                }
                else {
                    var loggeduser = this.commonDataService.getLoggedInUserData();
                    if (loggeduser) {
                        this.$scope.userPTtree = super.getUserTypeForPT(loggeduser.userType + 1);
                        this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                    }
                }
            }
            getMatchedBets(params) {
                var searchQuery = { marketId: this.$stateParams.marketId };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                if (this.$stateParams.memberid) {
                    return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params });
                }
            }
            playAudio() {
                var audio = new Audio('audio/short_1.mp3');
                audio.play();
            }
            fetchLiveBetsData() {
                var refreshCMD = "refreshGrid";
                refreshCMD = refreshCMD + "_kt-matchedlivebets-grid";
                this.$scope.$broadcast(refreshCMD);
            }
            loadLiveBetSize() {
                this.$timeout.cancel(this.$scope.timer_livebet);
                this.betService.getLiveBetSizeByMarketId(this.$stateParams.marketId)
                    .success((response) => {
                    if (response.success && response.data) {
                        if (this.$scope.compareBetSize) {
                            if (this.$scope.compareBetSize.sizeMatched != response.data.sizeMatched ||
                                this.$scope.compareBetSize.sizeRemaining != response.data.sizeRemaining ||
                                this.$scope.compareBetSize.sizeCancelled != response.data.sizeCancelled) {
                                this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                                this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                                this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                                this.fetchLiveBetsData();
                                this.playAudio();
                                this.$rootScope.$emit('master-balance-changed');
                            }
                        }
                        else {
                            this.$scope.compareBetSize = {};
                            this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                            this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                            this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                        }
                    }
                    else if (this.$scope.compareBetSize) {
                        this.$scope.compareBetSize = {};
                        this.fetchLiveBetsData();
                        this.playAudio();
                        this.$rootScope.$emit('master-balance-changed');
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_livebet = this.$timeout(() => {
                        }, 5000);
                    }
                });
            }
        }
        master.LiveBetByMarketCtrl = LiveBetByMarketCtrl;
        angular.module('intranet.master').controller('liveBetByMarketCtrl', LiveBetByMarketCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveBetByMarketCtrl.js.map