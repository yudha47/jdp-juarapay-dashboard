import { MappingRoleServiceModel } from "../../data/models/MappingRoleServiceModel";
import { MappingRoleServiceRequest } from "../../data/request/MappingRoleServiceRequest";
import { BaseResponse, PaginatedResponse } from "../../data/response/BaseResponse";
import { apiClient } from "../../lib/apiClient";

export async function getMappingRoleService() {
    return apiClient<PaginatedResponse<MappingRoleServiceModel[]>>(`/api/mappingRoleService`);
}

export async function createMappingRoleService(payload: MappingRoleServiceRequest) {
    return apiClient<BaseResponse<string>>(`/api/mappingRoleService`, { method: "POST", body: payload });
}

export async function deleteMappingRoleService(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/mappingRoleService/${uid}`, { method: "DELETE" });
}

export async function updateMappingRoleService(uid: string, payload: MappingRoleServiceRequest) {
    return apiClient<BaseResponse<string>>(`/api/mappingRoleService/${uid}`, { method: "PUT", body: payload });
}

export async function getMappingRoleServiceByUid(uid: string) {
    return apiClient<BaseResponse<MappingRoleServiceModel>>(`/api/mappingRoleService/${uid}`, { method: "GET" });
}
