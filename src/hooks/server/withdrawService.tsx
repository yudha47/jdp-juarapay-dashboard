import { GetWithdrawsParams, WithdrawDetailModel, WithdrawModel } from "@/data/models/WithdrawModel";
import { WithdrawalRequest } from "@/data/request/WithdrawalRequest";
import { WithdrawalUpdateRequest } from "@/data/request/WithdrawalUpdateRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getWithdraws(params: GetWithdrawsParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<WithdrawModel[]>>(`/api/withdraw?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getWithdrawSaldo() {
    return apiClient<BaseResponse<string>>(`/api/withdraw/saldo`, {
        method: "GET",
    });
}

export async function getWithdrawByUid(uid: string) {
    return apiClient<BaseResponse<WithdrawDetailModel>>(`/api/withdraw/${uid}`, {
        method: "GET",
    });
}

export async function createWithdraw(payload: WithdrawalRequest) {
    return apiClient<BaseResponse<string>>(`/api/withdraw`, {
        method: "POST",
        body: payload,
    });
}

export async function updateWithdraw(uid: string, payload: WithdrawalUpdateRequest) {
    const formData = new FormData();

    formData.append("status", payload.status);
    formData.append("isMerchant", payload.isMerchant);
    if (payload.settlementDate) {
        formData.append("settlementDate", payload.settlementDate);
    }

    if (payload.file) {
        formData.append("buktiTrf", payload.file);
    }

    return apiClient<BaseResponse<string>>(`/api/withdraw/${uid}`, {
        method: "PUT",
        body: formData,
    });
}

export async function deleteWithdraw(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/withdraw/${uid}`, {
        method: "DELETE",
    });
}
