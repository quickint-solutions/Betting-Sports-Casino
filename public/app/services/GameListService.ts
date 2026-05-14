// ============================================================================
// GameListService — game catalog client backed exclusively by fairx-catalog.json.
//
// Contract the rest of the app relies on (do not change without updating callers):
//   interface Game { gameId, name, image, provider, tableId, directGameUrl }
// ============================================================================

namespace intranet.services {

    export interface IGame {
        gameId: string;
        name: string;
        image: string;
        provider: string;          // UI bucket: 'fairbet' | 'aura' | 'vimplay'
        category?: string;         // Raw API category name e.g. "Ezugi", "Aura Casino", "Supernova", "Evolution", "SA Gaming", "Vivo Gaming", "Slot", "Exchange", etc. Use this for strict per-provider filtering.
        tableId: string;           // MongoDB id used for Fairdeal routes
        directGameUrl: string;
        uniqueKey?: string;        // FAWK games route by uniqueKey, not tableId
        providerId?: number;       // numeric TableProvider enum from FairX (1=Fairdeal, 5=FAWK, 7=DreamCasino, ...)
        isVirtual?: boolean;       // determines game-market vs virtual-game-market route
        url?: string;       // determines game-market vs virtual-game-market route
    }

    // Names the app uses internally. Must stay lowercase so HTML filters are stable.
    export const PROVIDER_FAIRBET = 'fairbet';
    export const PROVIDER_AURA    = 'aura';
    export const PROVIDER_VIMPLAY = 'vimplay';

    const CACHE_TTL_MS = 5 * 60 * 1000;

    export class GameListService {
        private cache: { at: number; data: IGame[] } | null = null;
        private inflight: ng.IPromise<IGame[]> | null = null;

        /* @ngInject */
        constructor(
            private $http: ng.IHttpService,
            private $q: ng.IQService,
            private settings: common.IBaseSettings,
            private concurrencyService: common.services.ConcurrencyService
        ) { }

        public getGamesByProvider(provider: string): ng.IPromise<IGame[]> {
            const target = (provider || '').toLowerCase();
            return this.getAllGames().then((games) => {
                return games.filter((g) => (g.provider || '').toLowerCase() === target);
            });
        }

        public getRecentBigWins(limit?: number): ng.IPromise<IGame[]> {
            return this.getAllGames().then((games) => {
                return this.shuffleSlice(games, typeof limit === 'number' && limit > 0 ? limit : 24);
            });
        }

        public filterByProvider(games: IGame[], provider: string): IGame[] {
            const target = (provider || '').toLowerCase();
            return (games || []).filter((g) => (g.provider || '').toLowerCase() === target);
        }

        public shuffleSlice(games: IGame[], n: number): IGame[] {
            const shuffled = (games || []).slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
            }
            return shuffled.slice(0, n);
        }

        // Loads the FairX catalog snapshot shipped at the dist root /fairx-catalog.json.
        // Kept for API compatibility with existing callers; token / operatorId are ignored
        // because the home page now reads exclusively from the static catalog.
        public loadGamesWithFairDealToken(_token: string, _operatorId: string): ng.IPromise<IGame[]> {
            return this.getAllGames();
        }

        public invalidate(): void {
            this.cache = null;
            this.inflight = null;
        }

        // -------- internals ---------------------------------------------------

        private getAllGames(): ng.IPromise<IGame[]> {
            const now = Date.now();
            if (this.cache && now - this.cache.at < CACHE_TTL_MS) {
                return this.$q.when(this.cache.data);
            }
            if (this.inflight) { return this.inflight; }

            const url = (this.settings.ImagePath || '/') + 'fairx-catalog.json';
            this.inflight = this.$http.get<any>(url)
                .then((resp: any) => {
                    const body = resp && resp.data ? resp.data : null;
                    const payload = body && body.data ? body.data : body;
                    const games = this.flattenFairXResponse(payload);
                    const withImages = this.withResolvedImages(games);
                    this.cache = { at: Date.now(), data: withImages };
                    this.inflight = null;
                    return withImages;
                });
            return this.inflight;
        }

        // Resolves relative image filenames against the configured webImagePath so
        // cards pick up the correct per-theme/per-skin asset directory.
        // Use Object.assign so uniqueKey / providerId / isVirtual survive — buildIframeRoute
        // depends on them; dropping them sends FAWK/DreamCasino games to the generic lobby.
        private withResolvedImages(games: IGame[]): IGame[] {
            return games.map((g) => {
                if (!g.image || g.image.indexOf('/') === 0 || g.image.indexOf('http') === 0) { return g; }
                return Object.assign({}, g, { image: g.url }) as IGame;
            });
        }

        private extractList(body: any): any[] {
            if (!body) { return []; }
            if (Array.isArray(body)) { return body; }
            if (Array.isArray(body.data)) { return body.data; }
            return [];
        }

