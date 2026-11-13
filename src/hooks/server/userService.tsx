import { apiClient } from "@/lib/apiClient";
import type { BaseResponse, PaginatedResponse } from "@/data/response/BaseResponse";
import { GetUsersParams, UserDetailedModel, UserModel } from "@/data/models/UserModel";
import { UserRequest } from "@/data/request/UserRequest";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import { UserPassRequest } from "../../data/request/UserPassRequest";

export async function getUsers(params: GetUsersParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  qs.set("order", params.order);
  if (params.searchBy) qs.set("searchBy", params.searchBy);
  if (params.q?.trim()) qs.set("q", params.q.trim());

  return apiClient<PaginatedResponse<UserModel[]>>(
    `/api/user?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getUserByUid(uid: string) {
  return apiClient<BaseResponse<UserDetailedModel>>(`/api/user/${uid}`, {
    method: "GET",
  });
}

export async function createUser(payload: UserRequest) {
  return apiClient<BaseResponse<string>>(`/api/user`, {
    method: "POST",
    body: payload,
  })
}

export async function updateUser(uid: string, payload: UserUpdateRequest) {
  return apiClient<BaseResponse<string>>(`/api/user/${uid}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteUser(uid: string) {
  return apiClient<BaseResponse<string>>(`/api/user/${uid}`, {
    method: "DELETE",
  })
}

export async function updateUserPass(
  uid: string,
  payload: UserPassRequest
) {
  return apiClient<BaseResponse<string>>(
    `/api/user/updatePass/${uid}`,
    {
      method: "PUT",
      body: payload,
    }
  );
}