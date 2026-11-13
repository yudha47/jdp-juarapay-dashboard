import { Pagination } from "../response/BaseResponse";
import { MerchantDetailedModel } from "./MerchantModel";
import { UserDetailedModel } from "./UserModel";

export interface PriceModel {
    priceUid: string;
    price: number;

    isActive: "Y" | "N";
    isPercentage: "Y" | "N";

    paymentMethodUid: string;

    merchant: MerchantModel;
    createdBy: CreatedByModel;

    createdAt: string;
    updatedAt: string;
}

export interface MerchantModel {
    merchantUid: string;
    merchantId: string;
    merchantDesc: string;
}

export interface CreatedByModel {
    userUid: string;
    fullName: string;
    email: string;
    userName: string;
    phone: string;

    gender: string | null;
    dateOfBirth: string | null;

    isActive: "Y" | "N";

    userImage: string;
    userDir: string;
}

export type PriceListData = {
    data: PriceModel[];
    pagination: Pagination;
};

export type PriceSort = "createdAt" | "price" | "paymentMethodUid";

export type PriceOrder = "asc" | "desc";

export type PriceSearchBy = "price" | "paymentMethodUid" | "merchantUid";

export type GetPricesParams = {
    page: number;
    limit: number;
    sort: PriceSort;
    order: PriceOrder;
    searchBy?: PriceSearchBy;
    q?: string;
    merchantUid?: string;
};

/* =========================
   PRICE DETAIL MODEL
========================= */

export interface PriceDetailModel {
    priceUid: string;
    price: number;

    isActive: string;
    isPercentage: string;

    paymentMethodUid: string;

    createdAt: string;
    updatedAt: string;

    createdBy: UserDetailedModel;
    merchantUid: MerchantDetailedModel;
}

export interface MenuModel {
    mappingUid: string;
    servicesUid: string;
    pathMenu: string;
    iconMenu: string;
    dirIconMenu: string;
    permission: string;
    serviceDesc: string;
    status: string;
}

export interface RegionModel {
    regionUid: string;
    regionId: string;
    regionDesc: string;

    merchantUid: string;
    apiKey: string;

    createdAt: string;
    updatedAt: string;

    cluster: ClusterModel[];
}

export interface ClusterModel {
    clusterUid: string;
    clusterDesc: string;

    regionUid: string;

    createdAt: string;
    updatedAt: string;

    site: SiteModel[];
}

export interface SiteModel {
    siteUid: string;
    siteDesc: string;
    clusterUid: string;
    createdAt: string;
    updatedAt: string;
    subMerchant: SubMerchantModel[];
}

export interface SubMerchantModel {
    subMerchantUid: string;
    subMerchantId: string;
    subMerchantDesc: string;
    siteUid: string;
    apiKey: string;
    createdAt: string;
    updatedAt: string;
    devices: DeviceModel[];
}

export interface DeviceModel {
    deviceUid: string;
    deviceId: string;
    serialNumber: string;
    latitude: string;
    longitude: string;
    subMerchantUid: string;
    createdAt: string;
    updatedAt: string;
}
