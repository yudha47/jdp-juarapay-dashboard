import { Pagination } from "../response/BaseResponse";

export type PpnModel = {
    ppnUid: string;
    ppn: number;
    isActive: string; // atau boolean kalau API sebenarnya boolean
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};

export type PpnListData = {
    items: PpnModel[];
    pagination: Pagination;
};

export type PpnSort = "createdAt" | "ppn" | "isActive";
export type PpnOrder = "asc" | "desc";

export type PpnSearchBy = "ppn" | "isActive";

export type GetPpnParams = {
    page: number;
    limit: number;
    sort: PpnSort;
    order: PpnOrder;
    searchBy?: PpnSearchBy;
    q?: string;
};
