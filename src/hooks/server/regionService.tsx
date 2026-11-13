
import { GetRegionsParams, RegionDetailedModel, RegionModel } from "@/data/models/RegionModel";
import { RegionRequest } from "@/data/request/RegionRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getRegions(params: GetRegionsParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<RegionModel[]>>(
    `/api/region?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getRegionByUid(uid: string) {
  return apiClient<BaseResponse<RegionDetailedModel>>(`/api/region/${uid}`, {
    method: "GET",
  });
}

export async function createRegion(payload: RegionRequest){
  return apiClient<BaseResponse<string>>(`/api/region`, {
    method: "POST",
    body: payload,
  })
}

export async function updateRegion(uid: string, payload: RegionRequest){
  return apiClient<BaseResponse<string>>(`/api/region/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteRegion(uid: string){
  return apiClient<BaseResponse<string>>(`/api/region/${uid}`, {
    method: "DELETE",
  })
}