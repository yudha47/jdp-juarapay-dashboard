import { Pagination } from "../response/BaseResponse";

export interface ReportTrxPerMonthModel {
  merchantId: string;
  merchantDesc: string;
  regionId: string;
  subMerchantId: string | null;
  internalSmId: string | null;

  status: string;

  total: number;
  mbr: number;
  nettProfit: number;
  margin: number;
  period: string; // YYYYMM
  countStatus: number;
}

export type ReportTrxPerMonthListData = {
  data: ReportTrxPerMonthModel[];
  pagination: Pagination;
};

export type ReportTrxPerMonthSort =
  | "period"
  | "subMerchantId"
  | "merchantId"
  | "regionId";

export type ReportTrxPerMonthOrder = "asc" | "desc";

export type ReportTrxPerMothSearchBy =
  | "period"
  | "subMerchantId"
  | "merchantId"
  | "regionId";

export type GetReportTrxPerMonthsParams = {
  page: number;
  limit: number;
  sort: ReportTrxPerMonthSort;
  order: ReportTrxPerMonthOrder;
  searchBy?: ReportTrxPerMothSearchBy;
  q?: string;
};

export interface ReportPeriodModel {
  period: string;
}