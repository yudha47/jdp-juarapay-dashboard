import { Pagination } from "../response/BaseResponse";
import { SiteDetailedModel } from "./SiteModel";

export interface ClusterModel {
    clusterDesc: string;
    clusterUid: string;
    createdAt: string;
    regionUid: string;
    updatedAt: string;
}

export type ClusterListData = {
  data: ClusterModel[];
  pagination: Pagination;
};

export type ClusterSort = "createdAt" | "clusterDesc" | "uid";
export type ClusterOrder = "asc" | "desc";
export type ClusterKeySearch = "clusterDesc";

export type GetClustersParams = {
  page: number;
  limit: number;
  sort: ClusterSort;
  order: ClusterOrder;
  searchBy?: ClusterKeySearch;
  q?: string;
};

export interface ClusterDetailedModel {
    clusterUid: string;
    clusterDesc: string;
    regionUid: string;
    site: SiteDetailedModel[];
    createdAt: string;
    updatedAt: string;
}