// ============================================================================
// GameListService — upstream game-list client for promo/home dynamic sections.
//
// PHASE 0 DISCOVERY — MUST BE COMPLETED BEFORE THIS SERVICE RETURNS REAL DATA:
//   1. Load the existing iframe (settings.FairXIFrameUrl + 'fs/hm/2/list/-1?token=...&tableId=...')
//      in Chrome DevTools with Network tab open.
//   2. Identify the JSON XHR call the iframe makes to list games. Capture:
//        - full endpoint URL                       -> set settings.FairXGameListUrl in grunt/config/ngconstant.js
//        - whether it supports a ?provider= filter -> adjust PROVIDER_PARAM + buildUrl below
//        - exact response field names              -> adjust mapRawGame() below
//   3. If response shape differs from the target contract, the ONLY place that
//      should change is mapRawGame() (one function) + the PROVIDER_* constants.
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
    }

    // ---- Phase-0 tuning knobs ------------------------------------------------
    // Names the app uses internally. Must stay lowercase so HTML filters are stable.
    export const PROVIDER_FAIRBET = 'fairbet';
    export const PROVIDER_AURA    = 'aura';
    export const PROVIDER_VIMPLAY = 'vimplay';

    // Map internal names -> values accepted by the upstream ?provider= param (if supported).
    // Fill these in after Phase 0. Until then, the service fetches everything and filters client-side.
    const UPSTREAM_PROVIDER_CODE: { [k: string]: string } = {
        // fairbet: '<upstream id for fairbet>',
        // aura:    '<upstream id for aura>',
        // vimplay: '<upstream id for vimplay>',
    };

    // Query param name used by the upstream (adjust after Phase 0 — e.g. 'providerId', 'provider', 'type').
    const PROVIDER_PARAM = 'provider';

    // In-memory cache for the "fetch everything once" strategy.
    const CACHE_TTL_MS = 5 * 60 * 1000;

    // --------------------------------------------------------------------
    // Logged-out fallback catalog.
    //
    // The promo page forces logout on init (PromoCtrl line ~183) so the
    // upstream gametable/getgameinfo endpoint (which needs a fairdeal token)
    // is not reachable there. We ship a baked-in catalog derived from the
    // previously-hardcoded HTML so the 4 sections always render. After login,
    // LiveGameDemoCtrl launches the real game via the existing iframe flow.
    //
    // Images use {webImagePath}casino/img/<file> at render time — we store
    // just the relative filename here and let the controller prefix it.
    // --------------------------------------------------------------------
    // Baked from a real /gametable/getgameinfo response (Aura Casino + Supernova categories).
    // providerId=5 (FAWK) routes via uniqueKey; providerId=7 (DreamCasino/Supernova) routes via tableId.
    // Images: providerId=7 uses absolute CDN urls; providerId=5 falls back to /public/images/drpapaya/casino/img/{tableId}.jpg.
    const FALLBACK_CATALOG: IGame[] = [
        // --- Aura Casino (provider=5 FAWK, bucket=fairbet for the "Fairbet Original Games" section) ---
        { gameId: '630df58edc0c3fd8f78bee2e', tableId: '630df58edc0c3fd8f78bee2e', name: 'Teenpatti One Day',   image: '630df58edc0c3fd8f78bee2e.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '56767', providerId: 5, isVirtual: false },
        { gameId: '630df5f50c22dbface4f67fb', tableId: '630df5f50c22dbface4f67fb', name: '32 Card Casino',      image: '630df5f50c22dbface4f67fb.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '56967', providerId: 5, isVirtual: false },
        { gameId: '630df616a419f88910179087', tableId: '630df616a419f88910179087', name: 'HI LOW',              image: '630df616a419f88910179087.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '56968', providerId: 5, isVirtual: false },
        { gameId: '630df6a0dc0c3fd8f78bef3c', tableId: '630df6a0dc0c3fd8f78bef3c', name: 'Andar Bahar',         image: 'andarbahar.jpg',               provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '87564', providerId: 5, isVirtual: false },
        { gameId: '630df6c20c22dbface4f6afd', tableId: '630df6c20c22dbface4f6afd', name: 'Matka',               image: '630df6c20c22dbface4f6afd.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '92037', providerId: 5, isVirtual: false },
        { gameId: '630df6f49510dff723384d49', tableId: '630df6f49510dff723384d49', name: '7 Up-7 Down',         image: '630df6f49510dff723384d49.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98789', providerId: 5, isVirtual: false },
        { gameId: '630df7b3dc0c3fd8f78bf072', tableId: '630df7b3dc0c3fd8f78bf072', name: 'Dragon Tiger',        image: 'dragontiger.jpg',              provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98790', providerId: 5, isVirtual: false },
        { gameId: '630df7d19510dff723385047', tableId: '630df7d19510dff723385047', name: 'Amar Akbar Anthony',  image: '630df7d19510dff723385047.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98791', providerId: 5, isVirtual: false },
        { gameId: '630df8a79510dff72338530a', tableId: '630df8a79510dff72338530a', name: 'Race 20 20',          image: 'race2020.jpg',                 provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '90100', providerId: 5, isVirtual: false },
        { gameId: '630df979a419f88910179b37', tableId: '630df979a419f88910179b37', name: 'Bollywood Casino',    image: 'bollywoodcasino.jpg',          provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67570', providerId: 5, isVirtual: false },
        { gameId: '630df9a30c22dbface4f73cb', tableId: '630df9a30c22dbface4f73cb', name: 'Roulette',            image: 'roulette.jpg',                 provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98788', providerId: 5, isVirtual: false },
        { gameId: '630dfadc9510dff723385955', tableId: '630dfadc9510dff723385955', name: 'Teenpatti Trio',      image: '630dfadc9510dff723385955.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67610', providerId: 5, isVirtual: false },
        { gameId: '630dfaf3a419f88910179f46', tableId: '630dfaf3a419f88910179f46', name: 'Baccarat',            image: 'baccarat.jpg',                 provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '92038', providerId: 5, isVirtual: false },
        { gameId: '630dfb249510dff723385a24', tableId: '630dfb249510dff723385a24', name: 'Casino Meter',        image: 'casinometer.jpg',              provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67575', providerId: 5, isVirtual: false },
        { gameId: '630dfbca9510dff723385b75', tableId: '630dfbca9510dff723385b75', name: '2 Card Teenpatti',    image: 'tp2card.jpg',                  provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67660', providerId: 5, isVirtual: false },
        { gameId: '630dfbe8dc0c3fd8f78bf43a', tableId: '630dfbe8dc0c3fd8f78bf43a', name: 'Queen Race',          image: 'queen.jpg',                    provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67620', providerId: 5, isVirtual: false },
        { gameId: '630dfcc99510dff723385da8', tableId: '630dfcc99510dff723385da8', name: 'Trap',                image: 'trap.jpg',                     provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67680', providerId: 5, isVirtual: false },
        { gameId: '630dfd280c22dbface4f7c00', tableId: '630dfd280c22dbface4f7c00', name: 'Casino War',          image: 'casinowar.jpg',                provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67580', providerId: 5, isVirtual: false },
        { gameId: '630dfda8dc0c3fd8f78bf5a5', tableId: '630dfda8dc0c3fd8f78bf5a5', name: '29 Card Baccarat',    image: 'baccarat29.jpg',               provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67690', providerId: 5, isVirtual: false },
        { gameId: '630dfdc90c22dbface4f7d7c', tableId: '630dfdc90c22dbface4f7d7c', name: 'Race to 17',          image: 'race17.jpg',                   provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67710', providerId: 5, isVirtual: false },
        { gameId: '647eea02326afce6d79a99d6', tableId: '647eea02326afce6d79a99d6', name: 'Dream Catcher',       image: 'creamcather.jpg',              provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98567', providerId: 5, isVirtual: false },
        { gameId: '647eea29326afce6d79a9a39', tableId: '647eea29326afce6d79a9a39', name: '3 Card Judgement',    image: '647eea29326afce6d79a9a39.jpg', provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67670', providerId: 5, isVirtual: false },
        { gameId: '647eea433911412c40003bec', tableId: '647eea433911412c40003bec', name: 'Super Over',          image: 'superover.jpg',                provider: 'fairbet', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67720', providerId: 5, isVirtual: false },

        // --- Aura-branded duplicates for the "Aura Games" section (same underlying tables, different artwork) ---
        { gameId: 'aura-baccarat',    tableId: '630dfaf3a419f88910179f46', name: 'Baccarat',       image: 'baccarat-aura.png',    provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '92038', providerId: 5, isVirtual: false },
        { gameId: 'aura-hilow',       tableId: '630df616a419f88910179087', name: 'Hi-Low',         image: 'hilow-aura.png',       provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '56968', providerId: 5, isVirtual: false },
        { gameId: 'aura-matka',       tableId: '630df6c20c22dbface4f6afd', name: 'Matka',          image: 'matka-aura.png',       provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '92037', providerId: 5, isVirtual: false },
        { gameId: 'aura-race2020',    tableId: '630df8a79510dff72338530a', name: '20-20 Race',     image: 'race2020-aura.png',    provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '90100', providerId: 5, isVirtual: false },
        { gameId: 'aura-trio',        tableId: '630dfadc9510dff723385955', name: 'Trio',           image: 'trio-aura.png',        provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67610', providerId: 5, isVirtual: false },
        { gameId: 'aura-dragontiger', tableId: '630df7b3dc0c3fd8f78bf072', name: 'Dragon Tiger',   image: 'dragontiger-aura.png', provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '98790', providerId: 5, isVirtual: false },
        { gameId: 'aura-poker',       tableId: '630df63e0c22dbface4f68f0', name: 'Poker One Day',  image: 'poker-aura.png',       provider: 'aura', category: 'Aura Casino', directGameUrl: '', uniqueKey: '67564', providerId: 5, isVirtual: false },

        // --- Supernova (provider=7 DreamCasino, bucket=vimplay) — absolute CDN image URLs ---
        { gameId: '69440091d3d73d6a36a3e96c', tableId: '69440091d3d73d6a36a3e96c', name: 'Teen Patti',            image: 'https://cdn.dreamdelhi.com/suno/teen_patti.webp',                 provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'TP',    providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e96d', tableId: '69440091d3d73d6a36a3e96d', name: 'Baccarat',              image: 'https://cdn.dreamdelhi.com/suno/Baccarat_1654236281166.404.webp', provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'BAC',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e96e', tableId: '69440091d3d73d6a36a3e96e', name: 'Akbar Romeo Walter',    image: 'https://cdn.dreamdelhi.com/suno/akbar_romeo_walter.webp',         provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'ARW',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e96f', tableId: '69440091d3d73d6a36a3e96f', name: '32 Cards',              image: 'https://cdn.dreamdelhi.com/suno/32-Cards_1654236218602.8164.webp',provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'C32',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e970', tableId: '69440091d3d73d6a36a3e970', name: 'Lucky 7',               image: 'https://cdn.dreamdelhi.com/suno/Lucky-7_1657523911243.0068.webp', provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'UD7',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e971', tableId: '69440091d3d73d6a36a3e971', name: 'Andar Bahar',           image: 'https://cdn.dreamdelhi.com/suno/andar_bahar.webp',                provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'ABC',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e972', tableId: '69440091d3d73d6a36a3e972', name: "Goa's Andar Bahar",     image: 'https://cdn.dreamdelhi.com/suno/goa_andar_bahar.webp',            provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'AB2',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e973', tableId: '69440091d3d73d6a36a3e973', name: 'Teen patti face off',   image: 'https://cdn.dreamdelhi.com/suno/teen_patti_faceoff.webp',         provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'TPFO',  providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e974', tableId: '69440091d3d73d6a36a3e974', name: 'Teen patti 2020',       image: 'https://cdn.dreamdelhi.com/suno/Teen-Patti-2020_1654236450045.9844.webp', provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'TP20', providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e975', tableId: '69440091d3d73d6a36a3e975', name: 'Classic Andar Bahar',   image: 'https://cdn.dreamdelhi.com/suno/Andar-Bahar_1654236263135.5576.webp', provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'AB', providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e976', tableId: '69440091d3d73d6a36a3e976', name: 'Muflis Teen patti',     image: 'https://cdn.dreamdelhi.com/suno/muflis_teen_patti.webp',          provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'MTP7M', providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e977', tableId: '69440091d3d73d6a36a3e977', name: 'Virtual Teenpatti',     image: 'https://cdn.dreamdelhi.com/suno/teen_patti_vr.webp',              provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VTP',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e978', tableId: '69440091d3d73d6a36a3e978', name: 'Virtual Baccarat',      image: 'https://cdn.dreamdelhi.com/suno/virtual_baccarat.webp',           provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VBAC',  providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e979', tableId: '69440091d3d73d6a36a3e979', name: 'Virtual Dragon Tiger',  image: 'https://cdn.dreamdelhi.com/suno/virtual_dragon_tiger.webp',       provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VDT',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e97a', tableId: '69440091d3d73d6a36a3e97a', name: 'Virtual Worli Matka',   image: 'https://cdn.dreamdelhi.com/suno/worli_matka_vr.webp',             provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VWM',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e980', tableId: '69440091d3d73d6a36a3e980', name: 'Virtual King Race',     image: 'https://cdn.dreamdelhi.com/suno/king_race_vr.webp',               provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VCR',   providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e982', tableId: '69440091d3d73d6a36a3e982', name: 'Virtual Joker',         image: 'https://cdn.dreamdelhi.com/suno/joker_vr.webp',                   provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'VJKR',  providerId: 7, isVirtual: false },
        { gameId: '69440091d3d73d6a36a3e983', tableId: '69440091d3d73d6a36a3e983', name: 'Virtual Casino Queen',  image: 'https://cdn.dreamdelhi.com/suno/virtual_casino_queen.webp',       provider: 'vimplay', category: 'Supernova', directGameUrl: '', uniqueKey: 'RCQ',   providerId: 7, isVirtual: false },
    ];

    export class GameListService {
        private cache: { at: number; data: IGame[] } | null = null;
        private inflight: ng.IPromise<IGame[]> | null = null;
        private authCache: { at: number; data: IGame[] } | null = null;
        private authInflight: ng.IPromise<IGame[]> | null = null;

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

        // Home page path: fetch live catalog from FairX API using the FairDeal token.
        // Response shape: { success, data: [{ id, name, gameTables: [{ id, name, provider, uniqueKey, ... }] }] }.
        //
        // The live endpoint requires THREE headers:
        //   - token          (session token — passed in as param)
        //   - operator       (tenant Mongo ID from settings.FairXOperatorId)
        //   - primary-token  (pre-shared tenant client token from settings.FairXPrimaryToken)
        // If any are missing, or the call fails (401, network, etc.), we fall back
        // to a saved copy of a real FairX response at
        // /public/app/services/fairx-catalog.json. That snapshot has all 16 real
        // categories with their real games so the grid always has data. If even
        // the static JSON is unreachable we degrade to the tiny FALLBACK_CATALOG.
        public loadGamesWithFairDealToken(token: string, operatorId: string): ng.IPromise<IGame[]> {
            const now = Date.now();
            if (this.authCache && now - this.authCache.at < CACHE_TTL_MS) {
                return this.$q.when(this.authCache.data);
            }
            if (this.authInflight) { return this.authInflight; }

            const url = (this.settings.FairXGameListUrl || '').trim();
            const tenantOperator = (this.settings.FairXOperatorId || '').trim();
            const primaryToken = (this.settings.FairXPrimaryToken || '').trim();

            // No live-call pre-requisites → serve the bundled real-response snapshot.
            if (!url || !token) {
                this.authInflight = this.loadStaticCatalog();
                return this.authInflight;
            }

            const headers: any = {};
            headers[this.settings.ServerTokenName] = token;
            const csrf = this.concurrencyService.getCSRF(token);
            if (csrf) { headers[this.settings.CSRFKey] = csrf.toString(); }
            // Tenant operator Mongo ID (preferred) OR the numeric operatorId from fdService.
            headers['operator'] = tenantOperator || operatorId;
            if (primaryToken) { headers['primary-token'] = primaryToken; }

            this.authInflight = this.$http.get<any>(url, { headers: headers })
                .then((resp: any) => {
                    // See getAllGames(): global responseError interceptor swallows rejections.
                    if (!resp || (resp.status && resp.status >= 400) || !resp.data || resp.data.success === false) {
                        throw new Error('fairx-unavailable');
                    }
                    const games = this.flattenFairXResponse(resp.data);
                    if (!games.length) { throw new Error('fairx-empty'); }
                    const withImages = this.withResolvedImages(games);
                    this.authCache = { at: Date.now(), data: withImages };
                    this.authInflight = null;
                    return withImages;
                })
                .catch(() => {
                    // Live endpoint failed → try the saved snapshot before giving up.
                    return this.loadStaticCatalog();
                });
            return this.authInflight;
        }

        // Loads the real FairX response snapshot shipped at
        //   /public/app/services/fairx-catalog.json
        // and flattens it through the same pipeline the live endpoint uses.
        // Each game keeps its real `category` (Virtual Casino, Ezugi, Aura Casino,
        // Supernova, Evolution, SA Gaming, Vivo Gaming, Skywind Live, Betgames.TV,
        // BETER Live, Table Games, Instant Win, Scratch Games, Lottery & Shooting,
        // Slot, Exchange).
        private loadStaticCatalog(): ng.IPromise<IGame[]> {
            const staticUrl = (this.settings.ImagePath || '/public/') + 'app/services/fairx-catalog.json';
            return this.$http.get<any>(staticUrl)
                .then((resp: any) => {
                    if (!resp || !resp.data) { throw new Error('static-catalog-missing'); }
                    const games = this.flattenFairXResponse(resp.data.data || resp.data);
                    if (!games.length) { throw new Error('static-catalog-empty'); }
                    const withImages = this.withResolvedImages(games);
                    this.authCache = { at: Date.now(), data: withImages };
                    this.authInflight = null;
                    return withImages;
                })
                .catch(() => {
                    // Last-resort fallback — the tiny hardcoded 48-game list.
                    const fallback = this.withResolvedImages(FALLBACK_CATALOG);
                    this.authCache = { at: Date.now(), data: fallback };
                    this.authInflight = null;
                    return fallback;
                });
        }

        public invalidate(): void {
            this.cache = null;
            this.inflight = null;
            this.authCache = null;
            this.authInflight = null;
        }

        // -------- internals ---------------------------------------------------

        private getAllGames(): ng.IPromise<IGame[]> {
            const now = Date.now();
            if (this.cache && now - this.cache.at < CACHE_TTL_MS) {
                return this.$q.when(this.cache.data);
            }
            if (this.inflight) { return this.inflight; }

            const url = this.buildUrl();
            if (!url) {
                // No upstream configured yet (Phase 0 pending) — resolve with the
                // bundled fallback so the promo/home sections still render.
                const fallback = this.withResolvedImages(FALLBACK_CATALOG);
                this.cache = { at: Date.now(), data: fallback };
                return this.$q.when(fallback);
            }

            this.inflight = this.$http.get<any>(url)
                .then((resp: any) => {
                    // Global responseError interceptor converts 4xx/5xx into resolved promises,
                    // so guard with explicit status + payload checks to catch that case.
                    if (!resp || (resp.status && resp.status >= 400) || !resp.data || resp.data.success === false) {
                        throw new Error('fairx-unavailable');
                    }
                    // Anonymous path reuses the FairX nested shape if the response looks like
                    // [{ gameTables: [...] }, ...] (i.e. the catalog endpoint returning categories).
                    const looksLikeFairX = Array.isArray(resp.data) && resp.data.length > 0 && Array.isArray(resp.data[0].gameTables);
                    let games: IGame[];
                    if (looksLikeFairX) {
                        games = this.withResolvedImages(this.flattenFairXResponse(resp.data));
                    } else {
                        const raw = this.extractList(resp.data);
                        games = raw.map((r) => this.mapRawGame(r)).filter((g) => !!g.gameId);
                    }
                    if (!games.length) { throw new Error('fairx-empty'); }
                    this.cache = { at: Date.now(), data: games };
                    this.inflight = null;
                    return games;
                })
                .catch(() => {
                    // Soft-fail to fallback catalog instead of rejecting; ensures the UI still has content.
                    const fallback = this.withResolvedImages(FALLBACK_CATALOG);
                    this.cache = { at: Date.now(), data: fallback };
                    this.inflight = null;
                    return fallback;
                });
            return this.inflight;
        }

        // Resolves relative image filenames against the configured webImagePath so
        // cards pick up the correct per-theme/per-skin asset directory.
        // Use Object.assign so uniqueKey / providerId / isVirtual survive — buildIframeRoute
        // depends on them; dropping them sends FAWK/DreamCasino games to the generic lobby.
        private withResolvedImages(games: IGame[]): IGame[] {
            const webPath = (this.settings.ImagePath || '/public/') + 'images/' + (this.settings.WebApp || 'drpapaya') + '/';
            return games.map((g) => {
                if (!g.image || g.image.indexOf('/') === 0 || g.image.indexOf('http') === 0) { return g; }
                return Object.assign({}, g, { image: webPath + 'casino/img/' + g.image }) as IGame;
            });
        }

        private buildUrl(provider?: string): string {
            const base = (this.settings.FairXGameListUrl || '').trim();
            if (!base) { return ''; }
            const code = provider ? UPSTREAM_PROVIDER_CODE[provider.toLowerCase()] : '';
            if (!code) { return base; }
            const sep = base.indexOf('?') === -1 ? '?' : '&';
            return base + sep + PROVIDER_PARAM + '=' + encodeURIComponent(code);
        }

        // Upstream may return a bare array OR an object like { data: [...] } or { games: [...] }.
        private extractList(body: any): any[] {
            if (!body) { return []; }
            if (Array.isArray(body)) { return body; }
            if (Array.isArray(body.data)) { return body.data; }
            if (Array.isArray(body.games)) { return body.games; }
            if (Array.isArray(body.items)) { return body.items; }
            if (Array.isArray(body.list)) { return body.list; }
            return [];
        }

        // PHASE-0: adjust field names here to match the real upstream response.
        private mapRawGame(r: any): IGame {
            if (!r) { return {} as IGame; }
            return {
                gameId:        String(r.gameId || r.id || r._id || r.tableId || ''),
                name:          String(r.name || r.title || r.gameName || ''),
                image:         String(r.image || r.imageUrl || r.thumbnail || r.thumb || ''),
                provider:      String(r.provider || r.providerName || r.providerCode || '').toLowerCase(),
                tableId:       String(r.tableId || r.table_id || r.id || ''),
                directGameUrl: String(r.directGameUrl || r.launchUrl || r.gameUrl || r.url || ''),
            };
        }

        // FairX response: direct array [{ id, name: "Aura Casino" | "Supernova" | ..., gameTables: [...] }].
        // Flatten into IGame[] and bucket by category name -> provider.
        // Numeric provider enum on each table: 1=Fairdeal, 2=Supernowa, 3=Ezugi, 4=Evolution, 5=FAWK, 6=QTech, 7=DreamCasino, 8=MappleGames.
        private flattenFairXResponse(body: any): IGame[] {
            const categories = this.extractList(body);
            const out: IGame[] = [];
            const webPath = (this.settings.ImagePath || '/public/') + 'images/' + (this.settings.WebApp || 'drpapaya') + '/';
            categories.forEach((cat: any) => {
                if (!cat || !Array.isArray(cat.gameTables)) { return; }
                const rawCategoryName = String(cat.name || '');         // preserve "Ezugi", "Aura Casino", "Supernova", etc.
                const catNameLower = rawCategoryName.toLowerCase();
                const bucket = this.bucketForCategory(catNameLower);
                // Home-page carousel split for Aura Casino:
                //   live (isVirtual=false)  → fairbet bucket → "Fairbet Original Games" section
                //   virtual (isVirtual=true) → aura bucket    → "Aura Games" section
                // This preserves the original two-section layout on the home page
                // (before we switched from hardcoded catalog to the real API snapshot
                // the split was ~23 fairbet + 7 aura curated duplicates; isVirtual
                // maps cleanly to that intent).
                const isAuraCasino = catNameLower.indexOf('aura') !== -1;
                cat.gameTables.forEach((t: any) => {
                    if (!t || !t.id || t.isActive === false) { return; }
                    const providerNum = Number(t.provider || 0);
                    let finalProvider = bucket || this.providerNameFromEnum(providerNum);
                    if (isAuraCasino) {
                        finalProvider = t.isVirtual ? PROVIDER_AURA : PROVIDER_FAIRBET;
                    }
                    // Prefer absolute image URL from API (Supernowa sends CDN URLs in `url`).
                    // Fallback to local {tableId}.jpg convention (our /public/images/drpapaya/casino/img/*).
                    let image = '';
                    if (t.url && String(t.url).indexOf('http') === 0) {
                        image = String(t.url);
                    } else {
                        image = webPath + 'casino/img/' + String(t.id) + '.jpg';
                    }
                    out.push({
                        gameId:        String(t.id),
                        name:          String(t.name || ''),
                        image:         image,
                        provider:      finalProvider,
                        category:      rawCategoryName,                  // strict per-category filtering uses this
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
