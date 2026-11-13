import { Pagination } from "../response/BaseResponse";

export interface ReportPelimpahanModel {
    pelimpahan: "pending" | "done" | "failed";
    bank: string;
    categoryDesc: string;
    period: string; // YYYYMM
    counts: number;
}

export type ReportPelimpahanListData = {
    data: ReportPelimpahanModel[];
    pagination: Pagination;
};

export type ReportPelimpahanSort =
    | "period"
    | "pelimpahan"
    | "paymentCode";

export type ReportPelimpahanOrder = "asc" | "desc";

export type ReportPelimpahanSearchBy =
    | "period"
    | "pelimpahan"
    | "paymentCode";

export type GetReportPelimpahanParams = {
    page: number;
    limit: number;
    sort: ReportPelimpahanSort;
    order: ReportPelimpahanOrder;
    searchBy?: ReportPelimpahanSearchBy;
    q?: string;
};

export interface ReportPeriodModel {
    period: string;
}