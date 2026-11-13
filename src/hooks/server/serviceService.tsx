import { ServiceRequest } from "@/data/request/ServiceRequest";
import { ServiceModel } from "../../data/models/ServiceModel";
import { BaseResponse } from "../../data/response/BaseResponse";
import { apiClient } from "../../lib/apiClient";

export async function getServices() {
    return apiClient<BaseResponse<ServiceModel[]>>(`/api/service`);
}

export async function getServiceByUid(uid: string) {
  return apiClient<BaseResponse<ServiceModel>>(`/api/service/${uid}`, {
    method: "GET",
  });
}

export async function createService(payload: ServiceRequest){
  return apiClient<BaseResponse<string>>(`/api/service`, {
    method: "POST",
    body: payload,
  })
}

export async function updateService(uid: string, payload: ServiceRequest){
  return apiClient<BaseResponse<string>>(`/api/service/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteService(uid: string){
  return apiClient<BaseResponse<string>>(`/api/service/${uid}`, {
    method: "DELETE",
  })
}