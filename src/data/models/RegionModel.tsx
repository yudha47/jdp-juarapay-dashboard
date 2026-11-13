import { Pagination } from "../response/BaseResponse";
import { ClusterDetailedModel } from "./ClusterModel";

export type RegionModel = {
    createdAt: string;
    merchantUid: string;
    regionDesc: string;
    regionId: string;
    regionUid: string;
    isActive: "Y" | "N" | string;
    updatedAt: string;
};

export type RegionListData = {
    data: RegionModel[];
    pagination: Pagination;
};

export type RegionSort = "createdAt" | "name" | "uid";
export type RegionOrder = "asc" | "desc";
export type RegionKeySearch = "regionDesc" | "regionId" | "merchantUid";

export type GetRegionsParams = {
    page: number;
    limit: number;
    sort: RegionSort;
    order: RegionOrder;
    searchBy?: RegionKeySearch;
    q?: string;
};

export type RegionDetailedModel = {
    apiKey: string;
    createdAt: string;
    merchantUid: string;
    regionDesc: string;
    bankName: string;
    bankNoRek: string;
    regionId: string;
    regionUid: string;
    isActive: "Y" | "N" | string;
    cluster: ClusterDetailedModel[];
    updatedAt: string;
};
