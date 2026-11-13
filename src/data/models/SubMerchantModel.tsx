import { Pagination } from "../response/BaseResponse";
import { DeviceModel } from "./DeviceModel";

export type SubMerchantModel = {
    createdAt: string;
    siteUid: string;
    subMerchantDesc: string;
    subMerchantId: string;
    subMerchantUid: string;
    isActive: "Y" | "N" | string;
    updatedAt: string;
};

export type SubMerchantListData = {
    data: SubMerchantModel[];
    pagination: Pagination;
};

export type SubMerchantSort = "createdAt" | "subMerchantDesc" | "subMerchantId" | "uid";
export type SubMerchantOrder = "asc" | "desc";
export type SubMerchantKeySearch = "subMerchantDesc" | "subMerchantId" | "apiKey";

export type GetSubMerchantsParams = {
    page: number;
    limit: number;
    sort: SubMerchantSort;
    order: SubMerchantOrder;
    searchBy?: SubMerchantKeySearch;
    q?: string;
};

export type SubMerchantDetailedModel = {
    apiKey: string;
    createdAt: string;
    internalSmId: string;
    siteUid: string;
    subMerchantDesc: string;
    subMerchantId: string;
    subMerchantUid: string;
    isActive: "Y" | "N" | string;
    devices: DeviceModel[];
    updatedAt: string;
};
