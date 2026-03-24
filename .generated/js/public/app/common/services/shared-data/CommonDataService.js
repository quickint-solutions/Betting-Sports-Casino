var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class CommonDataService {
                constructor($q, toasterService, settings, modalService, fileService, localStorageHelper, localCacheHelper, $http, WSSocketService, WSFairTradeSocketService, $filter, $window, $state, isMobile, $timeout, $sce, $compile, $templateRequest, promiseTracker, $rootScope) {
                    this.$q = $q;
                    this.toasterService = toasterService;
                    this.settings = settings;
                    this.modalService = modalService;
                    this.fileService = fileService;
                    this.localStorageHelper = localStorageHelper;
                    this.localCacheHelper = localCacheHelper;
                    this.$http = $http;
                    this.WSSocketService = WSSocketService;
                    this.WSFairTradeSocketService = WSFairTradeSocketService;
                    this.$filter = $filter;
                    this.$window = $window;
                    this.$state = $state;
                    this.isMobile = isMobile;
                    this.$timeout = $timeout;
                    this.$sce = $sce;
                    this.$compile = $compile;
                    this.$templateRequest = $templateRequest;
                    this.promiseTracker = promiseTracker;
                    this.$rootScope = $rootScope;
                    this.isLMTloaded = false;
                    this.tableId = '';
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
                setProvider(p) { this.localStorageHelper.set('p_' + this.settings.WebApp, p); }
                setWeb3(w) { this.localStorageHelper.set('we_' + this.settings.WebApp, w); }
                setWallet(w) { this.localStorageHelper.set('wa_' + this.settings.WebApp, w); }
                getProvider() { return this.localStorageHelper.get('p_' + this.settings.WebApp); }
                getWeb3() { return this.localStorageHelper.get('we_' + this.settings.WebApp); }
                getWallet() { return this.localStorageHelper.get('wa_' + this.settings.WebApp); }
                addPromise(promise) {
                    this.commonPromiseTracker.addPromise(promise);
                }
                addMobilePromise(promise) {
                    this.mobilePromisetracker.addPromise(promise);
                }
                setEventTypes(data) {
                    this.eventTypes = common.helpers.EventTypeHelper.setIcons(data, [this.settings.LiveGamesId, this.settings.VirtualGameId], [this.settings.HorseRacingId, this.settings.GreyhoundId], [this.settings.BinaryId]);
                    this.eventTypesPromise.resolve(data);
                }
                setFaasEventTypes(data) {
                    if (this.settings.FaasAccessLevel == common.enums.FaasAccessLevel.OnlySports) {
                        data = data.filter((d) => { return d.id != this.settings.LiveGamesId; });
                    }
                    this.eventTypes = common.helpers.EventTypeHelper.setIcons(data, [this.settings.LiveGamesId], [this.settings.HorseRacingId, this.settings.GreyhoundId]);
                    this.eventTypesPromise.resolve(data);
                }
                getEventTypes() {
                    if (this.eventTypesPromise.promise.$$state.status != 0) {
                        this.eventTypesPromise = this.$q.defer();
                    }
                    if (this.eventTypes && this.eventTypes.length > 0) {
                        this.eventTypesPromise.resolve(this.eventTypes);
                    }
                    return this.$q.when(this.eventTypesPromise.promise);
                }
                setSupportDetails(data) {
                    this.supportDetails = data;
                    this.supportDetailsPromise.resolve(data);
                }
                getSupportDetails() {
                    if (this.supportDetailsPromise.promise.$$state.status != 0) {
                        this.supportDetailsPromise = this.$q.defer();
                    }
                    if (this.supportDetails && this.supportDetails.name) {
                        this.supportDetailsPromise.resolve(this.supportDetails);
                    }
                    return this.$q.when(this.supportDetailsPromise.promise);
                }
                getEventTypeOrder(eventtypeId) {
                    var order = '';
                    if (this.eventTypes && this.eventTypes.length > 0) {
                        var result = this.eventTypes.filter((e) => { return e.id == eventtypeId; }) || [];
                        if (result.length > 0) {
                            order = result[0].displayOrder;
                            return order;
                        }
                    }
                    return order;
                }
                getEventTypeName(eventtypeId) {
                    var eventTypeName = '';
                    if (this.eventTypes && this.eventTypes.length > 0) {
                        var result = this.eventTypes.filter((e) => { return e.id == eventtypeId; }) || [];
                        if (result.length > 0) {
                            eventTypeName = result[0].name;
                            return eventTypeName;
                        }
                    }
                    return eventTypeName;
                }
                getEventTypeSourceId(eventtypeId) {
                    var sourceId = '';
                    if (this.eventTypes && this.eventTypes.length > 0) {
                        var result = this.eventTypes.filter((e) => { return e.id == eventtypeId; }) || [];
                        if (result.length > 0) {
                            sourceId = result[0].sourceId;
                            return sourceId;
                        }
                    }
                    return sourceId;
                }
                getEventTypeIcon(eventtypeId) {
                    var icon = 'images/faas/icons/default.png';
                    if (this.eventTypes && this.eventTypes.length > 0) {
                        var result = this.eventTypes.filter((e) => { return e.id == eventtypeId; }) || [];
                        if (result.length > 0) {
                            icon = result[0].iconImg;
                            return icon;
                        }
                    }
                    return icon;
                }
                isSingleMarketClosed(market) {
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
                                }
                                else {
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
                setUserBetConfig(data) {
                    this.localStorageHelper.set('user-betconfig', data);
                    this.betConfigPromise.resolve(data);
                }
                getUserBetConfig() {
                    var betConfig = this.localStorageHelper.get('user-betconfig');
                    if (betConfig) {
                        this.betConfigPromise.resolve(betConfig);
                    }
                    return this.$q.when(this.betConfigPromise.promise);
                }
                getBFEventTypeId(localId) {
                    var self = this;
                    var findID = ((id) => {
                        var bfEventTypeId = 0;
                        if (self.eventTypes.length > 0) {
                            self.eventTypes.forEach((e) => {
                                if (e.id == localId) {
                                    bfEventTypeId = e.sourceId;
                                }
                            });
                            return bfEventTypeId;
                        }
                    });
                    if (this.eventTypes) {
                        return findID(localId);
                    }
                    else {
                        this.$q.when(this.eventTypesPromise.promise).finally(() => {
                            return findID(localId);
                        });
                    }
                }
                handleOneClickBetResponse(model, promise) {
                    promise.success((response) => {
                        if (response.success) {
                            if (response.data) {
                                var bet = response.data;
                                if (bet.orderStatus) {
                                    if (bet.sizeRemaining > 0) {
                                        var matched = this.$filter('toRate')(bet.sizeMatched);
                                        var remaining = this.$filter('toRate')(bet.sizeRemaining);
                                        var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                        unMatchmsg = unMatchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, remaining, model.price);
                                        this.toasterService.showToastMessage(common.helpers.ToastType.Error, unMatchmsg, 5000);
                                    }
                                    else {
                                        var matched = this.$filter('toRate')(bet.sizeMatched);
                                        var placed = this.$filter('toRate')(model.size);
                                        var Matchmsg = this.$filter('translate')('bet.matched.message');
                                        Matchmsg = Matchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, placed, model.price, matched, bet.avgPrice);
                                        this.toasterService.showToastMessage(common.helpers.ToastType.Success, Matchmsg, 5000);
                                    }
                                    this.$rootScope.$broadcast('bet-submitted', { marketId: response.data.bet.marketId });
                                }
                                else {
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
                openScorePosition(marketid, showMe = true, ladder = [], isLadderReady = false) {
                    if (this.settings.ThemeName != 'sky' && this.settings.ThemeName != 'lotus') {
                        var modal = new common.helpers.CreateModal();
                        modal.data = marketid;
                        modal.header = 'user.position.modal.header';
                        modal.bodyUrl = this.settings.ThemeName + '/home/sport/my-position.html';
                        modal.controller = 'myPositionCtrl';
                        if (this.settings.ThemeName == 'dimd2') {
                            modal.options.showFooter = false;
                        }
                        else {
                            modal.size = 'sm';
                        }
                        modal.options.actionButton = '';
                        modal.SetModal();
                        this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                    }
                    else {
                        if (isLadderReady) {
                            if (showMe) {
                                var scope = this.$rootScope.$new(true);
                                scope.id = marketid;
                                scope.ladder = ladder;
                                var html = '<kt-position data-id="{{id}}" data-ladders="{{ladder}}"> </kt-position>';
                                angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                                angular.element(document.getElementById('tbody_' + marketid)).after(this.$compile(html)(scope));
                            }
                            else {
                                angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                            }
                        }
                        else {
                            if (showMe) {
                                var scope = this.$rootScope.$new(true);
                                scope.id = marketid;
                                var html = '<kt-position data-id="{{id}}"> </kt-position>';
                                angular.element(document.getElementById('tbody_' + marketid)).after(this.$compile(html)(scope));
                            }
                            else {
                                angular.element(document.getElementsByName('session_tbody_' + marketid)).remove();
                            }
                        }
                    }
                }
                openWebsiteRules() {
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
                openBFChart(ids) {
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
                ShowPromoBanners() {
                    var today = moment();
                    this.getSupportDetails()
                        .then((data) => {
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
                                        if (!detail.promoCanCancel)
                                            modal.options.closeButton = '';
                                        modal.SetModal();
                                        this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                                            if (result.button == common.services.ModalResult.OK) {
                                                if (result.data == null) {
                                                    if (detail.promoLink) {
                                                        window.open(detail.promoLink, '_blank');
                                                    }
                                                }
                                            }
                                        });
                                        ;
                                        this.localStorageHelper.set('promo_banner_' + this.settings.WebApp, today);
                                    }, 1000);
                                }
                            }
                        }
                    });
                }
                ShowAgentBanners(data, count) {
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
                            }
                            else {
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
                BetProcessStarted(marketId) {
                    if (!this.InProcessMarkets) {
                        this.InProcessMarkets = [];
                    }
                    if (this.InProcessMarkets.indexOf(marketId) == -1) {
                        this.InProcessMarkets.push(marketId);
                    }
                }
                BetInProcess(marketId) {
                    if (this.InProcessMarkets) {
                        var index = this.InProcessMarkets.indexOf(marketId);
                        if (index > -1) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                BetProcessComplete(marketId) {
                    if (this.InProcessMarkets) {
                        var index = this.InProcessMarkets.indexOf(marketId);
                        if (index > -1) {
                            this.InProcessMarkets.splice(index, 1);
                        }
                    }
                }
                downloadClientAPK() {
                    var path = this.settings.ApiBaseUrl + this.settings.APKPath + '.apk';
                    this.fileService.downloadByPath(path);
                }
                downloadMasterAPK() {
                    var path = this.settings.ApiBaseUrl + this.settings.APKPath + '_master.apk';
                    this.fileService.downloadByPath(path);
                }
                exportToExcel(promise) {
                    promise.success((response, status, headers) => {
                        var contentType = headers("content-type");
                        var contentDisposition = headers('Content-Disposition');
                        var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
                        if (contentType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && filename) {
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
                setBetModelForUpdate(detail, bet) {
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
                    };
                }
                clearBetModel() {
                    this.updateBetModel = null;
                }
                getOpenBets() { return this.openBets; }
                setOpenBets(data) {
                    if (data && data.length > 0) {
                        this.openBets.splice(0);
                        data.forEach((d) => {
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
                clearStorage() {
                    var existing_resolution = this.localStorageHelper.get(this.settings.DeviceType);
                    var betconfimation = this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet');
                    var alphasessionladder = this.localStorageHelper.get(this.settings.ThemeName + '_alphasessionladder');
                    var remember = this.localStorageHelper.get('remember_' + this.settings.WebApp);
                    var promo_banner = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
                    var last_LoginMethod = this.localStorageHelper.get('loginmethod_' + this.settings.WebApp);
                    this.openBets = [];
                    this.userPLs = [];
                    this.eventTypes.splice(0);
                    this.localStorageHelper.clearAll();
                    this.localCacheHelper.destroy();
                    if (existing_resolution) {
                        this.localStorageHelper.set(this.settings.DeviceType, existing_resolution);
                    }
                    if (betconfimation != undefined) {
                        this.localStorageHelper.set(this.settings.ThemeName + '_confirmbet', betconfimation);
                    }
                    if (alphasessionladder != undefined) {
                        this.localStorageHelper.set(this.settings.ThemeName + '_alphasessionladder', alphasessionladder);
                    }
                    if (remember) {
                        this.localStorageHelper.set('remember_' + this.settings.WebApp, remember);
                    }
                    if (promo_banner) {
                        this.localStorageHelper.set('agent_banner_' + this.settings.WebApp, promo_banner);
                    }
                    if (last_LoginMethod > 0) {
                        this.localStorageHelper.set('loginmethod_' + this.settings.WebApp, last_LoginMethod);
                    }
                }
                viewCards(m) {
                    var modal = new common.helpers.CreateModal();
                    var winnerName, game_string;
                    var marketRunner = [], extraWinnerList = [];
                    if (m.gameString) {
                        game_string = JSON.parse(m.gameString);
                    }
                    if (!m.marketRunner) {
                        marketRunner = m.winners;
                    }
                    else {
                        marketRunner = m.marketRunner.filter((mr) => { if (mr.status == common.enums.RunnerStatus.WINNER) {
                            return mr;
                        } });
                    }
                    if (marketRunner.length > 0) {
                        if (m.gameType == common.enums.GameType.PattiODI || m.gameType == common.enums.GameType.PokerODI) {
                            var found = marketRunner.filter((mr) => { return mr.status == common.enums.RunnerStatus.WINNER; });
                            if (found.length > 0) {
                                winnerName = found[0].runner.name;
                            }
                        }
                        else if (m.gameType == common.enums.GameType.Patti2 || m.gameType == common.enums.GameType.Patti3 || m.gameType == common.enums.GameType.PokerT20) {
                            var wtext = JSON.parse(marketRunner[0].winner)[0].name;
                            angular.forEach(game_string, (g) => {
                                if (g.runner == wtext) {
                                    g.winners = marketRunner.map((r) => { return r.runner.name; }).join(', ');
                                }
                            });
                        }
                        else if (m.gameType == common.enums.GameType.Card32) {
                            angular.forEach(marketRunner, (mr, index) => {
                                if (index == 0) {
                                    winnerName = mr.runner.name;
                                }
                                else {
                                    var wasSettled = false;
                                    angular.forEach(game_string, (g) => {
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
                            angular.forEach(marketRunner, (mr, index) => {
                                if (index == 0) {
                                    winnerName = JSON.parse(mr.winner)[0].name;
                                }
                                else {
                                    if (mr.winner)
                                        extraWinnerList.push({ runner: mr.runner.name + ' - ' + JSON.parse(mr.winner)[0].name });
                                }
                            });
                        }
                        else if (m.gameType == common.enums.GameType.AndarBahar || m.gameType == common.enums.GameType.Poker) {
                            var wtext = marketRunner[0].runner.name;
                            angular.forEach(game_string, (g) => {
                                if (g.runner == wtext) {
                                    g.winners = ['Winner'];
                                    g.winners.push(marketRunner.filter((mr) => { return mr.runner.name != wtext; }).map((r) => { return r.runner.name; }));
                                    g.winners = g.winners.join(', ');
                                }
                            });
                        }
                        else if (m.gameType == common.enums.GameType.Up7Down) {
                            game_string[0].winners = [];
                            angular.forEach(marketRunner, (mr) => {
                                game_string[0].winners.push(JSON.parse(mr.winner)[0].name);
                            });
                            game_string[0].winners = game_string[0].winners.join(', ');
                        }
                        else if (m.gameType == common.enums.GameType.DragonTiger) {
                            var wtext = marketRunner[0].runner.name;
                            angular.forEach(game_string, (g) => {
                                if (g.runner == wtext) {
                                    g.winners = [];
                                    angular.forEach(marketRunner, (mr, rindex) => {
                                        if (rindex > 0) {
                                            g.winners.push(JSON.parse(mr.winner)[0].name);
                                        }
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
                    var msg = this.$filter('translate')('admin.runner.status.modal.header');
                    msg = msg.format('"' + marketname + ' # ' + m.roundId + '"');
                    modal.header = msg;
                    modal.bodyUrl = this.settings.ThemeName + (this.settings.IsFaaS ? '/home/view-cards-modal.html' : '/master/view-cards-modal.html');
                    modal.controller = 'viewCardsModalCtrl';
                    modal.options.actionButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
                openRadarView(marketid) {
                    var url = this.$state.href('rdview', { marketid: marketid });
                    var w = screen.width - 150, h = 680;
                    var left = (screen.width / 2) - (w / 2);
                    var top = 50;
                    this.$window.open(this.$sce.trustAsUrl(url), "Radar View", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
                }
                formatLiveGameResult(marketRunner, gameType = null) {
                    var winnerString = '';
                    var winnerMeta;
                    marketRunner.forEach((mr, index) => {
                        if (gameType == common.enums.GameType.Up7Down) {
                            mr.winnerObj = JSON.parse(mr.winner);
                            if (mr.winnerObj.length > 0) {
                                if (index == (marketRunner.length - 3)) {
                                    winnerString = mr.winnerObj[0].name[0];
                                }
                                if (index == (marketRunner.length - 1)) {
                                    if (mr.winnerObj[0].id > 7) {
                                        winnerString = "U" + '-' + winnerString;
                                    }
                                    else if (mr.winnerObj[0].id < 7) {
                                        winnerString = "D" + '-' + winnerString;
                                    }
                                    else if (mr.winnerObj[0].id == 7) {
                                        winnerString = "7" + '-' + winnerString;
                                    }
                                }
                            }
                        }
                        else if (gameType == common.enums.GameType.DragonTiger) {
                            if (index == 0) {
                                winnerString = mr.runner.name[0];
                            }
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
                            }
                            else {
                                var splt = common.helpers.Utility.getAllFirstChar(mr.runner.name);
                                winnerString = winnerString + '-' + splt;
                            }
                        }
                        else if (mr.winner) {
                            mr.winnerObj = JSON.parse(mr.winner);
                            if (index == 0 && mr.winnerObj[0]) {
                                winnerMeta = mr.winner;
                                mr.winnerObj.forEach((w) => {
                                    if (w.name.indexOf(' ') < 0) {
                                        winnerString = winnerString + w.name.substr(0, 1);
                                    }
                                    else {
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
                liveGamesMessgae(announcement) {
                    return announcement;
                }
                setUserPL(data) {
                    this.userPLs = data;
                }
                setPLInOddsMarket(marketId, runner) {
                    var found = this.userPLs.filter((u) => { return u.marketId == marketId && u.runnerId == runner.runner.id; });
                    if (found.length > 0) {
                        runner.pl = this.$filter('toRateOnly')(found[0].pl);
                        runner.stake = this.$filter('toRateOnly')(found[0].stake);
                    }
                    else {
                        runner.pl = 0;
                        runner.stake = 0;
                    }
                }
                setPLInOddsMarketFromBets(marketId, runner, metaname) {
                    this.openBets.forEach((op) => {
                        if (op.marketId == marketId) {
                            op.grpBets.forEach((g) => {
                                if (g.runnerId == runner.runner.id) {
                                    if (runner.metadata && runner.metadata[metaname]) {
                                        runner.metadata[metaname].forEach((d) => {
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
                setPLInFancyMarket(marketId) {
                    var result = undefined;
                    var found = this.userPLs.filter((u) => { return u.marketId == marketId; });
                    if (found.length > 0) {
                        result = this.$filter('toRateOnly')(found[0].pl);
                    }
                    return result;
                }
                setLMTScript() {
                    var self = this;
                    var newScript = document.createElement("script");
                    newScript.src = "https://widgets.sir.sportradar.com/uscommon/widgetloader";
                    newScript.async = true;
                    newScript.setAttribute('n', 'SIR');
                    newScript.onload = function () {
                        self.isLMTloaded = true;
                        self.lmtPromise.resolve(self.isLMTloaded);
                    };
                    document.head.appendChild(newScript);
                }
                getLMTscriptStatus() {
                    if (this.lmtPromise.promise.$$state.status != 0) {
                        this.lmtPromise = this.$q.defer();
                    }
                    if (this.isLMTloaded) {
                        this.lmtPromise.resolve(this.isLMTloaded);
                    }
                    return this.$q.when(this.lmtPromise.promise);
                }
                setWinnerBySection(market) {
                    if (market.gameType == common.enums.GameType.Up7Down) {
                        angular.forEach(market.marketRunner, (mr, rindex) => {
                            if (mr.winner) {
                                var wnr = JSON.parse(mr.winner);
                                angular.forEach(wnr, (w) => {
                                    mr.metadata.up7down.forEach((m) => {
                                        if (m.id == w.id) {
                                            m.status = common.enums.RunnerStatus.WINNER;
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.DragonTiger) {
                        angular.forEach(market.marketRunner, (mr, rindex) => {
                            if (mr.winner) {
                                var wnr = JSON.parse(mr.winner);
                                angular.forEach(wnr, (w) => {
                                    mr.metadata.dragonTiger.forEach((m) => {
                                        if (m.id == w.id) {
                                            m.status = common.enums.RunnerStatus.WINNER;
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.Patti2 || market.gameType == common.enums.GameType.Patti3) {
                        angular.forEach(market.marketRunner, (mr, rindex) => {
                            if (mr.winner && mr.winner.length > 0) {
                                var wnr = JSON.parse(mr.winner);
                                angular.forEach(wnr, (w) => {
                                    market.pattiRunner.forEach((pr) => { if (pr.name == w.name) {
                                        pr.status = common.enums.RunnerStatus.WINNER;
                                    } });
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.Card32) {
                        angular.forEach(market.marketRunner, (mr, rindex) => {
                            if (mr.winner && mr.winner.length > 0) {
                                var wnr = JSON.parse(mr.winner);
                                angular.forEach(wnr, (w) => {
                                    if (mr.metadata && mr.metadata.card32)
                                        mr.metadata.card32.forEach((pr) => { if (pr.name == w.name) {
                                            pr.status = common.enums.RunnerStatus.WINNER;
                                        } });
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.ClashOfKings) {
                        angular.forEach(market.marketRunner, (mr, rindex) => {
                            if (mr.winner && mr.winner.length > 0) {
                                var wnr = JSON.parse(mr.winner);
                                angular.forEach(wnr, (w) => {
                                    if (mr.metadata && mr.metadata.clashOfKing)
                                        mr.metadata.clashOfKing.forEach((pr) => { if (pr.name == w.name) {
                                            pr.status = common.enums.RunnerStatus.WINNER;
                                        } });
                                });
                            }
                        });
                    }
                }
                showReceiptModal(scope, imgBase64, forQR = false) {
                    var defer = this.$q.defer();
                    var path = this.settings.ThemeName + '/template/receipt-modal.html';
                    var tscope = scope.$new(true);
                    tscope.title = this.settings.Title;
                    if (forQR) {
                        tscope.receiptImgBase64 = encodeURIComponent(imgBase64);
                        tscope.upiString = imgBase64;
                        tscope.forQR = forQR;
                    }
                    else {
                        tscope.receiptImgBase64 = imgBase64;
                    }
                    tscope.closeMe = () => {
                        jQuery('#cus-placeholder').html('');
                        defer.resolve();
                    };
                    this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template) => {
                        this.$compile($("#cus-placeholder").html(template).contents())(tscope);
                    });
                    return defer.promise;
                }
                showLotusFooterMsg(scope, index) {
                    var defer = this.$q.defer();
                    var path = this.settings.ThemeName + '/template/';
                    if (index == 0) {
                        path = path + 'under-age.html';
                    }
                    else if (index == 1) {
                        path = path + 'kyc.html';
                    }
                    else if (index == 2) {
                        path = path + 'restricted-territories.html';
                    }
                    else if (index == 3) {
                        path = path + 'responsible-gambling.html';
                    }
                    else if (index == 4) {
                        path = path + 'exclusion-policy.html';
                    }
                    else if (index == 5) {
                        path = path + 'admin-terms.html';
                    }
                    else if (index == 6) {
                        path = path + 'admin-multi-account.html';
                    }
                    else if (index == 7) {
                        path = path + 'confirm-age.html';
                    }
                    else if (index == 11) {
                        path = path + 'deposit-terms.html';
                    }
                    var tscope = scope.$new(true);
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
                    this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template) => {
                        this.$compile($("#cus-placeholder").html(template).contents())(tscope);
                    });
                    return defer.promise;
                }
                getLoggedInUserData() {
                    var result = this.localStorageHelper.get(this.settings.UserData);
                    if (result) {
                        return result.user;
                    }
                    return null;
                }
                isOBD() {
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
                isCPLogin() {
                    var user = this.getLoggedInUserData();
                    if (user) {
                        if (user.cpUserType == common.enums.UserType.CP) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                getLoggedInUserCurrency() {
                    var result = this.localStorageHelper.get(this.settings.UserData);
                    if (result) {
                        return result.currency;
                    }
                    return null;
                }
                setHorseMetadata(market) {
                    if (market) {
                        angular.forEach(market.marketRunner, (mr) => {
                            if (mr.runner.runnerMetadata) {
                                mr.runner.meta = JSON.parse(mr.runner.runnerMetadata);
                            }
                        });
                    }
                }
                storeDateFilter(search, key) {
                    this.localStorageHelper.set(key + '-from', search.fromdate);
                    this.localStorageHelper.set(key + '-to', search.todate);
                }
                getDateFilter(search, key) {
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
                setShareData(obj) {
                    this.localCacheHelper.put('share-data-', obj);
                }
                getShareData() {
                    return this.localCacheHelper.get('share-data-');
                }
                startIdleTimer() {
                    ifvisible.setIdleDuration(this.settings.IdleTime);
                }
                checkIdle() {
                    var defer = this.$q.defer();
                    var user = this.getLoggedInUserData();
                    if (user && user.userType == common.enums.UserType.Player) {
                        this.showIdlePopup(defer);
                    }
                    else {
                        defer.resolve();
                    }
                    return defer.promise;
                }
                userWakeup() {
                    var user = this.getLoggedInUserData();
                    if (user) {
                        this.WSSocketService.connetWs();
                        this.WSFairTradeSocketService.connetWs();
                        var response = { success: true };
                        this.$rootScope.$emit("ws-balance-changed", response);
                    }
                }
                showIdlePopup(defer) {
                    var path = this.settings.ThemeName + '/template/idle-modal.html';
                    var tscope = this.$rootScope.$new(true);
                    tscope.renew = () => {
                        defer.resolve();
                        jQuery('#cus-placeholder').html('');
                    };
                    this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template) => {
                        this.$compile($("#cus-placeholder").html(template).contents())(tscope);
                    });
                }
                otherLoginMessage(data) {
                    var user = this.getLoggedInUserData();
                    if (user && user.userType) {
                        var path = this.settings.ThemeName + '/template/other-login-modal.html';
                        var tscope = this.$rootScope.$new(true);
                        tscope.key = data;
                        tscope.renew = () => {
                            this.logout();
                            jQuery('#cus-placeholder').html('');
                        };
                        this.$templateRequest(this.$sce.getTrustedResourceUrl(path)).then((template) => {
                            this.$compile($("#cus-placeholder").html(template).contents())(tscope);
                        });
                        this.$timeout(() => { tscope.renew(); }, 5000);
                    }
                }
                validatePassword(pw, showToast = false) {
                    var alpLen = (pw.match(new RegExp("[a-zA-Z]", "g")) || []).length > 0;
                    var numLen = (pw.match(new RegExp("[0-9]", "g")) || []).length > 0;
                    if (alpLen != true || numLen != true || pw.length < 6) {
                        if (showToast)
                            this.toasterService.showToastMessage(common.helpers.ToastType.Info, 'Password must be 6 character long, must contain alphabetics and numbers', 5000);
                        return false;
                    }
                    return true;
                }
                logout(wait = 0, redirect = true) {
                    this.clearStorage();
                    this.WSSocketService.closeWs();
                    this.WSFairTradeSocketService.closeWs();
                    this.$http.get(this.settings.ApiBaseUrl + "authenticate/logout");
                    if (wait > 0) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'You will be logout in ' + wait + ' seconds.', 3000);
                    }
                    if (redirect) {
                        if (this.isChatInitiated()) {
                            fcWidget.destroy();
                        }
                        this.$timeout(() => {
                            if (this.isMobile.any) {
                                if (this.settings.IsMobileSeperate) {
                                    window.location.href = this.settings.MobileUrl;
                                }
                                else {
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
                setExposurePTOption(value) {
                    this.localStorageHelper.set('master-pt-option', value);
                }
                getExposurePTOption() {
                    var result = this.localStorageHelper.get('master-pt-option');
                    if (result) {
                        return result.toString();
                    }
                    else
                        return 'true';
                }
                setBackground() {
                    if (this.settings.WebSiteIdealFor <= 2) {
                        document.body.setAttribute('class', 'cbg');
                        this.$rootScope.viewPort = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no";
                    }
                    else {
                        document.body.setAttribute('class', 'mbg');
                        this.$rootScope.viewPort = "";
                    }
                    if (this.settings.WebApp == 'gameok' || this.settings.WebApp == 'gameokin') {
                        jQuery('body').addClass('dark-mode');
                    }
                }
                addGaminIcon() {
                    var newScript = document.createElement("script");
                    newScript.src = "https://c6acff7c-c068-418f-8325-fe65b172131a.curacao-egaming.com/ceg-seal.js";
                    document.head.appendChild(newScript);
                    newScript.onload = function () {
                        var newinlineScript = document.createElement("script");
                        var inlineScript = document.createTextNode("ceg_c6acff7c_c068_418f_8325_fe65b172131a.init();");
                        newinlineScript.appendChild(inlineScript);
                        document.head.appendChild(newinlineScript);
                    };
                }
                isChatInitiated() {
                    return (typeof fcWidget != "undefined" && fcWidget.isInitialized() == true);
                }
                openChatWindow() {
                    if (this.isChatInitiated()) {
                        fcWidget.show();
                        fcWidget.open();
                    }
                }
                isChatActive() {
                    var data = this.localStorageHelper.get(this.settings.UserData);
                    return data && data.parent && data.parent.isChatEnabled;
                }
                initFreshchat(hidechat = true) {
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
                                var status = resp && resp.status;
                                if (status !== 200) {
                                    fcWidget.user.setProperties({
                                        firstName: data.user.username,
                                    });
                                    fcWidget.on('user:created', function (resp) {
                                        var status = resp && resp.status, udata = resp && resp.data;
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
                        };
                        document.head.appendChild(newScript);
                    }
                }
                setGameId(tableId) { this.tableId = tableId; }
                getGameId() { return this.tableId; }
                copyText(txt) {
                    var input = document.createElement("textarea");
                    input.value = txt;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand("Copy");
                    input.remove();
                }
            }
            services.CommonDataService = CommonDataService;
            angular.module('intranet.common.services').service('commonDataService', CommonDataService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CommonDataService.js.map