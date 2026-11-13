import { Pagination } from "../response/BaseResponse";

export interface ReportPaymentMethodModel {
	merchantId: string;
	merchantDesc: string;

	regionId: string;

	subMerchantId: string | null;
	InternalSmId: string | null;

	paymentCode: string;

	externalStatus: string;

	bank: string;
	category: string;

	total: number;
	mbr: number;
	nettProfit: number;

	period: string; // YYYYMM
}

export interface ReportPaymentMethodListData {
	data: ReportPaymentMethodModel[];
	pagination: Pagination
}

export type ReportPaymentMethodSort = "merchantId" | "regionId" | "subMerchantId" | "period";
export type ReportPaymentMethodOrder = "asc" | "desc";
export type ReportPaymentMethodKeySearch = "merchantId" | "regionId" | "subMerchantId" | "period";

export type GetReportPaymentMethodsParams = {
	page: number;
	limit: number;
	sort: ReportPaymentMethodSort;
	order: ReportPaymentMethodOrder;
	searchBy?: ReportPaymentMethodKeySearch;
	q?: string;
};