import { Pagination } from "../response/BaseResponse";
import { PaymentMethodModel } from "./PaymentMethodModel";
import { RegionDetailedModel } from "./RegionModel";
import { UserDetailedModel } from "./UserModel";

export type MerchantModel = {
    merchantUid: string;
    merchantId: string;
    merchantDesc: string;
    isActive: string;
    updatedAt: string;
    createdAt: string;
    createdBy: UserDetailedModel;
    userMerchant: UserDetailedModel;
};

export type MerchantListData = {
    data: MerchantModel[];
    pagination: Pagination;
};

export type MerchantSort = "createdAt" | "name" | "uid";
export type MerchantOrder = "asc" | "desc";

export type GetMerchantsParams = {
    page: number;
    limit: number;
    sort: MerchantSort;
    order: MerchantOrder;
    q?: string;
};

export type MerchantDetailedModel = {
    apiKey: string;
    isClient: string;
    createdAt: string;
    bankName: string;
    bankNoRek: string;
    callbackUrl: string;
    redirectUrl?: string;
    createdBy: UserDetailedModel;
    merchantDesc: string;
    merchantId: string;
    merchantUid: string;
    productName?: string;
    danaTalang: string;
    status: string;
    region: RegionDetailedModel[];
    registrationDate: string;
    updatedAt: string;
    withMdr: string;
    isActive: string;
    userMerchant: UserDetailedModel;
    paymentMethod: PaymentMethodModel[];
};
