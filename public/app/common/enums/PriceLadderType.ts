module intranet.common.enums {

    export enum PriceLadderType {
        /// <summary>
        /// Price ladder increments traditionally used for Odds Markets.
        /// </summary>
        Classic = 1,
        /// <summary>
        /// Price ladder with the finest available increment, traditionally used for 
        ///Asian Handicap markets.
        /// </summary>
        Finest = 2,
        /// <summary>
        /// Price ladder used for LINE markets. Refer to MarketLineRangeInfo for more details.
        /// </summary>
        Line_Range = 3,
        Fixed_Number = 4,
    }
}
