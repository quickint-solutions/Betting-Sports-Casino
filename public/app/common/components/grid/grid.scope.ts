namespace intranet.common.directives {
    export interface IKTGrid extends intranet.common.IScopeBase {
        tableParams: any;
        paginationUrl: string;
        noPaginationUrl: string;
        gridHeader: string;
        loadItems: any;
        exportToExcel: any;
        selfExport: any;
        preDelete: any;
        selectedItem: any;
        itemToSelect: any;
        changeSelection: (item) => void;
        goToDetail: (item: any, dontAutoscroll: boolean) => void;
        state: string;
        removeItems: any;
        defaultItem: any;
        selectFirstLine: string;//return string instead of boolean because of usage attribute (@)
        detailState: string;
        newState: string;
        defaultState: string;
        nameParam: string;
        nameValueProperty: string;
        maxItems: any;
        defaultFilter: {};
        listNewItems: any[];
        total: any;
        page: any;
        pageSize: any;
        message: string;
        canILoad: boolean;
        exportSupported: boolean;
        exportToPdf: any;
        clickCopy: () => void;
        clickExportToPdf: () => void;
        exportParams: any;
        autoscroll: boolean;
        newButtonLabelProperty: string;
        id: string;
        isHideTotal: boolean;
        cacheKey: string;
        isToggleFiltersEnabled: boolean;
        goToNewState: any;
        goToNewStateEnabled: boolean;
        goToDetailState: any;
        goToDetailStateEnabled: boolean;
        emptyMsg: string;
        ids: any;
        hasRemoveRights: boolean;
        hasNewRights: boolean;
        msgs: any[];
        items: any[];
        counts: any;
        promiseItem: any;
        gridId: string;
        isLoading: boolean;
        spinnerImg: string;
        totalRowMsg: string;
        showEmptyMsg: boolean;

        dateGroup: boolean;
        groupField: string;
        noPaging: string;
        selectedIndex: any;
        selectedRow: (index) => void;

        tableParentClass: any;
    }
}