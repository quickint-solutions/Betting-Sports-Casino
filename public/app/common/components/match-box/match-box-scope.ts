namespace intranet.common.directives {
    export interface IKTMatchBoxScope extends common.IScopeBase {
        item: MatchDetail;
        refreshFunction: any;
    }

    export class MatchDetail {
        series: { name: string };
        currentInning: ScoreDetail;
        home: TeamDetail;
        away: TeamDetail;

        ground: string;
        venueCity: string;
        venueCountry: string;

        matchStatus: number;
        matchType: any;
        matchNumber: string;

        startTime: any;
        status: string;
    }

    export class TeamDetail {
        name: string;
        innings: ScoreDetail[];
    }

    export class ScoreDetail {
        runs: number;
        wicket: number;
        over: number;
        runRate: number;
    }
}