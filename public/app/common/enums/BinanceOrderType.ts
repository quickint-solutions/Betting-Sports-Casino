
module intranet.common.enums {
    export enum ContractType {

        // Summary:
        //     Limit orders will be placed at a specific price. If the price isn't available
        //     in the order book for that asset the order will be added in the order book for
        //     someone to fill.
        Limit = 0,
        //
        // Summary:
        //     Market order will be placed without a price. The order will be executed at the
        //     best price available at that time in the order book.
        Market = 1,
        //
        // Summary:
        //     Stop loss order. Will execute a market order when the price drops below a price
        //     to sell and therefor limit the loss
        StopLoss = 2,
        //
        // Summary:
        //     Stop loss order. Will execute a limit order when the price drops below a price
        //     to sell and therefor limit the loss
        StopLossLimit = 3,

        // Below 3 type May be used in TP/SL order
        //
        // Summary:
        //     Stop loss order. Will be executed at the best price available at that time in
        //     the order book
        StopMarket = 5,
        //
        // Summary:
        //     Take profit order. Will be executed at the best price available at that time
        //     in the order book
        TakeProfitMarket = 7,
        //
        // Summary:
        //     Take profit order. Will execute a limit order when the price rises above a price
        //     to sell and therefor take a profit
        TakeProfitLimit = 8,

        //
        // Summary:
        //     Trailing stop order will be placed without a price. The order will be executed
        //     at the best price available at that time in the order book.
        TrailingStopMarket = 10,

        PostOnly = 11,
    }
}