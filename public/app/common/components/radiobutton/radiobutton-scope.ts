namespace intranet.common.directives {
    export interface IKTRadiobuttonScope
        extends common.IScopeBase {
        // attributes
        notifyOnUpdate: (id:any) => boolean;
        optionlist: { id: any; name: string; }[];
        paramName: string;
        charLimit: number;
        item: any;
        disableBy: any;
        updateValue: boolean;
        disableNow: string;
        tabIndex: number;
    }
}