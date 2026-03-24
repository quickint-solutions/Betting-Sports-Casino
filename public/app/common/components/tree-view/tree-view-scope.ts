module intranet.common.directives {
    export interface IKTTreeViewScope extends common.IScopeBase {
        list: any[];
        intialData: any;
        treeService: any;
        intialDataService: any;
        intialDataLoaded: any;
        searchService: any;
        serachText: string;
        searchRequired: boolean;
        actionTitle: string;
        actionCallback: any;
        treeName: string;
    }
}