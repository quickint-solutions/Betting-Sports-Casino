namespace intranet.common.messaging {
    export interface IResponseMessage {
        responseMessageType: ResponseMessageType;
        text: string;
        propertyPath: string;
    }
}