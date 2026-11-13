import { Pagination } from "../response/BaseResponse";

export type PaymentGatewayModel = {
    pgUid: string;
    pgDesc: string;
    pgCode: number;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};

export type PaymentGatewayListData = {
    items: PaymentGatewayModel[];
    pagination: Pagination;
};

export type PaymentGatewaySort = "createdAt" | "pgDesc" | "pgCode";
export type PaymentGatewayOrder = "asc" | "desc";

export type PaymentGatewaySearchBy = "pgCode" | "pgDesc";

export type GetPaymentGatewayParams = {
    page: number;
    limit: number;
    sort: PaymentGatewaySort;
    order: PaymentGatewayOrder;
    searchBy?: PaymentGatewaySearchBy;
    q?: string;
};
