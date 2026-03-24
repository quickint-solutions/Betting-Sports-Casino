module intranet.common.enums {
    export enum WSMessageType {
        Auth = 1,
        BetSize = 2,
        Score = 3,
        MarketCount = 4,
        Announcement = 5,
        MasterAnnouncement = 6,
        SubscribeMarket = 7,
        OddsChanged = 8,
        Ping = 9,
        Error = 10,
        Close = 11,
        Balance = 12,
        OtherLogin = 13,

        DepositRequest = 14,
        WithdrawalRequest = 15,
        DepositRequestConfirm = 16,
        WithdrawalRequestConfirm = 17,


        ListSocket = 100,

        //TradeFair
        SymbolTickPrice = 101,
        SymbolDepth = 102,
        SymbolTrade = 103,
        SymbolKLine = 104,
        SymbolMark = 105,

        SubscribeSymbol = 107,
        SubscribeSymbolDepth = 108,
    }
}