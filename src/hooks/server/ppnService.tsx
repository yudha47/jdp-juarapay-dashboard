import { apiClient } from "@/lib/apiClient";
import type { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { GetPpnParams, PpnModel } from "../../data/models/PpnModel";
import { PpnRequest } from "../../data/request/PpnRequest";

export async function getPpn(params: GetPpnParams, init?: RequestInit) {
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

    return apiClient<PaginatedResponse<PpnModel[]>>(`/api/ppn?${qs.toString()}`, { signal: init?.signal });
}

export async function getPpnByUid(uid: string) {
    return apiClient<BaseResponse<PpnModel>>(`/api/ppn/${uid}`, {
        method: "GET",
    });
}

export async function createPpn(payload: PpnRequest) {
    return apiClient<BaseResponse<string>>(`/api/ppn`, {
        method: "POST",
        body: payload,
    });
}

export async function updatePpn(uid: string, payload: PpnRequest) {
    return apiClient<BaseResponse<string>>(`/api/ppn/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deletePpn(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/ppn/${uid}`, {
        method: "DELETE",
    });
}
