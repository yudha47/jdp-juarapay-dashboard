import { Pagination } from "../response/BaseResponse";

export type MdrModel = {
    bank: string;
    catDesc: string;
    fee: number;
    feePercentage: string;
    feeStatus: string;
    margin: string;
    merchantDesc: string;
    pgDesc: string;
    price: number;
    priceUid: string;
    pricePercentage: string;
    priceStatus: string;
};

export type MdrListData = {
    items: MdrModel[];
    pagination: Pagination;
};

export type MdrSort = "bank" | "catDesc" | "merchantDesc" | "pgDesc" | "price" | "fee" | "margin";

export type MdrOrder = "asc" | "desc";

export type MdrSearchBy = "merchantDesc" | "catDesc" | "bank" | "pgDesc";

export type GetMdrParams = {
    page: number;
    limit: number;
    sort: MdrSort;
    order: MdrOrder;
    searchBy?: MdrSearchBy;
    q?: string;
};
