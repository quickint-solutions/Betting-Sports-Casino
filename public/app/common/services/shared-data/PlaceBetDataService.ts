namespace intranet.common.services {
    export class PlaceBetDataService {
        backData: [{ name: string, id: any, inPlay: boolean, eventData: any[] }];
        layData: [{ name: string, id: any, inPlay: boolean, eventData: any[] }];

        pplData: any;

        constructor() {
        }

        public hasSharedData(side: any): boolean {
            if ((side == 1 && this.backData) || (this.layData && side == 2)) {
                return true;
            }
            else {
                return false;
            }
        }

        public clearSharedData(): void {
            this.backData = null;
            this.layData = null;
        }

        public getSharedData(): any {
            return { backData: this.backData, layData: this.layData };;
        }

        private validateData(sharedData: any, c: any): any {
            var processed = false;
            for (var i = 0; i < sharedData.length; i++) {
                var index: number = -1;
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
                    if (sharedData[i].eventData.length == 0) { sharedData[i].eventData = []; }
                    sharedData[i].eventData.push(c);
                    processed = true;
                    break;
                }
            }
            if (!processed) { sharedData.push({ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] }); }
            return sharedData;
        }

        public setSharedData(c: any): void {
            if (c.side == 1) {
                if (this.hasSharedData(1)) {
                    this.backData = this.validateData(this.backData, c);
                } else {
                    this.backData = [{ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] }];
                }
            }
            else if (c.side == 2) {
                if (this.hasSharedData(2)) {
                    this.layData = this.validateData(this.layData, c);
                } else {
                    this.layData = [{ name: c.eventName, id: c.eventId, inPlay: c.inPlay, eventData: [c] }];
                }
            }
        }


        public setPPLdata(data: any): void { this.pplData = data; }

        public getPPLdata(): any { return this.pplData; }

        public pushPPL(item: any): void {
            if (!this.pplData) { this.pplData = {}; }
            if (!this.pplData.bets) { this.pplData = { bets: [] }; }
            this.pplData.bets.splice(0);
            if (item) { this.pplData.bets.push(item); }
        }

        public ignoreConfirmation(themename: any): boolean {
            return (themename == 'sports' || themename == 'sky' || themename == 'bking' || themename == 'dimd' || themename == 'betfair' || themename == 'dimd2');
        }

        public hasAnyBetByMarket(marketId: any): boolean {
            var marketBetFound: boolean = false;
            if (this.backData) {
                this.backData.forEach((b: any) => {
                    if (!marketBetFound)
                        marketBetFound = b.eventData.some((m: any) => { return m.marketId == marketId; });
                });
            }
            if (!marketBetFound && this.layData) {
                this.layData.forEach((b: any) => {
                    if (!marketBetFound)
                        marketBetFound = b.eventData.some((m: any) => { return m.marketId == marketId; });
                });
            }
            return marketBetFound;
        }
    }

    angular.module('intranet.common.services').service('placeBetDataService', PlaceBetDataService);
}