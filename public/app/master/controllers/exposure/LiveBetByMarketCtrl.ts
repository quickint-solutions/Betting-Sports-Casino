module intranet.master {

    export interface ILiveBetByMarketScope extends intranet.common.IScopeBase {
        timer_livebet: any;
        compareBetSize: any;
        betSides: any[];
        userPTtree: any[];
    }

    export class LiveBetByMarketCtrl extends intranet.common.ControllerBase<ILiveBetByMarketScope>
        implements common.init.IInit {
        constructor($scope: ILiveBetByMarketScope,
            private $stateParams: any,
            private $timeout: ng.ITimeoutService,
            private commonDataService: common.services.CommonDataService,
            private betService: services.BetService,
            protected $rootScope: any) {
            super($scope);

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

        public initScopeValues(): void {
            this.$scope.betSides = [];
            this.$scope.userPTtree = [];
        }

        public loadInitialData(): void {
            this.fillBetSide();
            this.buildUserTreeForPT();
        }

        private fillBetSide(): void {
            this.$scope.betSides.push({ id: -1, name: 'All' });
            this.$scope.betSides.push({ id: 1, name: 'Back' });
            this.$scope.betSides.push({ id: 2, name: 'Lay' });
        }

        private buildUserTreeForPT(): void {
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

        private getMatchedBets(params: any): any {
            var searchQuery: any = { marketId: this.$stateParams.marketId };
            
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

        private playAudio(): void {
            var audio = new Audio('audio/short_1.mp3');
            audio.play();
        }

        private fetchLiveBetsData(): void {
            var refreshCMD = "refreshGrid";
            refreshCMD = refreshCMD + "_kt-matchedlivebets-grid";
            this.$scope.$broadcast(refreshCMD);
        }

        private loadLiveBetSize(): void {
            this.$timeout.cancel(this.$scope.timer_livebet);
            this.betService.getLiveBetSizeByMarketId(this.$stateParams.marketId)
                .success((response: common.messaging.IResponse<any>) => {
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
                        } else {
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
                           // this.loadLiveBetSize();
                        }, 5000);
                    }
                });
        }

    }
    angular.module('intranet.master').controller('liveBetByMarketCtrl', LiveBetByMarketCtrl);
}