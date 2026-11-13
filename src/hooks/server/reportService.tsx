import { GetReportPaymentMethodsParams, ReportPaymentMethodModel } from "@/data/models/ReportPaymentMethodModel";
import { GetReportTrxPerMonthsParams, ReportPeriodModel, ReportTrxPerMonthModel } from "@/data/models/ReportTrxPerMonthModel";
import { PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { GetReportPelimpahanParams, ReportPelimpahanModel } from "../../data/models/ReportPelimpahanModel";

export async function getReportTrxPerMonths(params: GetReportTrxPerMonthsParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<ReportTrxPerMonthModel[]>>(`/api/report/trxPerMonth?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getReportPaymentMethodsPerMonths(params: GetReportPaymentMethodsParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<ReportPaymentMethodModel[]>>(`/api/report/payMethodPerMonth?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getReportPeriods(init?: RequestInit) {

    return apiClient<PaginatedResponse<ReportPeriodModel[]>>(`/api/report/periode`, {
        signal: init?.signal,
    });
}

export async function getReportPelimpahan(params: GetReportPelimpahanParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<ReportPelimpahanModel[]>>(`/api/report/pelimpahan?${qs.toString()}`, {
        signal: init?.signal,
    });
}