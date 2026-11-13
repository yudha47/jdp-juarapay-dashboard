import { GetTransactionDLParams, TransactionDetail } from "@/data/models/TransactionDetailListModel";
import { GetTransactionsParams, TransactionDetailedModel, TransactionModel } from "@/data/models/TransactionModel";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { PelimpahanRequest } from "../../data/request/PelimpahanRequest";
import { RetryWebhookRequest } from "../../data/request/RetryWebhookRequest";

export async function getTransactions(params: GetTransactionsParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.endDate?.trim()) qs.set("endDate", params.endDate.trim()); // ← tambahkan ini
    if (params.merchantId?.trim()) qs.set("merchantId", params.merchantId.trim());
    if (params.filterBy) qs.set("filterBy", params.filterBy); // ← tambahkan ini
    if (params.id) qs.set("id", params.id); // ← tambahkan ini

    return apiClient<PaginatedResponse<TransactionModel[]>>(`/api/transaction?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getTransactionByUid(uid: string) {
    return apiClient<BaseResponse<TransactionDetailedModel>>(`/api/transaction/${uid}`, {
        method: "GET",
    });
}

export async function getTransactionDetailList(params: GetTransactionDLParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.merchantId?.trim()) qs.set("merchantId", params.merchantId.trim());
    if (params.filterBy) qs.set("filterBy", params.filterBy); // ← baru
    if (params.id?.trim()) qs.set("id", params.id.trim()); // ← baru
    if (params.endDate?.trim()) qs.set("endDate", params.endDate.trim());
    if (params.isWithdraw) qs.set("isWithdraw", params.isWithdraw);

    return apiClient<PaginatedResponse<TransactionDetail[]>>(`/api/transactionDetailList?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function updatePelimpahan(payload: PelimpahanRequest) {
    return apiClient<BaseResponse<string>>(`/api/transaction/updatePelimpahan`, {
        method: "PUT",
        body: payload,
    });
}

export async function retryWebhook(payload: RetryWebhookRequest) {
    return apiClient<BaseResponse<string>>(`/api/transaction/retry-webhook`, {
        method: "PUT",
        body: payload,
    });
}
