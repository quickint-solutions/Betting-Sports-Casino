namespace intranet.common {
    export interface IParamsGrid {
        pageSize: number;
        groupBy: string;
        page: number;
        orderBy: string;
        orderByDesc: boolean;
    }
}