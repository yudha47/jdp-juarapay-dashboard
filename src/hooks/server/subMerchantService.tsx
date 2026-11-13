


import { GetSubMerchantsParams, SubMerchantDetailedModel, SubMerchantModel } from "@/data/models/SubMerchantModel";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getSubMerchant(params: GetSubMerchantsParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<SubMerchantModel[]>>(
    `/api/subMerchant?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getSubMerchantByUid(uid: string) {
  return apiClient<BaseResponse<SubMerchantDetailedModel>>(`/api/subMerchant/${uid}`, {
    method: "GET",
  });
}

export async function createSubMerchant(payload: SubMerchantRequest){
  return apiClient<BaseResponse<string>>(`/api/subMerchant`, {
    method: "POST",
    body: payload,
  })
}

export async function updateSubMerchant(uid: string, payload: SubMerchantRequest){
  return apiClient<BaseResponse<string>>(`/api/subMerchant/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteSubMerchant(uid: string){
  return apiClient<BaseResponse<string>>(`/api/subMerchant/${uid}`, {
    method: "DELETE",
  })
}