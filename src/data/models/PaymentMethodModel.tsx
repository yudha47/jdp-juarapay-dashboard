import { Pagination } from "../response/BaseResponse";
import { CategoryModel } from "./CategoryModel";
import { FeeModel } from "./FeeModel";
import { PaymentGatewayModel } from "./PaymentGatewayModel";
import { PriceModel } from "./PriceModel";

export interface PaymentMethodModel {
    bank: string;
    bankDir: string;
    bankImg: string;
    category: CategoryModel;
    createdAt: string;
    isActive: "Y" | "N";
    paymentCode: string;
    extPaymentCode: string;
    paymentMethodUid: string;
    updatedAt: string;
}

export type PaymentMethodListData = {
    data: PaymentMethodModel[];
    pagination: Pagination;
};

export type PaymentMethodSort = "createdAt" | "name" | "uid";
export type PaymentMethodOrder = "asc" | "desc";
export type PaymentMethodSearchBy = "bank" | 'catUid' | 'pgUid' | 'paymentCode';

export type GetPaymentMethodsParams = {
    page: number;
    limit: number;
    sort: PaymentMethodSort;
    order: PaymentMethodOrder;
    searchBy?: PaymentMethodSearchBy;
    q?: string;
};

export type PaymentMethodDetailModel = {
    paymentMethodUid: string;
    bank: string;
    paymentCode: string;
    extPaymentCode: string;
    channelId: string;
    bankId: string;
    subBankId: string;
    bankDir: string;
    bankImg: string;

    pgate: PaymentGatewayModel;
    category: CategoryModel;
    fee: FeeModel | null;

    price: number | null;
    isActive: "Y" | "N";
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
};

// --- NEW MODELS BELOW ---

export type PaymentMethodByMerchantModel = {
    paymentMethodUid: string;
    bank: string;
    paymentCode: string;
    extPaymentCode: string;
    channelId: string;
    bankId: string;
    subBankId: string;
    bankDir: string;
    bankImg: string;

    pgate: PaymentGatewayModel;
    category: CategoryModel;

    /**
     * null jika role yang digunakan adalah merchant
     * tidak null jika role yang digunakan adalah super admin
     */
    fee: FeeModel | null;

    price: PriceModel | null;
    isActive: "Y" | "N";
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
};

export type PaymentMethodByMerchantResponse = {
    data: PaymentMethodByMerchantModel[];
    status: number;
    trxId: string;
};

export type GetPaymentMethodByMerchantParams = {
    merchantUid: string;
    roleUid?: string;
};
