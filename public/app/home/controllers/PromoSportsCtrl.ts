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
            // The Slots pages (base.slotcasino / promo.slotcasino / base.home.slotcasino /
            // mobile.*.slotcasino) carry no provider param, so without this they fall into
            // the "no key → full catalog" branch and show every game. Default them to the
            // "slot" category so they show only Slot games (the template title is "ALL SLOT").
            if (!providerKey && this.isSlotState()) { providerKey = 'slot'; }
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

        // True when the active ui-router state is one of the Slots pages
        // (base.slotcasino, promo.slotcasino, base.home.slotcasino, mobile.*.slotcasino).
        private isSlotState(): boolean {
            var name = (this.$state && this.$state.current && this.$state.current.name) || '';
            return String(name).toLowerCase().indexOf('slotcasino') !== -1;
        }

        // For any logged-in visit to the casino/slot page — with or without a provider
        // query param — load the game catalog and show a grid. Without a provider, we
        // show the full catalog; with one, we filter by providerId / bucket.
        //
        // Auth flow (mirrors MarketHighlightCtrl.loadGameSections):
        //   1. fdService.launchFairDeal() → returns { token, operatorId } for the logged-in user
        //   2. gameListService.loadGamesWithFairDealToken(token, operatorId) → real FairX catalog
        //   3. On any failure (401, network, empty payload), GameListService internally
        //      falls through to the static JSON snapshot, then to the hardcoded catalog,
        //      so the grid always renders.
        // Note: a 401 on fdstudio/launchfairdeal will trip the global $http responseError
        // interceptor and redirect to /promo (standard logged-out behavior).
        private maybeLoadProviderGames(providerKey: string): void {
            var user = this.commonDataService.getLoggedInUserData();
            if (!user) { return; }
            this.$scope.useApiGrid = true;
            this.$scope.providerLoading = true;

            this.fdService.launchFairDeal()
                .success((response: common.messaging.IResponse<any>) => {
                    var token = response && response.success && response.data ? response.data.token : '';
                    var operatorId = response && response.success && response.data ? response.data.operatorId : '';
                    this.gameListService.loadGamesWithFairDealToken(token || '', operatorId || '')
                        .then((games: services.IGame[]) => this.applyProviderFilter(games || [], providerKey || ''))
                        .catch(() => {
                            this.$scope.providerLoading = false;
                            this.$scope.useApiGrid = false;
                        });
                })
                .error(() => {
                    // launchFairDeal failed (network or non-401 error) — still try the
                    // bundled catalog path so the grid has something to render.
                    this.gameListService.loadGamesWithFairDealToken('', '')
                        .then((games: services.IGame[]) => this.applyProviderFilter(games || [], providerKey || ''))
                        .catch(() => {
                            this.$scope.providerLoading = false;
                            this.$scope.useApiGrid = false;
                        });
                });
        }

        // Per-provider game list — fuzzy, case-insensitive match against the raw API
        // category name. Real-world API responses vary in casing, whitespace, and
        // sometimes append qualifiers (e.g. "Ezugi" vs "Ezugi Live Casino" vs "EZUGI ").
        //  • No provider key → full catalog (for /casino and /slot-casino).
        //  • Known provider key → games whose `category` field matches the configured
        //    target name (case-insensitive, trimmed, substring).
        //  • Unknown provider key → fall back to substring-matching the key itself
        //    against category names (so a sidebar item like 'foo-bar' tries to match
        //    'foo' or 'bar' in any category name even without a CATEGORY_MAP entry).
        private applyProviderFilter(games: services.IGame[], providerKey: string): void {
            var list = games || [];
            var key = String(providerKey || '').toLowerCase().trim();
            if (!key) {
                this.$scope.providerGames = list;
                this.$scope.providerLoading = false;
                return;
            }

            // Build the set of candidate target names to match. Start with the explicit
            // CATEGORY_MAP value if present, then add the full de-hyphenated key phrase
            // (e.g. 'sa-gaming' → 'sa gaming') as a fallback for unmapped keys.
            //
            // We deliberately match on WHOLE category names only — never on single tokens
            // like 'casino', 'gaming' or 'live'. Those tokens are shared across many
            // categories ("Virtual Casino"/"Aura Casino", "SA Gaming"/"Vivo Gaming",
            // "Skywind Live"/"BETER Live"), so token matching collapsed distinct providers
            // into one identical list.
            var configured = PromoSportsCtrl.CATEGORY_MAP[key];
            var candidates: string[] = [];
            if (configured) { candidates.push(String(configured).toLowerCase().trim()); }
            var phrase = key.replace(/[-_]+/g, ' ').trim();
            if (phrase && candidates.indexOf(phrase) === -1) { candidates.push(phrase); }

            this.$scope.providerGames = list.filter(g => {
                var cat = String(g.category || '').toLowerCase().trim();
                if (!cat) { return false; }
                for (var i = 0; i < candidates.length; i++) {
                    var c = candidates[i];
                    if (!c) { continue; }
                    // Exact match OR full-phrase substring (handles a configured name like
                    // "Ezugi" matching an API variant such as "Ezugi Live Casino").
                    if (cat === c || cat.indexOf(c) !== -1) { return true; }
                }
                return false;
            });

            // Diagnostic: when the grid would otherwise render empty, log the available
            // categories so we can see exactly what the upstream API returned and adjust
            // CATEGORY_MAP accordingly. Cheap to leave on — fires only when empty.
            if (!this.$scope.providerGames.length) {
                var available: { [k: string]: number } = {};
                list.forEach(g => {
                    var c = String(g.category || '').trim();
                    if (c) { available[c] = (available[c] || 0) + 1; }
                });
                console.warn('[PromoSportsCtrl] No games matched provider key "' + providerKey
                    + '". Tried candidates:', candidates,
                    'Available API categories (name → count):', available);
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

    // <game-thumb src="lg.image" name="{{lg.name}}" img-class="..."> — renders a game
    // thumbnail, falling back to a centered-logo placeholder div whenever the image is
    // missing (empty src) OR fails to load (404 / blocked). Drop-in replacement for the
    // bare <img> used in the casino grids and home carousels. Uses ng-show (not ng-if)
    // so the <img> element persists and its native error event stays observable.
    angular.module('intranet.home').directive('gameThumb', ['settings', function (settings: intranet.common.IBaseSettings) {
        var logoUrl = settings.ImagePath + 'images/' + settings.WebApp + '/logo.png';
        return {
            restrict: 'E',
            replace: true,
            scope: { src: '=', name: '@', imgClass: '@' },
            template:
                '<span class="game-thumb">' +
                    '<img class="game-thumb-img" ng-class="imgClass" ng-src="{{src}}" alt="{{name}}" loading="lazy" ng-show="src && !failed" />' +
                    '<span class="game-thumb-placeholder" ng-show="!src || failed">' +
                        '<img class="game-thumb-logo" src="' + logoUrl + '" alt="{{name}}" />' +
                    '</span>' +
                '</span>',
            link: function (scope: any, el: any) {
                scope.failed = false;
                // Reset on source change so a recycled ng-repeat node doesn't keep a
                // previous card's failure state when it's reused for a game with a good image.
                scope.$watch('src', function () { scope.failed = false; });
                var imgEl = el[0] && el[0].querySelector ? el[0].querySelector('.game-thumb-img') : null;
                if (imgEl) {
                    imgEl.addEventListener('error', function () {
                        scope.$evalAsync(function () { scope.failed = true; });
                    });
                }
            }
        };
    }]);
}