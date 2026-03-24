namespace intranet.common.messaging {
    export interface IResponse<TData> {
        success: boolean;
        data: TData;
        messages: IResponseMessage[];
        isHohrResponse: boolean;
    }
}