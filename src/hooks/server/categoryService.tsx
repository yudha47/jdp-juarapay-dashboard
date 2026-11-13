import { CategoryModel, GetCategoryParams } from "../../data/models/CategoryModel";
import { CategoryRequest } from "../../data/request/CategoryRequest";
import { BaseResponse, PaginatedResponse } from "../../data/response/BaseResponse";
import { apiClient } from "../../lib/apiClient";

export async function getCategory(params: GetCategoryParams, init?: RequestInit) {
    const qs = new URLSearchParams();

    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    qs.set("sort", params.sort);
    qs.set("order", params.order);
    if (params.q?.trim()) qs.set("q", params.q.trim());

    return apiClient<PaginatedResponse<CategoryModel[]>>(`/api/category?${qs.toString()}`, {
        signal: init?.signal,
    });
}

export async function getCategoryByUid(uid: string) {
    return apiClient<BaseResponse<CategoryModel>>(`/api/category/${uid}`, {
        method: "GET",
    });
}

export async function createCategory(payload: CategoryRequest) {
    return apiClient<BaseResponse<string>>(`/api/category`, {
        method: "POST",
        body: payload,
    });
}

export async function updateCategory(uid: string, payload: CategoryRequest) {
    return apiClient<BaseResponse<string>>(`/api/category/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deleteCategory(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/category/${uid}`, {
        method: "DELETE",
    });
}
