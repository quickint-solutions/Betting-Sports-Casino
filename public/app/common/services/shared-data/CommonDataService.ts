namespace intranet.common.services {
    export class CommonDataService {
        eventTypes: any[];
        eventTypesPromise: any;

        supportDetails: any;
        supportDetailsPromise: any;

        InProcessMarkets: any[];

        betConfigPromise: any;

        updateBetModel: any;
        spinnerImg: any;
        rippleImg: any;

        openBets: any;

        highlight_loader_template: string;
        market_loader_template: string;
        mobile_market_loader_template: string;
        mobile_highlight_loader_template: string;

        mobilePromisetracker: any;
        commonPromiseTracker: any;

        userPLs: any[];

        isLMTloaded: boolean = false;
        lmtPromise: any;

        provider: any;
        web3Modal: any;
        wallet: any;

        public setProvider(p: any) { this.localStorageHelper.set('p_' + this.settings.WebApp, p); }
        public setWeb3(w: any) { this.localStorageHelper.set('we_' + this.settings.WebApp, w); }
        public setWallet(w: any) { this.localStorageHelper.set('wa_' + this.settings.WebApp, w); }

        public getProvider() { return this.localStorageHelper.get('p_' + this.settings.WebApp); }
        public getWeb3() { return this.localStorageHelper.get('we_' + this.settings.WebApp); }
        public getWallet() { return this.localStorageHelper.get('wa_' + this.settings.WebApp); }



        constructor(private $q: ng.IQService,
            private toasterService: intranet.common.services.ToasterService,
            public settings: common.IBaseSettings,
            private modalService: common.services.ModalService,
            private fileService: common.services.FileService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            private $http: any,
            private WSSocketService: any,
            private WSFairTradeSocketService: any,
            public $filter: any,
            private $window: any,
            private $state: any,
            public isMobile: any,
            private $timeout: any,
            private $sce: any,
            private $compile: ng.ICompileService,
            private $templateRequest: ng.ITemplateRequestService,
            private promiseTracker: any,
            private $rootScope: any) {

            this.spinnerImg = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/spinner.svg';
            this.rippleImg = this.settings.ImagePath + 'images/gif/spin-black.svg';
            this.market_loader_template = this.settings.ThemeName + '/template/loader-fullmarket.html';
            this.highlight_loader_template = this.settings.ThemeName + '/template/loader-highlight.html';
            this.mobile_market_loader_template = this.settings.ThemeName + (this.settings.ThemeName == 'lotus' ? '/template/loader-mobile-market-pm.html' : '/template/loader-mobile-market.html');
            this.mobile_highlight_loader_template = this.settings.ThemeName + '/template/loader-mobile-highlight.html';

            this.eventTypesPromise = this.$q.defer();
            this.betConfigPromise = this.$q.defer();
            this.lmtPromise = this.$q.defer();
            this.openBets = [];
            this.userPLs = [];
            this.eventTypes = [];

            this.supportDetailsPromise = this.$q.defer();
            this.supportDetails = {};

            this.commonPromiseTracker = this.promiseTracker({ activationDelay: 100 });
            this.mobilePromisetracker = this.promiseTracker({ activationDelay: 100 });

            this.$rootScope.$on('logoutme', () => {
                this.logout();
            });
        }

        public addPromise(promise: any): void {
            this.commonPromiseTracker.addPromise(promise);
        }

        public addMobilePromise(promise: any): void {
            this.mobilePromisetracker.addPromise(promise);
        }

        public setEventTypes(data: any): void {
            this.eventTypes = common.helpers.EventTypeHelper.setIcons(data, [this.settings.LiveGamesId, this.settings.VirtualGameId], [this.settings.HorseRacingId, this.settings.GreyhoundId], [this.settings.BinaryId]);
            this.eventTypesPromise.resolve(data);
        }

        public setFaasEventTypes(data: any[]): void {
            if (this.settings.FaasAccessLevel == common.enums.FaasAccessLevel.OnlySports) {
                data = data.filter((d: any) => { return d.id != this.settings.LiveGamesId; });
            }
            this.eventTypes = common.helpers.EventTypeHelper.setIcons(data, [this.settings.LiveGamesId], [this.settings.HorseRacingId, this.settings.GreyhoundId]);
            this.eventTypesPromise.resolve(data);
        }

        public getEventTypes(): ng.IHttpPromise<any> {
            if (this.eventTypesPromise.promise.$$state.status != 0) { this.eventTypesPromise = this.$q.defer(); }
            if (this.eventTypes && this.eventTypes.length > 0) {
                this.eventTypesPromise.resolve(this.eventTypes);
            }
            return this.$q.when(this.eventTypesPromise.promise);
        }


        public setSupportDetails(data: any): void {
            this.supportDetails = data;
            this.supportDetailsPromise.resolve(data);
        }

        public getSupportDetails(): ng.IHttpPromise<any> {
            if (this.supportDetailsPromise.promise.$$state.status != 0) { this.supportDetailsPromise = this.$q.defer(); }
            if (this.supportDetails && this.supportDetails.name) {
                this.supportDetailsPromise.resolve(this.supportDetails);
            }
            return this.$q.when(this.supportDetailsPromise.promise);
        }

        public getEventTypeOrder(eventtypeId: any): any {
            var order: string = '';
            if (this.eventTypes && this.eventTypes.length > 0) {
                var result = this.eventTypes.filter((e: any) => { return e.id == eventtypeId; }) || [];
                if (result.length > 0) {
                    order = result[0].displayOrder;
                    return order;
                }
            }
            return order;
        }

        public getEventTypeName(eventtypeId: any): any {
            var eventTypeName: string = '';
            if (this.eventTypes && this.eventTypes.length > 0) {
                var result = this.eventTypes.filter((e: any) => { return e.id == eventtypeId; }) || [];
                if (result.length > 0) {
                    eventTypeName = result[0].name;
                    return eventTypeName;
                }
            }
            return eventTypeName;
        }

        public getEventTypeSourceId(eventtypeId: any): any {
            var sourceId: string = '';
            if (this.eventTypes && this.eventTypes.length > 0) {
                var result = this.eventTypes.filter((e: any) => { return e.id == eventtypeId; }) || [];
                if (result.length > 0) {
                    sourceId = result[0].sourceId;
                    return sourceId;
                }
            }
            return sourceId;
        }

        public getEventTypeIcon(eventtypeId: any): any {
            var icon: string = 'images/faas/icons/default.png';
            if (this.eventTypes && this.eventTypes.length > 0) {
                var result = this.eventTypes.filter((e: any) => { return e.id == eventtypeId; }) || [];
                if (result.length > 0) {
                    icon = result[0].iconImg;
                    return icon;
                }
            }
            return icon;
        }

        public isSingleMarketClosed(market: any): void {
            if (market.marketStatus == common.enums.MarketStatus.CLOSED) {
                if (this.settings.IsFaaS) {
                    this.$timeout(() => {
                        if (this.settings.FaasAccessLevel == common.enums.FaasAccessLevel.OnlyGames) {
                            if (this.isMobile.any) {
                                this.$state.go('fs.mhome.egames');
                            }
                            else {
                                this.$state.go('fs.home.egames');
                            }
                        } else {
                            if (this.isMobile.any) {
                                this.$state.go('fs.mhome.highlight');
                            }
                            else {
                                this.$state.go('fs.home.highlight');
                            }
                        }
                    }, 2000);
                }
                else {
                    this.$timeout(() => { this.$state.go('base.home'); }, 2000);
                }
            }
        }


        public setUserBetConfig(data: any): void {
            this.localStorageHelper.set('user-betconfig', data);
            this.betConfigPromise.resolve(data);
        }

        public getUserBetConfig(): ng.IHttpPromise<any> {
            var betConfig = this.localStorageHelper.get('user-betconfig');
            if (betConfig) {
                this.betConfigPromise.resolve(betConfig);
            }
            return this.$q.when(this.betConfigPromise.promise);
        }



        public getBFEventTypeId(localId: any): any {
            var self = this;
            var findID = ((id: any): any => {
                var bfEventTypeId = 0;
                if (self.eventTypes.length > 0) {
                    self.eventTypes.forEach((e: any) => {
                        if (e.id == localId) {
                            bfEventTypeId = e.sourceId;
                        }
                    });
                    return bfEventTypeId;
                }
            });

            if (this.eventTypes) {
                return findID(localId);
            } else {
                this.$q.when(this.eventTypesPromise.promise).finally(() => {
                    return findID(localId);
                });
            }
        }


        public handleOneClickBetResponse(model: any, promise: ng.IHttpPromise<any>): void {
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data) {
                        var bet = response.data;
                        if (bet.orderStatus) {
                            if (bet.sizeRemaining > 0) {
                                var matched = this.$filter('toRate')(bet.sizeMatched);
                                var remaining = this.$filter('toRate')(bet.sizeRemaining);
                                //var unMatchmsg = this.$filter('translate')('bet.unmatched.message');
                                var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                unMatchmsg = unMatchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, remaining, model.price);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, unMatchmsg, 5000);
                            } else {
                                var matched = this.$filter('toRate')(bet.sizeMatched);
                                var placed = this.$filter('toRate')(model.size);
                                var Matchmsg = this.$filter('translate')('bet.matched.message');
                                Matchmsg = Matchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, placed, model.price, matched, bet.avgPrice);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Success, Matchmsg, 5000);
                            }
                            this.$rootScope.$broadcast('bet-submitted', { marketId: response.data.bet.marketId });
                        } else {
                            var msg = bet.message.format(model.marketName, model.runnerName);
                            this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg);
                        }
                    }
                }
                else {
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                }
            }).finally(() => { this.$rootScope.$broadcast('place-bet-ended', { marketId: model.marketId }); });
        }

        public openScorePosition(marketid: any, showMe: boolean = true, ladder: any[] = [], isLadderReady: boolean = false): void {
            if (this.settings.ThemeName != 'sky' && this.settings.ThemeName != 'lotus') {
                var modal = new common.helpers.CreateModal();
                modal.data = marketid;
                modal.header = 'user.position.modal.header';

                modal.bodyUrl = this.settings.ThemeName + '/home/sport/my-position.html';
                modal.controller = 'myPositionCtrl';
                if (this.settings.ThemeName == 'dimd2') {
                    modal.options.showFooter = false;
                } else {
                    modal.size = 'sm';
                }
                modal.options.actionButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            } else {
                if (isLadderReady) {
                    if (showMe) {
                        var scope: any = this.$rootScope.$new(true);
                        scope.id = marketid;
                        scope.ladder = ladder;
                        var html = '<kt-position data-id="{{id}}" data-ladders="{{ladder}}"> </kt-position>';
                        angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                        angular.element(document.getElementById('tbody_' + marketid)).after(this.$compile(html)(scope));
                    } else {
                        angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                    }
                }
                else {
                    if (showMe) {
                        var scope: any = this.$rootScope.$new(true);
                        scope.id = marketid;
                        var html = '<kt-position data-id="{{id}}"> </kt-position>';
                        angular.element(document.getElementById('tbody_' + marketid)).after(this.$compile(html)(scope));
                    } else {
                        angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                    }
                }
            }
        }



        public openWebsiteRules(): void {
            var modal = new common.helpers.CreateModal();

            modal.header = "THE SITE RULES AND REGULATIONS";
            modal.size = 'lg';
            if (this.settings.IsFaaS) {
                modal.bodyUrl = this.settings.ThemeName + '/home/rules-modal.html';
                modal.controller = 'faasRulesModalCtrl';
            }
            else {
                modal.bodyUrl = this.settings.ThemeName + '/home/rules-modal.html';
                modal.controller = 'rulesModalCtrl';
            }
            modal.options.actionButton = '';
            modal.options.closeButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        public openBFChart(ids: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                marketid: ids.marketSource,
                runnerId: ids.runnerSource,
                eventType: ids.eventType
            };
            modal.header = "Runner's Chart";
            modal.size = 'xlg';
            modal.bodyUrl = this.settings.ThemeName + '/home/bf-chart.html';
            modal.controller = 'bFChartModalCtrl';
            modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        public ShowPromoBanners(): void {
            var today = moment();
            this.getSupportDetails()
                .then((data: any) => {
                    if (data.supportDetails) {
                        var detail = JSON.parse(data.supportDetails);
                        if (detail.promoActive) {
                            var promo = this.localStorageHelper.get('promo_banner_' + this.settings.WebApp);
                            var diff = promo ? today.diff(promo, 'h') : detail.promoRepeatHours;
                            if (diff >= detail.promoRepeatHours || !promo) {
                                this.$timeout(() => {
                                    var modal = new common.helpers.CreateModal();
                                    modal.header = detail.promoHeader;
                                    modal.data = { count: detail.promoBannerCount, link: detail.promoLink };
                                    modal.size = this.isMobile.any ? 'md' : 'xlg';
                                    modal.bodyUrl = 'app/common/helpers/banner/banner-modal.html';
                                    modal.controller = 'bannerModalCtrl';
                                    modal.options.actionButton = detail.promoActionName;
                                    //modal.options.extraButton = '';
                                    if (!detail.promoCanCancel)
                                        modal.options.closeButton = '';
                                    modal.SetModal();
                                    this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                                        if (result.button == common.services.ModalResult.OK) {
                                            if (result.data == null) {
                                                if (detail.promoLink) {
                                                    window.open(detail.promoLink, '_blank');
                                                }
                                            }
                                        }
                                    });;
                                    this.localStorageHelper.set('promo_banner_' + this.settings.WebApp, today);
                                }, 1000);
                            }
                        }
                    }
                });
        }

        public ShowAgentBanners(data: any[], count: any) {
            if (data.length > 0) {
                var today = moment();
                this.$timeout(() => {
                    var modal = new common.helpers.CreateModal();
                    modal.data = data;
                    modal.size = 'banner';
                    if (this.settings.ThemeName == 'sports') {
                        modal.bodyUrl = 'app/common/helpers/banner/banner-modal-sports.html';
                    }
                    else if (this.settings.ThemeName == 'dimd2') {
                        modal.bodyUrl = 'app/common/helpers/banner/banner-modal-dimd2.html';
                    } else {
                        modal.bodyUrl = 'app/common/helpers/banner/banner-modal.html';
                    }
                    modal.templateUrl = 'app/common/helpers/banner/banner-base-modal.html';
                    modal.controller = 'bannerModalCtrl';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                    this.localStorageHelper.set('agent_banner_' + this.settings.WebApp, { date: today, count: count });
                });
            }
        }

        public BetProcessStarted(marketId): void {
            if (!this.InProcessMarkets) {
                this.InProcessMarkets = [];
            }
            if (this.InProcessMarkets.indexOf(marketId) == -1) {
                this.InProcessMarkets.push(marketId);
            }
        }

        public BetInProcess(marketId: any): boolean {
            if (this.InProcessMarkets) {
                var index = this.InProcessMarkets.indexOf(marketId);
                if (index > -1) { return true; }
                else { return false; }
            }
            else { return false; }
        }

        public BetProcessComplete(marketId): void {
            if (this.InProcessMarkets) {
                var index = this.InProcessMarkets.indexOf(marketId);
                if (index > -1) {
                    this.InProcessMarkets.splice(index, 1);
                }
            }
        }


        public downloadClientAPK(): void {
            var path = this.settings.ApiBaseUrl + this.settings.APKPath + '.apk';
            this.fileService.downloadByPath(path);
        }

        public downloadMasterAPK(): void {
            var path = this.settings.ApiBaseUrl + this.settings.APKPath + '_master.apk';
            this.fileService.downloadByPath(path);
        }

        public exportToExcel(promise: ng.IHttpPromise<any>): void {
            promise.success((response, status, headers: ng.IHttpHeadersGetter) => {
                var contentType = headers("content-type");
                // var filename = headers("content-filename");

                var contentDisposition = headers('Content-Disposition');
                var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

                if (contentType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && filename) {
                    // set name from header
                    this.fileService.downloadFileData(response, contentType, filename);
                }
                else {
                    var filepath = response.data;
                    if (filepath !== null && filepath != '') {
                        this.fileService.downloadFile(filepath);
                    }
                }
            });
        }

        public setBetModelForUpdate(detail: any, bet: any): void {
            this.updateBetModel = {
                betId: bet.id,
                marketId: bet.marketId,
                runnerId: bet.runnerId,
                side: bet.side,
                price: bet.price,
                size: bet.size,
                marketName: bet.marketName,
                runnerName: bet.runnerName,
                eventName: detail.eventName,
                eventId: detail.eventId,
                priceLadderType: detail.priceLadderType,
                maxUnitValue: detail.maxUnitValue,
                minUnitValue: detail.minUnitValue,
                interval: detail.interval,
                bettingType: detail.bettingType,
                percentage: bet.percentage ? bet.percentage : 100,
                isMobile: true,
                eventTypeId: detail.eventTypeId
            }
        }

        public clearBetModel(): void {
            this.updateBetModel = null;
        }

        public getOpenBets() { return this.openBets; }
        public setOpenBets(data: any): void {
            if (data && data.length > 0) {
                this.openBets.splice(0);
                data.forEach((d: any) => {
                    this.openBets.push({
                        bettingType: d.bettingType,
                        marketId: d.marketId,
                        eventId: d.eventId,
                        bets: d.avgBets,
                        grpBets: d.exposures,
                        allBets: d.bets
                    });
                });
            }
        }

        public clearStorage(): void {
            var existing_resolution = this.localStorageHelper.get(this.settings.DeviceType);
            var betconfimation = this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet');
            var alphasessionladder = this.localStorageHelper.get(this.settings.ThemeName + '_alphasessionladder');
            var remember = this.localStorageHelper.get('remember_' + this.settings.WebApp);
            var promo_banner = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
            var last_LoginMethod = this.localStorageHelper.get('loginmethod_' + this.settings.WebApp);
            // Preserve pending casino game so a wrong-password attempt (which 401s and triggers
            // clearStorage via ConcurrencyService.fetchTokenFromResponsePromise) doesn't drop the
            // user on home.base.home after they retry and log in successfully.
            var pending_casino_game = this.localStorageHelper.get('pending_casino_game');
            var pending_casino_game_meta = this.localStorageHelper.get('pending_casino_game_meta');

            this.openBets = [];
            this.userPLs = [];
            this.eventTypes.splice(0);

            this.localStorageHelper.clearAll();
            this.localCacheHelper.destroy();

            if (existing_resolution) { this.localStorageHelper.set(this.settings.DeviceType, existing_resolution); }
            if (betconfimation != undefined) { this.localStorageHelper.set(this.settings.ThemeName + '_confirmbet', betconfimation); }
            if (alphasessionladder != undefined) { this.localStorageHelper.set(this.settings.ThemeName + '_alphasessionladder', alphasessionladder); }
            if (remember) { this.localStorageHelper.set('remember_' + this.settings.WebApp, remember); }
            if (promo_banner) { this.localStorageHelper.set('agent_banner_' + this.settings.WebApp, promo_banner); }
            if (last_LoginMethod > 0) { this.localStorageHelper.set('loginmethod_' + this.settings.WebApp, last_LoginMethod); }
            if (pending_casino_game) { this.localStorageHelper.set('pending_casino_game', pending_casino_game); }
            if (pending_casino_game_meta) { this.localStorageHelper.set('pending_casino_game_meta', pending_casino_game_meta); }
        }


        public viewCards(m: any): void {


            var modal = new common.helpers.CreateModal();
            var winnerName, game_string;
            var marketRunner = [], extraWinnerList = [];
            if (m.gameString) { game_string = JSON.parse(m.gameString); }
            if (!m.marketRunner) { marketRunner = m.winners; }
            else { marketRunner = m.marketRunner.filter((mr: any) => { if (mr.status == common.enums.RunnerStatus.WINNER) { return mr; } }); }
            if (marketRunner.length > 0) {
                if (m.gameType == common.enums.GameType.PattiODI || m.gameType == common.enums.GameType.PokerODI) {
                    var found = marketRunner.filter((mr: any) => { return mr.status == common.enums.RunnerStatus.WINNER });
                    if (found.length > 0) {
                        winnerName = found[0].runner.name;
                    }
                } else if (m.gameType == common.enums.GameType.Patti2 || m.gameType == common.enums.GameType.Patti3 || m.gameType == common.enums.GameType.PokerT20) {
                    var wtext = JSON.parse(marketRunner[0].winner)[0].name;
                    angular.forEach(game_string, (g: any) => {
                        if (g.runner == wtext) {
                            g.winners = marketRunner.map((r: any) => { return r.runner.name; }).join(', ');
                        }
                    });
                }
                else if (m.gameType == common.enums.GameType.Card32) {
                    angular.forEach(marketRunner, (mr: any, index: any) => {
                        if (index == 0) { winnerName = mr.runner.name; }
                        else {
                            var wasSettled = false;
                            angular.forEach(game_string, (g: any) => {
                                if (g.runner.replace(' ', '-') == mr.runner.name) {
                                    if (mr.winner) {
                                        g.winner = JSON.parse(mr.winner)[0].name;
                                        wasSettled = true;
                                    }
                                }
                            });
                            if (!wasSettled) {
                                if (mr.winner)
                                    extraWinnerList.push({ runner: mr.runner.name + ' - ' + JSON.parse(mr.winner)[0].name });
                                else
                                    extraWinnerList.push({ runner: mr.runner.name });
                            }
                        }
                    });
                }
                else if (m.gameType == common.enums.GameType.ClashOfKings) {
                    angular.forEach(marketRunner, (mr: any, index: any) => {
                        if (index == 0) { winnerName = JSON.parse(mr.winner)[0].name; }
                        else {
                            if (mr.winner)
                                extraWinnerList.push({ runner: mr.runner.name + ' - ' + JSON.parse(mr.winner)[0].name });
                        }
                    });
                }
                else if (m.gameType == common.enums.GameType.AndarBahar || m.gameType == common.enums.GameType.Poker) {
                    var wtext = marketRunner[0].runner.name;
                    angular.forEach(game_string, (g: any) => {
                        if (g.runner == wtext) {
                            g.winners = ['Winner'];
                            g.winners.push(marketRunner.filter((mr: any) => { return mr.runner.name != wtext; }).map((r: any) => { return r.runner.name; }));
                            g.winners = g.winners.join(', ');
                        }
                    });
                }
                else if (m.gameType == common.enums.GameType.Up7Down) {
                    game_string[0].winners = [];
                    angular.forEach(marketRunner, (mr: any) => {
                        game_string[0].winners.push(JSON.parse(mr.winner)[0].name);
                    });
                    game_string[0].winners = game_string[0].winners.join(', ');
                }
                else if (m.gameType == common.enums.GameType.DragonTiger) {
                    var wtext = marketRunner[0].runner.name;
                    angular.forEach(game_string, (g: any) => {
                        if (g.runner == wtext) {
                            g.winners = [];
                            angular.forEach(marketRunner, (mr: any, rindex: any) => {
                                if (rindex > 0) { g.winners.push(JSON.parse(mr.winner)[0].name); }
                            });
                            g.winners = g.winners.join(', ');
                        }
                    });
                }
            }

            modal.data = {
                winner: winnerName,
                gameString: game_string,
                gameType: m.gameType,
                settleTime: m.settleTime,
                extraWinnerList: extraWinnerList
            };
            var marketname = m.name ? m.name : m.marketName;
            var msg: string = this.$filter('translate')('admin.runner.status.modal.header');
            msg = msg.format('"' + marketname + ' # ' + m.roundId + '"');
            modal.header = msg;

            modal.bodyUrl = this.settings.ThemeName + (this.settings.IsFaaS ? '/home/view-cards-modal.html' : '/master/view-cards-modal.html');

            modal.controller = 'viewCardsModalCtrl';
            modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        public openRadarView(marketid: any): void {
            var url = this.$state.href('rdview', { marketid: marketid });
            var w = screen.width - 150, h = 680;
            var left = (screen.width / 2) - (w / 2);
            var top = 50;
            this.$window.open(this.$sce.trustAsUrl(url), "Radar View", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }


        public formatLiveGameResult(marketRunner: any, gameType: any = null): any {
            var winnerString: any = '';
            var winnerMeta: any;
            marketRunner.forEach((mr: any, index: any) => {
                if (gameType == common.enums.GameType.Up7Down) {
                    mr.winnerObj = JSON.parse(mr.winner);
                    if (mr.winnerObj.length > 0) {
                        if (index == (marketRunner.length - 3)) { winnerString = mr.winnerObj[0].name[0]; }
                        if (index == (marketRunner.length - 1)) {
                            if (mr.winnerObj[0].id > 7) { winnerString = "U" + '-' + winnerString; }
                            else if (mr.winnerObj[0].id < 7) { winnerString = "D" + '-' + winnerString; }
                            else if (mr.winnerObj[0].id == 7) { winnerString = "7" + '-' + winnerString; }
                        }
                    }
                }
                else if (gameType == common.enums.GameType.DragonTiger) {
                    if (index == 0) { winnerString = mr.runner.name[0]; }
                    if (index == 2) {
                        mr.winnerObj = JSON.parse(mr.winner);
                        if (mr.winnerObj.length > 0) {
                            winnerString = winnerString + '-' + mr.winnerObj[0].name[0];
                        }
                    }
                    if (index == 3) {
                        mr.winnerObj = JSON.parse(mr.winner);
                        if (mr.winnerObj.length > 0) {
                            winnerString = winnerString + '-' + mr.winnerObj[0].name[0];
                        }
                    }
                }
                else if (gameType == common.enums.GameType.ClashOfKings) {
                    if (index == 0) {
                        mr.winnerObj = JSON.parse(mr.winner);
                        if (mr.winnerObj.length > 0) {
                            winnerString = mr.winnerObj[0].name.replace('K', '13');
                        }
                    }
                }
                else if (gameType == common.enums.GameType.Poker) {
                    if (index == 0) {
                        var splt = common.helpers.Utility.getAllFirstChar(mr.runner.name);
                        winnerString = splt[1];
                    } else {
                        var splt = common.helpers.Utility.getAllFirstChar(mr.runner.name);
                        winnerString = winnerString + '-' + splt;
                    }
                }
                else if (mr.winner) {
                    mr.winnerObj = JSON.parse(mr.winner);
                    if (index == 0 && mr.winnerObj[0]) {
                        winnerMeta = mr.winner;
                        mr.winnerObj.forEach((w: any) => {
                            if (w.name.indexOf(' ') < 0) {
                                winnerString = winnerString + w.name.substr(0, 1);
                            } else {
                                var arr = w.name.split(' ');
                                if (arr.length > 0) {
                                    winnerString = winnerString + arr[arr.length - 1].substr(0, 1);
                                }
                            }
                        });

                    }
                    if (index > 0) {
                        if (mr.winner == winnerMeta) {
                            winnerString = winnerString + '-' + common.helpers.Utility.getAllFirstChar(mr.runner.name);
                        }
                    }
                }
                else {
                    winnerString = winnerString + (index > 0 ? ', ' : '') + mr.runner.name;
                }
            });
            return winnerString;
        }

        public liveGamesMessgae(announcement: any): any {
            //if (!announcement) {
            //    if (this.settings.WebApp == 'winexch' || this.settings.WebApp == 'sports999') {
            //        announcement = "We are upgrading our live games experience and studio for better performance. Please stay tuned, we'll be back  up and running again in few days.";
            //    }
            //}
            return announcement;
        }


        public setUserPL(data: any): void {
            this.userPLs = data;
        }

        public setPLInOddsMarket(marketId: any, runner: any): void {
            var found = this.userPLs.filter((u: any) => { return u.marketId == marketId && u.runnerId == runner.runner.id; });
            if (found.length > 0) {
                runner.pl = this.$filter('toRateOnly')(found[0].pl);
                runner.stake = this.$filter('toRateOnly')(found[0].stake);
            } else {
                runner.pl = 0;
                runner.stake = 0;
            }
        }

        public setPLInOddsMarketFromBets(marketId: any, runner: any, metaname: any): void {
            this.openBets.forEach((op: any) => {
                if (op.marketId == marketId) {
                    op.grpBets.forEach((g: any) => {
                        if (g.runnerId == runner.runner.id) {
                            if (runner.metadata && runner.metadata[metaname]) {
                                runner.metadata[metaname].forEach((d: any) => {
                                    if (g.sectionId == d.id) {
                                        d.stake = this.$filter('toRateOnly')(g.sizeMatched);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }


        public setPLInFancyMarket(marketId: any): any {
            var result = undefined;
            var found = this.userPLs.filter((u: any) => { return u.marketId == marketId; });
            if (found.length > 0) {
                result = this.$filter('toRateOnly')(found[0].pl);
            }
            return result;
        }


        public setLMTScript(): void {
            var self = this;
            var newScript = document.createElement("script");
            newScript.src = "https://widgets.sir.sportradar.com/uscommon/widgetloader";
            newScript.async = true;
            newScript.setAttribute('n', 'SIR');
            newScript.onload = function () {
                self.isLMTloaded = true;
                self.lmtPromise.resolve(self.isLMTloaded);
            }
            document.head.appendChild(newScript);
        }

        public getLMTscriptStatus(): ng.IHttpPromise<any> {
            if (this.lmtPromise.promise.$$state.status != 0) { this.lmtPromise = this.$q.defer(); }
            if (this.isLMTloaded) {
                this.lmtPromise.resolve(this.isLMTloaded);
            }
            return this.$q.when(this.lmtPromise.promise);
        }


        public setWinnerBySection(market: any) {
            if (market.gameType == common.enums.GameType.Up7Down) {
                angular.forEach(market.marketRunner, (mr: any, rindex: any) => {
                    if (mr.winner) {
                        var wnr = JSON.parse(mr.winner);
                        angular.forEach(wnr, (w: any) => {
                            mr.metadata.up7down.forEach((m: any) => {
                                if (m.id == w.id) { m.status = common.enums.RunnerStatus.WINNER; }
                            });
                        });
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.DragonTiger) {
                angular.forEach(market.marketRunner, (mr: any, rindex: any) => {
                    if (mr.winner) {
                        var wnr = JSON.parse(mr.winner);
                        angular.forEach(wnr, (w: any) => {
                            mr.metadata.dragonTiger.forEach((m: any) => {
                                if (m.id == w.id) { m.status = common.enums.RunnerStatus.WINNER; }
                            });
                        });
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.Patti2 || market.gameType == common.enums.GameType.Patti3) {
                angular.forEach(market.marketRunner, (mr: any, rindex: any) => {
                    if (mr.winner && mr.winner.length > 0) {
                        var wnr = JSON.parse(mr.winner);
                        angular.forEach(wnr, (w: any) => {
                            market.pattiRunner.forEach((pr: any) => { if (pr.name == w.name) { pr.status = common.enums.RunnerStatus.WINNER; } });
                        });
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.Card32) {
                angular.forEach(market.marketRunner, (mr: any, rindex: any) => {
                    if (mr.winner && mr.winner.length > 0) {
                        var wnr = JSON.parse(mr.winner);
                        angular.forEach(wnr, (w: any) => {
                            if (mr.metadata && mr.metadata.card32)
                                mr.metadata.card32.forEach((pr: any) => { if (pr.name == w.name) { pr.status = common.enums.RunnerStatus.WINNER; } });
                        });
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.ClashOfKings) {
                angular.forEach(market.marketRunner, (mr: any, rindex: any) => {
                    if (mr.winner && mr.winner.length > 0) {
                        var wnr = JSON.parse(mr.winner);
                        angular.forEach(wnr, (w: any) => {
                            if (mr.metadata && mr.metadata.clashOfKing)
                                mr.metadata.clashOfKing.forEach((pr: any) => { if (pr.name == w.name) { pr.status = common.enums.RunnerStatus.WINNER; } });
                        });
                    }
                });
            }
        }

        public showReceiptModal(scope: any, imgBase64: any, forQR: boolean = false): ng.IPromise<any> {
            var defer = this.$q.defer();
            var path = this.settings.ThemeName + '/template/receipt-modal.html';

            var tscope: any = scope.$new(true);
            tscope.title = this.settings.Title;

            if (forQR) {
                tscope.receiptImgBase64 = encodeURIComponent(imgBase64);
                tscope.upiString = imgBase64;
                tscope.forQR = forQR;
            } else {
                tscope.receiptImgBase64 = imgBase64;
            }
            tscope.closeMe = () => {
                jQuery('#cus-placeholder').html('');
                defer.resolve();
            };

            this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template: any) => {
                this.$compile($("#cus-placeholder").html(template).contents())(tscope);
            });

            return defer.promise;
        }

        public showLotusFooterMsg(scope: any, index: any): ng.IPromise<any> {
            var defer = this.$q.defer();
            var path = this.settings.ThemeName + '/template/';

            if (index == 0) { path = path + 'under-age.html'; }
            else if (index == 1) { path = path + 'kyc.html'; }
            else if (index == 2) { path = path + 'restricted-territories.html'; }
            else if (index == 3) { path = path + 'responsible-gambling.html'; }
            else if (index == 4) { path = path + 'exclusion-policy.html'; }
            else if (index == 5) { path = path + 'admin-terms.html'; }
            else if (index == 6) { path = path + 'admin-multi-account.html'; }
            else if (index == 7) { path = path + 'confirm-age.html'; }
            else if (index == 11) { path = path + 'deposit-terms.html'; }


            var tscope: any = scope.$new(true);
            tscope.title = this.settings.Title;
            tscope.isTermAccepted = false;
            tscope.closeMe = () => {
                jQuery('#cus-placeholder').html('');
                defer.resolve();
            };

            tscope.rejected = () => {
                jQuery('#cus-placeholder').html('');
                this.logout();
                defer.reject();
            };

            this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template: any) => {
                this.$compile($("#cus-placeholder").html(template).contents())(tscope);
            });

            return defer.promise;
        }

        public getLoggedInUserData(): any {
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result) {
                return result.user;
            }
            return null;
        }

        public isOBD(): any {
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result && result.user) {
                if (result.user.userType == common.enums.UserType.Agent) {
                    return result.user.isOBD;
                }
                else {
                    if (result.parent) {
                        return result.parent.isOBD;
                    }
                }
            }
            return false;
        }

        public isCPLogin(): any {
            var user = this.getLoggedInUserData();
            if (user) {
                if (user.cpUserType == common.enums.UserType.CP) { return true; }
                else { return false; }
            }
            else { return false; }
        }

        public getLoggedInUserCurrency(): any {
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result) {
                return result.currency;
            }
            return null;
        }

        public setHorseMetadata(market: any): void {
            if (market) {
                angular.forEach(market.marketRunner, (mr: any) => {
                    if (mr.runner.runnerMetadata) {
                        mr.runner.meta = JSON.parse(mr.runner.runnerMetadata);
                    }
                });
            }
        }


        public storeDateFilter(search: any, key: string): void {
            this.localStorageHelper.set(key + '-from', search.fromdate);
            this.localStorageHelper.set(key + '-to', search.todate);
        }

        public getDateFilter(search: any, key: any): boolean {
            var isFound = false;
            var f = this.localStorageHelper.get(key + '-from');
            var t = this.localStorageHelper.get(key + '-to');
            if (f && t) {
                search.fromdate = new Date(moment(f).format("DD MMM YYYY HH:mm"));
                search.todate = new Date(moment(t).format("DD MMM YYYY HH:mm"));
                isFound = true;
            }
            return isFound;
        }


        public setShareData(obj: any): void {
            this.localCacheHelper.put('share-data-', obj);
        }

        public getShareData(): any {
            return this.localCacheHelper.get('share-data-');
        }


        public startIdleTimer(): void {
            ifvisible.setIdleDuration(this.settings.IdleTime);
        }

        public checkIdle(): ng.IPromise<any> {
            var defer = this.$q.defer();
            var user = this.getLoggedInUserData();
            if (user && user.userType == common.enums.UserType.Player) {
                this.showIdlePopup(defer);
            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        public userWakeup(): void {
            var user = this.getLoggedInUserData();
            if (user) {
                //if (user.userType == common.enums.UserType.Player) {
                //    location.reload();
                //}
                //else {
                this.WSSocketService.connetWs();
                this.WSFairTradeSocketService.connetWs();
                var response = { success: true };
                this.$rootScope.$emit("ws-balance-changed", response);
                //}
            }
        }

        private showIdlePopup(defer: ng.IDeferred<any>): void {
            var path = this.settings.ThemeName + '/template/idle-modal.html';
            var tscope: any = this.$rootScope.$new(true);
            tscope.renew = () => {
                defer.resolve();
                jQuery('#cus-placeholder').html('');
            };
            this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template: any) => {
                this.$compile($("#cus-placeholder").html(template).contents())(tscope);
            });
        }

        public otherLoginMessage(data: any): void {
            var user = this.getLoggedInUserData();
            if (user && user.userType) {
                var path = this.settings.ThemeName + '/template/other-login-modal.html';
                var tscope: any = this.$rootScope.$new(true);
                tscope.key = data;
                tscope.renew = () => {
                    this.logout();
                    jQuery('#cus-placeholder').html('');
                };
                this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template: any) => {
                    this.$compile($("#cus-placeholder").html(template).contents())(tscope);
                });

                this.$timeout(() => { tscope.renew() }, 5000);
            }
        }

        public validatePassword(pw: any, showToast: boolean = false): boolean {
            var alpLen = (pw.match(new RegExp("[a-zA-Z]", "g")) || []).length > 0;
            var numLen = (pw.match(new RegExp("[0-9]", "g")) || []).length > 0;
            if (alpLen != true || numLen != true || pw.length < 6) {
                if (showToast)
                    this.toasterService.showToastMessage(common.helpers.ToastType.Info, 'Password must be 6 character long, must contain alphabetics and numbers', 5000);

                return false;
            }
            return true;
        }

        public logout(wait: number = 0, redirect: boolean = true): void {
            this.clearStorage();
            this.WSSocketService.closeWs();
            this.WSFairTradeSocketService.closeWs();

            this.$http.get(this.settings.ApiBaseUrl + "authenticate/logout");
            if (wait > 0) {
                this.toasterService.showToast(intranet.common.helpers.ToastType.Success,
                    'You will be logout in ' + wait + ' seconds.', 3000);
            }
            if (redirect) {

                if (this.isChatInitiated()) {
                    fcWidget.destroy();
                }

                this.$timeout(() => {

                    if (this.isMobile.any) {
                        if (this.settings.IsMobileSeperate) { window.location.href = this.settings.MobileUrl; } else {
                            intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                                ? this.$state.go('mobile.promo', { msg: 'r' })
                                : this.$state.go('mobile.login', { msg: 'r' });
                        }
                    }
                    else {
                        intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                            ? this.$state.go('promo', { msg: 'r' })
                            : this.$state.go('login', { msg: 'r' });
                    }
                }, wait * 1000);
            }
        }

        public setExposurePTOption(value: any): void {
            this.localStorageHelper.set('master-pt-option', value);
        }

        public getExposurePTOption(): any {
            var result = this.localStorageHelper.get('master-pt-option');
            if (result) { return result.toString(); }
            else return 'true';
        }

        public setBackground(): void {
            if (this.settings.WebSiteIdealFor <= 2) {
                document.body.setAttribute('class', 'cbg');
                this.$rootScope.viewPort = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no";
            }
            else {
                document.body.setAttribute('class', 'mbg');
                this.$rootScope.viewPort = "";
            }

           

            if (this.settings.WebApp == 'gameok' || this.settings.WebApp == 'gameokin') { jQuery('body').addClass('dark-mode'); }
        }

        public addGaminIcon(): void {
            var newScript = document.createElement("script");
            newScript.src = "https://c6acff7c-c068-418f-8325-fe65b172131a.curacao-egaming.com/ceg-seal.js";
            document.head.appendChild(newScript);
            newScript.onload = function () {
                //ceg_c6acff7c_c068_418f_8325_fe65b172131a.init();

                var newinlineScript = document.createElement("script");
                var inlineScript = document.createTextNode("ceg_c6acff7c_c068_418f_8325_fe65b172131a.init();");
                newinlineScript.appendChild(inlineScript);
                document.head.appendChild(newinlineScript);
            };
        }

        private isChatInitiated() {
            return (typeof fcWidget != "undefined" && fcWidget.isInitialized() == true);
        }

        public openChatWindow() {
            if (this.isChatInitiated()) {
                fcWidget.show();
                fcWidget.open();
            }
        }

        public isChatActive(): boolean {
            var data = this.localStorageHelper.get(this.settings.UserData);
            return data && data.parent && data.parent.isChatEnabled;
        }

        public initFreshchat(hidechat: boolean = true) {
            var self = this;
            var data = this.localStorageHelper.get(this.settings.UserData);
            if (data && data.parent && data.parent.isChatEnabled) {

                var initChat = (() => {
                    fcWidget.init({
                        token: "182bf940-7f96-468c-a389-88b1945860e3",
                        host: "https://wchat.in.freshchat.com",
                        externalId: data.user.id,
                        siteId: data.parent.chatSiteId,
                        restoreId: data.user.chatRestoreId,
                        config: {
                            disableEvents: true,
                            showFAQOnOpen: false,
                            hideFAQ: true,
                            agent: {
                                hideName: false,
                                hidePic: true,
                                hideBio: true,
                            },
                            headerProperty: {
                                backgroundColor: this.settings.ThemeColor,
                                hideChatButton: hidechat,
                            },
                            content: {
                                headers: {
                                    chat: 'Chat with Upline',
                                    chat_help: 'Reach out to us if you have any questions',
                                }
                            }
                        }
                    });

                    fcWidget.user.get(function (resp) {
                        var status = resp && resp.status
                        if (status !== 200) {
                            fcWidget.user.setProperties({
                                firstName: data.user.username,              // user's first name
                            });
                            fcWidget.on('user:created', function (resp) {
                                var status = resp && resp.status,
                                    udata = resp && resp.data;
                                if (status === 200) {
                                    if (udata.restoreId) {
                                        self.$rootScope.$emit("fc-chat-restoreid-store", { data: udata });
                                    }
                                }
                            });
                            fcWidget.on("widget:closed", function (resp) {
                                fcWidget.hide();
                            });
                        }
                    });
                });

                var newScript = document.createElement("script");
                newScript.src = "https://wchat.in.freshchat.com/js/widget.js";
                newScript.async = true;
                newScript.id = "Freshdesk Messaging-js-sdk";
                newScript.onload = function () {
                    initChat();
                }
                document.head.appendChild(newScript);
            }
        }

        private tableId = '';
        public setGameId(tableId) { this.tableId = tableId; }
        public getGameId(): any { return this.tableId; }

        // Full pending-game payload so LiveGameDemoCtrl can route directly to the provider-specific
        // iframe view (FAWK needs uniqueKey, Fairdeal live vs virtual differs, etc).
        private pendingGame: any = null;
        public setPendingGame(game: any) { this.pendingGame = game; }
        public getPendingGame(): any { return this.pendingGame; }

        public copyText(txt) {
            // creating textarea of html
            var input = document.createElement("textarea");
            //adding p tag text to textarea 
            input.value = txt;
            document.body.appendChild(input);
            input.select();
            document.execCommand("Copy");
            // removing textarea after copy
            input.remove();
        }

    }

    angular.module('intranet.common.services').service('commonDataService', CommonDataService);
}