namespace intranet.common.messaging {
    export enum ResponseMessageType {
        Success = 0,
        Info = 1,
        Warning = 2,
        Validation = 4,
        Error = 8,
        Confirmation = 16,
        Unauthorized = 401
    }
}