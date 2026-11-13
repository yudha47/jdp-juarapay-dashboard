import { Pagination } from "../response/BaseResponse";
import { SubMerchantDetailedModel } from "./SubMerchantModel";

export interface SiteModel {
    clusterUid: string;
    createdAt: string;
    siteDesc: string;
    siteUid: string;
    updatedAt: string;
}

export type SiteListData = {
  data: SiteModel[];
  pagination: Pagination;
};

export type SiteSort = "createdAt" | "siteDesc" | "uid";
export type SiteOrder = "asc" | "desc";
export type SiteKeySearch = "siteDesc" | "apiKey";

export type GetSitesParams = {
  page: number;
  limit: number;
  sort: SiteSort;
  order: SiteOrder;
  searchBy?: SiteKeySearch;
  q?: string;
};

export interface SiteDetailedModel {
    siteUid: string;
    siteDesc: string;
    clusterUid: string;
    subMerchant: SubMerchantDetailedModel[];
    createdAt: string;
    updatedAt: string;
}