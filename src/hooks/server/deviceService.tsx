import { GetDevicesParams, DeviceModel } from "@/data/models/DeviceModel";
import { DeviceRequest } from "@/data/request/DeviceRequest";
import { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { DeviceCredentialRequest } from "../../data/request/DeviceCredentialRequest";

export async function getDevices(params: GetDevicesParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.searchBy?.trim()) qs.set("searchBy", params.searchBy.trim());
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<DeviceModel[]>>(
    `/api/device?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getDeviceByUid(uid: string) {
  return apiClient<BaseResponse<DeviceModel>>(`/api/device/${uid}`, {
    method: "GET",
  });
}

export async function createDevice(payload: DeviceRequest) {
  return apiClient<BaseResponse<string>>(`/api/device`, {
    method: "POST",
    body: payload,
  })
}

export async function updateDevice(uid: string, payload: DeviceRequest) {
  return apiClient<BaseResponse<string>>(`/api/device/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteDevice(uid: string) {
  return apiClient<BaseResponse<string>>(`/api/device/${uid}`, {
    method: "DELETE",
  })
}

export async function updateDeviceCredential(
  uid: string,
  payload: DeviceCredentialRequest
) {
  return apiClient<BaseResponse<string>>(
    `/api/device/updateCredential/${uid}`,
    {
      method: "PUT",
      body: payload,
    }
  );
}
