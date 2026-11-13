import { Pagination } from "../response/BaseResponse";
import { DetailEmPaylaterModel } from "./DetailEmPaylaterModel";
import { FeeModel } from "./FeeModel";

export interface TransactionModel {
    merchantDesc: string;
    merchantId: string;
    nettProfit: number;
    amountTotal: number;
    paymentCode: string;
    regionDesc: string;
    paymentDate: string;
    pelimpahan: string;
    category: string;
    regionId: string;
    status: string;
    statusWebhook: string;
    subMerchantDesc: string;
    subMerchantId: string;
    transactionDate: string;
    transactionNumber: string;
    custTrxId: string;
    transactionUid: string;
}

export interface TransactionListModel {
    data: TransactionModel[];
    pagination: Pagination;
}

export type TransactionSort =
    | "createdAt"
    | "transactionDate"
    | "transactionNumber"
    | "custTrxId"
    | "paymentDate"
    | "status"
    | "paymentCode";
export type TransactionOrder = "asc" | "desc";
export type TransactionKeySearch =
    | "paymentCode"
    | "transactionNumber"
    | "transactionDate"
    | "paymentDate"
    | "status"
    | "extStatus"
    | "createdAt"
    | "custTrxId"
    | "typeTrx";

export type TransactionFilterBy = "merchantId" | "regionId" | "siteId" | "clusterId" | "deviceId" | "subMerchantId";

export interface GetTransactionsParams {
    page: number;
    limit: number;
    sort: TransactionSort;
    order: TransactionOrder;
    searchBy?: TransactionKeySearch;
    q?: string;
    endDate?: string;
    merchantId?: string;
    filterBy?: TransactionFilterBy;
    id: string;
}

export interface PriceTransactionModel {
    createdAt: string;
    createdBy: string;
    isActive: string;
    isPercentage: string;
    merchantUid: string;
    paymentMethodUid: string;
    price: number;
    priceHistory: number;
    priceUid: string;
    updatedAt: string;
}

export interface TransactionDetailedModel {
    authCode: string;
    custTrxId: string;
    amountTotal: number;
    bankMid: string;
    bankTid: string;
    cardNo: string;
    channelId: string;
    createdAt: string;
    danaTrxUid: string;
    datetimePaymentIso: string;
    extPaymentCode: string;
    extStatus: string;
    externalTrxId: string;
    fee: FeeModel;
    nettProfit: number;
    pelimpahan: string; // pending, done, failed
    statusWebhook: string;
    merchantId: string;
    partnerServiceId: string;
    paymentCode: string;
    paymentDate: string;
    paymentId: string;
    paymentMethodUid: string;
    paymentNtb: string;
    price: PriceTransactionModel;
    regionId: string;
    status: string;
    subMerchantId: string;
    deviceId: string;
    transactionDate: string;
    transactionExp: string;
    transactionNumber: string;
    transactionUid: string;
    typeTrx: string;
    updatedAt: string;
    vaNumber: string;
    withdrawUid: string;
    details: DetailEmPaylaterModel;
}
