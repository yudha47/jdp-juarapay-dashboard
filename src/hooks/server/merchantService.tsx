import { GetMerchantsParams, MerchantDetailedModel, MerchantModel } from "@/data/models/MerchantModel";
import { MerchantRequest } from "@/data/request/MerchantRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getMerchant(params: GetMerchantsParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<MerchantModel[]>>(
    `/api/merchant?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getMerchantByUid(uid: string) {
  return apiClient<BaseResponse<MerchantDetailedModel>>(`/api/merchant/${uid}`, {
    method: "GET",
  });
}

export async function createMerchant(payload: MerchantRequest){
  return apiClient<BaseResponse<string>>(`/api/merchant`, {
    method: "POST",
    body: payload,
  })
}

export async function updateMerchant(uid: string, payload: MerchantRequest){
  return apiClient<BaseResponse<string>>(`/api/merchant/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteMerchant(uid: string){
  return apiClient<BaseResponse<string>>(`/api/merchant/${uid}`, {
    method: "DELETE",
  })
}