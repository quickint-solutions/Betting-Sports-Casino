module intranet.common.enums {
    export enum MarketStatus {
        /// <summary>
        ///The market has been created but isn't yet available.
        /// </summary>
        INACTIVE = 1,
        /// <summary>
        ///The market is open for betting.
        /// </summary>
        OPEN = 2,
        /// <summary>
        ///The market is suspended and not available for betting.
        /// </summary>
        SUSPENDED = 3,
        ///<summary>
        ///The market has been settled and is no longer available for betting.
        ///</summary>
        CLOSED = 4
    }
}