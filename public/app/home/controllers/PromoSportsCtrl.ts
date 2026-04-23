module intranet.home {
    export interface IPromoSportsScope extends intranet.common.IScopeBase {
        swiperReady: boolean;
        webImagePath: any;
        liveGamesMarkets: any[];
        liveGameTypes: any[];
        casinoIframeUrl: any;
        initialTabName: string;
        findSportIdByName: (sports: any[], name: string) => string;
        providerGames: services.IGame[];
        providerKey: string;
        useApiGrid: boolean;
        providerLoading: boolean;
    }

    export class PromoSportsCtrl extends intranet.common.ControllerBase<IPromoSportsScope>
        implements intranet.common.init.IInit {
        private static FAIRX_LOBBY_BASE: string = 'https://crimson-cake-a35e.cricfeed10.workers.dev/#/fs/';

        private static PROVIDER_MAP: { [key: string]: string } = {
            fairdeal: '1',
            supernowa: '2',
            ezugi: '3',
            evolution: '4',
            aura: '5',
            fawk: '5',
            qtech: '6',
            dream: '7',
            mapple: '8'
        };

        // Sidebar provider key → real API category name (as returned by the
        // FairX /gametable/getgameinfo endpoint). The API returns categories like
        // "Virtual Casino", "Ezugi", "Aura Casino", "Supernova", "Evolution",
        // "SA Gaming", "Vivo Gaming", "Skywind Live", "Betgames.TV", "BETER Live",
        // "Table Games", "Instant Win", "Scratch Games", "Lottery & Shooting",
        // "Slot", "Exchange". Each game is tagged with its source category
        // (see IGame.category in GameListService), so we filter strictly on that
        // — no synthetic data, no bucket collapse.
        private static CATEGORY_MAP: { [key: string]: string } = {
            'virtual-casino':    'Virtual Casino',
            'ezugi':             'Ezugi',
            'aura':              'Aura Casino',
            'aura-casino':       'Aura Casino',
            'supernova':         'Supernova',
            'supernowa':         'Supernova',
            'evolution':         'Evolution',
            'sa-gaming':         'SA Gaming',
            'vivo-gaming':       'Vivo Gaming',
            'skywind-live':      'Skywind Live',
            'betgames-tv':       'Betgames.TV',
            'beter-live':        'BETER Live',
            'table-games':       'Table Games',
            'instant-win':       'Instant Win',
            'scratch-games':     'Scratch Games',
            'lottery-shooting':  'Lottery & Shooting',
            'slot':              'Slot ',     // note: API returns "Slot " with trailing space
            'slots':             'Slot ',
            'exchange':          'Exchange'
        };

        private static SPORT_TAB_MAP: { [key: string]: string } = {
            cricket: 'Cricket',
            soccer: 'Football',
            football: 'Football',
            tennis: 'Tennis',
            horse: 'Horse Racing',
            greyhound: 'Greyhound Racing'
        };

        constructor($scope: IPromoSportsScope,
            private $timeout: any,
            private isMobile: any,
            private commonDataService: common.services.CommonDataService,
            private $state: any,
            private $stateParams: any,
            private $sce: ng.ISCEService,
            private fdService: services.FDService,
            private gameListService: services.GameListService,
            private settings: intranet.common.IBaseSettings) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.liveGamesMarkets = common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
            var providerKey = this.$stateParams && this.$stateParams.provider;
            this.$scope.providerKey = providerKey || null;
            this.$scope.providerGames = [];
            this.$scope.useApiGrid = false;
            this.$scope.providerLoading = false;
            this.$scope.casinoIframeUrl = this.buildCasinoIframeUrl(providerKey);
            this.$scope.initialTabName = this.resolveInitialTabName(this.$stateParams && this.$stateParams.tab);
            this.$scope.findSportIdByName = (sports: any[], name: string) => {
                if (!sports || !name) { return null; }
                for (var i = 0; i < sports.length; i++) {
                    if (sports[i] && sports[i].name === name) { return sports[i].id; }
                }
                return null;
            };

            this.maybeLoadProviderGames(providerKey);
        }

        // For any logged-in visit to the casino/slot page — with or without a provider
        // query param — load the game catalog and show a grid. Without a provider, we
        // show the full catalog; with one, we filter by providerId / bucket.
        //
        // Why we skip fdService.launchFairDeal() here: the global $http responseError
        // interceptor in appConfig.ts hard-redirects to /promo on any 401, which logs
        // the user out. On demo builds the fdstudio/launchfairdeal endpoint returns 401,
        // so calling it would bounce every logged-in user out of the page and show the
        // "Authentication Failed" message. Instead we call loadGamesWithFairDealToken
        // with empty token — GameListService short-circuits to its bundled catalog
        // (which is also what it falls back to when the real token flow errors out),
        // so users always see games regardless of backend state. Wiring the real token
        // flow back in is a one-line change once the fdstudio endpoint works on this
        // build, but it must go through a call path that doesn't trip the 401 interceptor.
        private maybeLoadProviderGames(providerKey: string): void {
            var user = this.commonDataService.getLoggedInUserData();
            if (!user) { return; }
            this.$scope.useApiGrid = true;
            this.$scope.providerLoading = true;
            this.gameListService.loadGamesWithFairDealToken('', '')
                .then((games: services.IGame[]) => this.applyProviderFilter(games || [], providerKey || ''))
                .catch(() => {
                    this.$scope.providerLoading = false;
                    this.$scope.useApiGrid = false;
                });
        }

        // Per-provider game list — strict match against the raw API category name.
        //  • No provider key → full catalog (for /casino and /slot-casino).
        //  • Known provider key → only games whose `category` field equals the
        //    real API category name (e.g. "Ezugi", "Aura Casino", "Supernova").
        //    If the API response has no games for that category, the grid renders
        //    empty — no synthesized entries, no fallback to other categories.
        private applyProviderFilter(games: services.IGame[], providerKey: string): void {
            var list = games || [];
            var key = String(providerKey || '').toLowerCase();
            if (!key) {
                this.$scope.providerGames = list;
            } else {
                var targetCategory = PromoSportsCtrl.CATEGORY_MAP[key];
                this.$scope.providerGames = targetCategory
                    ? list.filter(g => (g.category || '') === targetCategory)
                    : [];
            }
            this.$scope.providerLoading = false;
        }

        public openGame(game: services.IGame): void {
            if (!game) { return; }
            if (game.directGameUrl) {
                (window as any).open(game.directGameUrl, '_blank');
                return;
            }
            if (!game.tableId) { return; }
            this.commonDataService.setPendingGame(game);
            this.commonDataService.setGameId(game.tableId);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else if (this.settings.ThemeName == 'dimd2') {
                this.$state.go('base.home.livegames');
            } else {
                this.$state.go('base.livegames');
            }
        }

        private buildCasinoIframeUrl(providerKey: string): any {
            var segment = '-1';
            if (providerKey && PromoSportsCtrl.PROVIDER_MAP[providerKey]) {
                segment = PromoSportsCtrl.PROVIDER_MAP[providerKey];
            }
            var homeType = this.isMobile.any ? 'mhome' : 'hm';
            var url = PromoSportsCtrl.FAIRX_LOBBY_BASE + homeType + '/2/list/' + segment;
            return this.$sce.trustAsResourceUrl(url);
        }

        private resolveInitialTabName(tabParam: string): string {
            if (!tabParam) { return null; }
            var key = String(tabParam).toLowerCase();
            return PromoSportsCtrl.SPORT_TAB_MAP[key] || null;
        }

        public loadInitialData(): void {
            if (this.settings.ThemeName == 'sports') {
                this.setSwiperForSports();
            }
            else if (this.settings.ThemeName == 'dimd2') {
                this.$scope.liveGameTypes = common.helpers.CommonHelper.GetCasinoType(this.settings.ThemeName);
            }
        }

        private openFDCasino(lg) {
            this.commonDataService.setGameId(lg.tableId);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                if (this.settings.ThemeName == 'dimd2') {
                    this.$state.go('base.home.livegames');
                } else {
                    this.$state.go('base.livegames');
                }
            }
        }

        private openCasino(id) {
            this.commonDataService.setGameId(id);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                this.$state.go('base.livegames');
            }
        }

        private setSwiperForSports(): void {
            this.$timeout(() => {
                var mySwiper3 = new Swiper('#swiper8', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 4 : 8),
                    spaceBetween: 5, freeMode: true,
                });
                var mySwiper4 = new Swiper('#indian-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 3),
                    spaceBetween: 30,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var mySwiper5 = new Swiper('#live-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 3),
                    spaceBetween: 15,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var mySwiper6 = new Swiper('#slot-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 5),
                    spaceBetween: 15,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                this.$scope.swiperReady = true;
            }, 10);
        }

        private openLoginModal() {
            this.$rootScope.$emit('open-login-modal');
        }

    }
    angular.module('intranet.home').controller('promoSportsCtrl', PromoSportsCtrl);
}