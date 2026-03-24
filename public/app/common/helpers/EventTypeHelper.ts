namespace intranet.common.helpers {

    export class EventTypeHelper {
        static icons: any[] = [];
        static fillIconClass(): void {
            this.icons.push({ id: 1, class: 'ico-soccer' });
            this.icons.push({ id: 2, class: 'ico-tennis' });
            this.icons.push({ id: 4, class: 'ico-cricket' });
        }

        static setIcons(eventTypes: any[], gameid: any[], raceid: any[], binaryid: any[] = []): any {
            this.fillIconClass();
            eventTypes.forEach((e: any) => {
                var index = common.helpers.Utility.IndexOfObject(this.icons, 'id', e.id);
                if (index > -1) {
                    e.iconClass = this.icons[index].class;
                } else {
                    e.iconClass = 'ico-common';
                }

                e.isLiveGame = gameid.indexOf(e.id) >= 0;
                e.isRace = raceid.indexOf(e.id) >= 0;
                e.isBinary = binaryid.indexOf(e.id) >= 0;
            });
            return eventTypes;
        }
    }

}