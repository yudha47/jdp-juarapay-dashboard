import { BaseResponse } from "../response/BaseResponse";

export type ServiceModel = {
    serviceUid: string;
    serviceDesc: string;
    pathMenu: string;
    iconMenu: string;
    dirIconMenu: string;
    createdAt: string;
    updatedAt: string;
};

export type ServiceListResponse = BaseResponse<ServiceModel[]>;

export type ServiceSingleResponse = BaseResponse<ServiceModel>;
