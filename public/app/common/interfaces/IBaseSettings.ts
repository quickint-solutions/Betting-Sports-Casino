namespace intranet.common {
    export interface IBaseSettings {
        ApiBaseUrl: string;
        TokenStorageKey: string;
        AuthTokenStorageKey: string;
        ServerTokenName: string;
        ServerAuthTokenName: string;
        ClaimsStorageKey: string;
        ThemeName: string;
        Title: string;
        StakeConfig: string;
        OneClickConfig: string;
        MultiMarketPin: string;
        SportTreeHeader: string;
        UserData: string;
        CricketId: any;
        SoccerId: any;
        TennisId: any;
        HorseRacingId: any;
        GreyhoundId: any;
        SoccerBfId: number;
        TennisBfId: number;
        CricketBfId: number;
        LiveGamesId: any;
        VirtualGameId: any;
        BinaryId: any;
        DeviceType: string;
        ImagePath: string;
        CSRFKey: string;
        BookMarketPin: string;
        ShownOneClickWarning: string;
        CurrencyRate: number;
        CurrencyCode: string;
        CurrencyFraction: string;
        VertexUser: string;
        HasAPK: boolean;
        APKPath: string;
        WebApp: string;
        ThemeColor: string;
        IsBetfairLabel: boolean;
        IsFaaS: boolean;
        FaasAccessLevel: number;
        IsCRDRFaas: boolean;

        WSUrl: string;
        WSFTUrl: string;

        CurrentUserType: any;
        IsLMTAvailable: boolean;
        PublishName: string;
        Maintenance_Obj: string;
        IdleTime: any;
        WebSiteIdealFor:any;
        StorageMode: any;
        IsFirstLogin: any;

        FairXIFrameUrl: string;
        FairXGameListUrl: string;

        IsMobileSeperate: boolean;
        MobileUrl: string;
    }
}