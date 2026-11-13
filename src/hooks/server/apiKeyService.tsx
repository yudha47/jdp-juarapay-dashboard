import { BaseResponse } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";

export type GetApiKeyParams = {
  merchantUid?: string;
  regionUid?: string;
  subMerchantUid?: string;
};

export async function getApiKeyInfo(params: GetApiKeyParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  if (params.merchantUid?.trim()) qs.set("merchantUid", params.merchantUid.trim());
  if (params.regionUid?.trim()) qs.set("regionUid", params.regionUid.trim());
  if (params.subMerchantUid?.trim()) qs.set("subMerchantUid", params.subMerchantUid.trim());

  return apiClient<BaseResponse<string>>(
    `/api/infoKey/check?${qs.toString()}`,
    { signal: init?.signal }
  );
}

export async function getApiKeyRefresh(params: GetApiKeyParams, init?: RequestInit) {
  const qs = new URLSearchParams();

  if (params.merchantUid?.trim()) qs.set("merchantUid", params.merchantUid.trim());
  if (params.regionUid?.trim()) qs.set("regionUid", params.regionUid.trim());
  if (params.subMerchantUid?.trim()) qs.set("subMerchantUid", params.subMerchantUid.trim());

  return apiClient<BaseResponse<string>>(
    `/api/infoKey/refresh?${qs.toString()}`,
    { signal: init?.signal }
  );
}