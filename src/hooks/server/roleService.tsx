import { apiClient } from "@/lib/apiClient";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { RoleModel } from "@/data/models/RoleModel";
import { RoleRequest } from "../../data/request/RoleRequest";

export async function getRoles(params: {
    page: number;
    limit: number;
    sort: string;
    order: string;
    searchBy?: string;
    q?: string;
}) {
    const qs = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
        sort: params.sort,
        order: params.order,
    });

    // ✅ Append searchBy & q hanya kalau ada nilainya
    if (params.searchBy) qs.append("searchBy", params.searchBy);
    if (params.q) qs.append("q", params.q);

    return apiClient<PaginatedResponse<RoleModel[]>>(`/api/role?${qs.toString()}`);
}

export async function getRoleByUid(uid: string) {
    return apiClient<BaseResponse<RoleModel>>(`/api/role/${uid}`, { method: "GET" });
}

export async function deleteRole(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/role/${uid}`, { method: "DELETE" });
}

export async function createRole(payload: RoleRequest) {
    return apiClient<BaseResponse<string>>(`/api/role`, { method: "POST", body: payload });
}

export async function updateRole(uid: string, payload: RoleRequest) {
    return apiClient<BaseResponse<string>>(`/api/role/${uid}`, { method: "PUT", body: payload });
}
