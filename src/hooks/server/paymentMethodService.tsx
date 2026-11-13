import {
    GetPaymentMethodsParams,
    PaymentMethodDetailModel,
    PaymentMethodModel,
    GetPaymentMethodByMerchantParams,
    PaymentMethodByMerchantModel,
} from "@/data/models/PaymentMethodModel";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { PaymentMethodRequest } from "../../data/request/PaymentMethodRequest";
import { GetMdrParams, MdrModel } from "../../data/models/MdrModel";

export async function getPaymentMethods(params: GetPaymentMethodsParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<PaymentMethodModel[]>>(`/api/payMethod?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getMdr(params: GetMdrParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);

    if (params.searchBy) qs.set("searchBy", params.searchBy);
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<MdrModel[]>>(`/api/payMethod/mbr?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getPaymentMethodByUid(uid: string) {
    return apiClient<BaseResponse<PaymentMethodDetailModel>>(`/api/payMethod/${uid}`, {
        method: "GET",
    });
}

export async function getPaymentMethodByMerchant(params: GetPaymentMethodByMerchantParams) {
    const { merchantUid, roleUid } = params;

    return apiClient<BaseResponse<PaymentMethodByMerchantModel[]>>(
        `/api/payMethod/merchant/${merchantUid}/${roleUid}`,
        { method: "GET" },
    );
}

export async function createPaymentMethod(payload: PaymentMethodRequest) {
    return apiClient<BaseResponse<string>>(`/api/payMethod`, {
        method: "POST",
        body: payload,
    });
}

export async function updatePaymentMethod(uid: string, payload: PaymentMethodRequest) {
    return apiClient<BaseResponse<string>>(`/api/payMethod/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deletePaymentMethod(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/payMethod/${uid}`, {
        method: "DELETE",
    });
}
