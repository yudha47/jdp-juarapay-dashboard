import { BaseResponse } from "../response/BaseResponse";

export type MappingRoleServiceModel = {
    mappingUid: string;
    roleUid: string;
    servicesUid: string;
    status: "Y" | "N";
    permission: "Y" | "N";
};

export interface MappingRoleEnriched {
    mappingUid: string;
    roleUid: string;
    servicesUid: string;
    roleDesc: string; // dari RoleModel
    serviceDesc: string; // dari ServiceModel
    status: "Y" | "N";
    permission: "Y" | "N";
}

export type RoleServiceMappingApiResponse = BaseResponse<MappingRoleServiceModel[]>;

export type RoleServiceMappingSingleResponse = BaseResponse<MappingRoleServiceModel>;
