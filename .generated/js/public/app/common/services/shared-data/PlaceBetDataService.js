var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class PlaceBetDataService {
                constructor() {
                }
                hasSharedData(side) {
                    if ((side == 1 && this.backData) || (this.layData && side == 2)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                clearSharedData() {
                    this.backData = null;
                    this.layData = null;
                }
                getSharedData() {
                    return { backData: this.backData, layData: this.layData };
                    ;
                }
                validateData(sharedData, c) {
                    var processed = false;
                    for (var i = 0; i < sharedData.length; i++) {
                        var index = -1;
                        var eventMatched = false;
                        if (sharedData[i].id == c.eventId) {
                            for (var j = 0; j < sharedData[i].eventData.length; j++) {
                                eventMatched = true;
                                if (sharedData[i].eventData[j].gameType == common.enums.GameType.Up7Down || sharedData[i].eventData[j].gameType == common.enums.GameType.DragonTiger) {
                                    if (sharedData[i].eventData[j].marketId == c.marketId
                                        && sharedData[i].eventData[j].runnerId == c.runnerId
                                        && sharedData[i].eventData[j].sectionId == c.sectionId) {
                                        index = j;
                                        break;
                                    }
                                }
                                else {
                                    if (sharedData[i].eventData[j].marketId == c.marketId && sharedData[i].eventData[j].runnerId == c.runnerId) {
                                        index = j;
                                        break;
                                    }
                                }
                            }
                        }
                        if (index > -1) {
                            sharedData[i].eventData.splice(index, 1);
                            if (sharedData[i].eventData.length == 0) {
                                sharedData.splice(i, 1);
                            }
                            processed = true;
                            break;
                        }
                        else if (eventMatched) {
                            if (sharedData[i].eventData.length == 0) {
                                sharedData[i].eventData = [];
                            }
                            sharedData[i].eventData.push(c);
                            processed = true;
                            break;
                        }
                    }
                    if (!processed) {
                        sharedData.push({ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] });
                    }
                    return sharedData;
                }
                setSharedData(c) {
                    if (c.side == 1) {
                        if (this.hasSharedData(1)) {
                            this.backData = this.validateData(this.backData, c);
                        }
                        else {
                            this.backData = [{ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] }];
                        }
                    }
                    else if (c.side == 2) {
                        if (this.hasSharedData(2)) {
                            this.layData = this.validateData(this.layData, c);
                        }
                        else {
                            this.layData = [{ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] }];
                        }
                    }
                }
                setPPLdata(data) { this.pplData = data; }
                getPPLdata() { return this.pplData; }
                pushPPL(item) {
                    if (!this.pplData) {
                        this.pplData = {};
                    }
                    if (!this.pplData.bets) {
                        this.pplData = { bets: [] };
                    }
                    this.pplData.bets.splice(0);
                    if (item) {
                        this.pplData.bets.push(item);
                    }
                }
                ignoreConfirmation(themename) {
                    return (themename == 'sports' || themename == 'sky' || themename == 'bking' || themename == 'dimd' || themename == 'betfair' || themename == 'dimd2');
                }
                hasAnyBetByMarket(marketId) {
                    var marketBetFound = false;
                    if (this.backData) {
                        this.backData.forEach((b) => {
                            if (!marketBetFound)
                                marketBetFound = b.eventData.some((m) => { return m.marketId == marketId; });
                        });
                    }
                    if (!marketBetFound && this.layData) {
                        this.layData.forEach((b) => {
                            if (!marketBetFound)
                                marketBetFound = b.eventData.some((m) => { return m.marketId == marketId; });
                        });
                    }
                    return marketBetFound;
                }
            }
            services.PlaceBetDataService = PlaceBetDataService;
            angular.module('intranet.common.services').service('placeBetDataService', PlaceBetDataService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PlaceBetDataService.js.map