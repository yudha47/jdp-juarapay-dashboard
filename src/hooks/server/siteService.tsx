
import { GetSitesParams, SiteModel, SiteDetailedModel } from "@/data/models/SiteModel";
import { SiteRequest } from "@/data/request/SiteRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getSites(params: GetSitesParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<SiteModel[]>>(
    `/api/site?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getSiteByUid(uid: string) {
  return apiClient<BaseResponse<SiteDetailedModel>>(`/api/site/${uid}`, {
    method: "GET",
  });
}

export async function createSite(payload: SiteRequest){
  return apiClient<BaseResponse<string>>(`/api/site`, {
    method: "POST",
    body: payload,
  })
}

export async function updateSite(uid: string, payload: SiteRequest){
  return apiClient<BaseResponse<string>>(`/api/site/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteSite(uid: string){
  return apiClient<BaseResponse<string>>(`/api/site/${uid}`, {
    method: "DELETE",
  })
}