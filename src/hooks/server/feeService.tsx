import { FeeRequest } from "../../data/request/FeeRequest";
import { BaseResponse } from "../../data/response/BaseResponse";
import { apiClient } from "../../lib/apiClient";

export async function createFee(payload: FeeRequest) {
    return apiClient<BaseResponse<string>>(`/api/fee`, {
        method: "POST",
        body: payload,
    });
}

export async function updateFee(uid: string, payload: FeeRequest) {
    return apiClient<BaseResponse<string>>(`/api/fee/${uid}`, {
        method: "PUT",
        body: payload,
    });
}

export async function deleteFee(uid: string) {
    return apiClient<BaseResponse<string>>(`/api/fee/${uid}`, { method: "DELETE" });
}
