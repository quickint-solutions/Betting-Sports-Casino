namespace intranet.common.directives {
    export interface IKTMessagesScope extends common.IScopeBase {
        messages: messaging.ResponseMessage[];
        hasMessages(): boolean;
        hasSuccessMessages(): boolean;
        hasInfoMessages(): boolean;
        hasWarningMessages(): boolean;
        hasValidationMessages(): boolean;
        hasErrorMessages(): boolean;
        hasConfirmMessages(): boolean;

        themeName: any;
    }
}