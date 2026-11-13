import { ClusterDetailedModel, ClusterModel, GetClustersParams } from "@/data/models/ClusterModel";
import { ClusterRequest } from "@/data/request/ClusterRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export async function getClusters(params: GetClustersParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<ClusterModel[]>>(
    `/api/cluster?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getClusterByUid(uid: string) {
  return apiClient<BaseResponse<ClusterDetailedModel>>(`/api/cluster/${uid}`, {
    method: "GET",
  });
}

export async function createCluster(payload: ClusterRequest){
  return apiClient<BaseResponse<string>>(`/api/cluster`, {
    method: "POST",
    body: payload,
  })
}

export async function updateCluster(uid: string, payload: ClusterRequest){
  return apiClient<BaseResponse<string>>(`/api/cluster/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteCluster(uid: string){
  return apiClient<BaseResponse<string>>(`/api/cluster/${uid}`, {
    method: "DELETE",
  })
}