namespace intranet.common.messaging {
    export class ResponseMessage implements IResponseMessage {
        responseMessageType: ResponseMessageType;
        text: string;
        propertyPath: string;

        constructor(type: ResponseMessageType, txt: string, propPath: string) {
            this.responseMessageType = type;
            this.text = txt;
            this.propertyPath = propPath;
        }
    }
}