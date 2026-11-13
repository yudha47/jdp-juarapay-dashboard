import { BaseResponse, Pagination } from "../response/BaseResponse";
import { RoleMenuModel } from "./RoleMenuModel";

export type RoleModel = {
    roleUid: string;
    roleDesc: string;
    isActive: "Y" | "N";
    createdAt: string;
    updatedAt: string;
    menus: RoleMenuModel[];
};

export type RoleApiResponse = BaseResponse<RoleModel>;

export type RoleListPayload = {
    data: Pick<RoleModel, "roleUid" | "roleDesc" | "isActive" | "createdAt" | "updatedAt">[];
    pagination: Pagination;
};

export type RoleListResponse = BaseResponse<RoleListPayload>;

export interface RoleDetailedModel {
    createdAt: string;
    isActive: string;
    menus: RoleMenu[];
    roleDesc: string;
    roleUid: string;
    updatedAt: string;
}

export type RoleMenu = {
  mappingUid: string;
  servicesUid: string;
  serviceDesc: string;
  pathMenu: string;
  iconMenu?: string | null;
  dirIconMenu?: string | null;
  status: "Y" | "N";
  permission: "Y" | "N";
};
