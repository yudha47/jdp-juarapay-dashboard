import { apiClient } from "@/lib/apiClient";
import type { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { GetPaymentGatewayParams, PaymentGatewayModel } from "../../data/models/PaymentGatewayModel";
import { PaymentGatewayRequest } from "../../data/request/PaymentGatewayRequest";

export async function getPaymentGateway(params: GetPaymentGatewayParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);

    if (params.searchBy) {
        qs.set("searchBy", params.searchBy);
    }

    if (params.q?.trim()) {
        qs.set("q", params.q.trim());
    }

    return apiClient<PaginatedResponse<PaymentGatewayModel[]>>(`/api/pg?${qs.toString()}`, { signal: init?.signal });
}

export async function getPaymentGatewayByUid(uid: string) {
    return apiClient<BaseResponse<PaymentGatewayModel>>(`/api/pg/${uid}`, {
        method: "GET",
    });
}

export async function createPaymentGateway(payload: PaymentGatewayRequest) {
    return apiClient<BaseResponse<string>>(`/api/pg`, {
        method: "POST",
        body: payload,
    });
}

export async function updatePaymentGateway(uid: string, payload: PaymentGatewayRequest) {
    return apiClient<BaseResponse<string>>(`/api/pg/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deletePaymentGateway(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/pg/${uid}`, {
        method: "DELETE",
    });
}
