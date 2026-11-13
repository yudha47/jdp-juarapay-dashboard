import { apiClient } from "@/lib/apiClient";
import type { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { GetPricesParams, PriceDetailModel, PriceModel } from "../../data/models/PriceModel";
import { PriceRequest } from "../../data/request/PriceRequest";

export async function getPrices(params: GetPricesParams, init?: RequestInit) {
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

    if (params.merchantUid) {
        qs.set("merchantUid", params.merchantUid);
    }

    return apiClient<PaginatedResponse<PriceModel[]>>(`/api/price?${qs.toString()}`, { signal: init?.signal });
}

export async function getPriceByUid(uid: string) {
    return apiClient<BaseResponse<PriceDetailModel>>(`/api/price/${uid}`, {
        method: "GET",
    });
}

export async function createPrice(payload: PriceRequest) {
    return apiClient<BaseResponse<string>>(`/api/price`, {
        method: "POST",
        body: payload,
    });
}

export async function updatePrice(uid: string, payload: PriceRequest) {
    return apiClient<BaseResponse<string>>(`/api/price/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deletePrice(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/price/${uid}`, {
        method: "DELETE",
    });
}
