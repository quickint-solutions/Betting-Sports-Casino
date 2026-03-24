namespace intranet.common {
    export interface IScopeBase extends ng.IScope {
        ctrl: any;
        editMode: boolean;
        messages: common.messaging.ResponseMessage[];
        $$destroyed: any;
    }
}