        // FairX response: direct array [{ id, name: "Aura Casino" | "Supernova" | ..., gameTables: [...] }].
        // Flatten into IGame[] and bucket by category name -> provider.
        // Numeric provider enum on each table: 1=Fairdeal, 2=Supernowa, 3=Ezugi, 4=Evolution, 5=FAWK, 6=QTech, 7=DreamCasino, 8=MappleGames.
        private flattenFairXResponse(body: any): IGame[] {
            const categories = this.extractList(body);
            const out: IGame[] = [];
            categories.forEach((cat: any) => {
                if (!cat || !Array.isArray(cat.gameTables)) { return; }
                const rawCategoryName = String(cat.name || '');
                const catNameLower = rawCategoryName.toLowerCase();
                const bucket = this.bucketForCategory(catNameLower);
                // Home-page carousel split for Aura Casino:
                //   live (isVirtual=false)  → fairbet bucket → "Fairbet Original Games" section
                //   virtual (isVirtual=true) → aura bucket    → "Aura Games" section
                const isAuraCasino = catNameLower.indexOf('aura') !== -1;
                cat.gameTables.forEach((t: any) => {
                    if (!t || !t.id || t.isActive === false) { return; }
                    const providerNum = Number(t.provider || 0);
                    let finalProvider = bucket || this.providerNameFromEnum(providerNum);
                    if (isAuraCasino) {
                        finalProvider = t.isVirtual ? PROVIDER_FAIRBET : PROVIDER_AURA;
                    }
                    out.push({
                        gameId:        String(t.id),
                        name:          String(t.name || ''),
                        image:         t.url ? String(t.url) : '',
                        provider:      finalProvider,
                        category:      rawCategoryName,
                        tableId:       String(t.id),
                        directGameUrl: '',
                        uniqueKey:     t.uniqueKey ? String(t.uniqueKey) : '',
                        providerId:    providerNum,
                        isVirtual:     !!t.isVirtual,
                    });
                });
            });
            return out;
        }

        private bucketForCategory(catName: string): string {
            if (!catName) { return ''; }
            if (catName.indexOf('aura') !== -1) { return PROVIDER_AURA; }
            if (catName.indexOf('supernova') !== -1 || catName.indexOf('supernowa') !== -1
                || catName.indexOf('virtual') !== -1 || catName.indexOf('vim') !== -1) { return PROVIDER_VIMPLAY; }
            if (catName.indexOf('fairbet') !== -1 || catName.indexOf('original') !== -1 || catName.indexOf('fairdeal') !== -1) { return PROVIDER_FAIRBET; }
            return PROVIDER_VIMPLAY; // default unknown categories into vimplay so they still show somewhere
        }

        private providerNameFromEnum(n: number): string {
            switch (n) {
                case 1: return PROVIDER_FAIRBET;
                case 5: return PROVIDER_AURA;
                default: return PROVIDER_VIMPLAY;
            }
        }

        // Builds the iframe route segment for a game based on its provider type.
        // Caller appends the query string (token, operatorId, stakes, etc.).
        // Routes mirror the iframe's ui-router states seen in scripts.js:
        //   Fairdeal(1) live  -> game-market/{id}
        //   Fairdeal(1) virt  -> virtual-game-market/{id}
        //   Supernowa(2)      -> snowagames/{id}
        //   Ezugi(3)          -> ezugi/{id}
        //   Evolution(4)      -> evolution/{id}
        //   FAWK(5)           -> fawk/{uniqueKey}    <- uses uniqueKey, not id
        //   QTech(6)          -> qtech/{id}
        //   DreamCasino(7)    -> dream/{id}
        //   MappleGames(8)    -> mapple/{id}
        public static buildIframeRoute(game: IGame, mobile: boolean): string {
            const topid = '2';
            const hmPrefix = mobile ? 'fs/mhome/' : 'fs/hm/';
            const id = game.tableId || game.gameId;
            const uk = game.uniqueKey || id;
            switch (game.providerId || 0) {
                case 1:  return hmPrefix + topid + '/' + (game.isVirtual ? 'virtual-game-market' : 'game-market') + '/' + id;
                case 2:  return hmPrefix + topid + '/snowagames/' + id;
                case 3:  return hmPrefix + topid + '/ezugi/' + id;
                case 4:  return hmPrefix + topid + '/evolution/' + id;
                case 5:  return hmPrefix + topid + '/fawk/' + uk;
                case 6:  return hmPrefix + topid + '/qtech/' + id;
                case 7:  return hmPrefix + topid + '/dream/' + id;
                case 8:  return hmPrefix + topid + '/mapple/' + id;
                default: return hmPrefix + topid + '/list/-1';
            }
        }
    }

    angular.module('intranet.services').service('gameListService', GameListService);
}
