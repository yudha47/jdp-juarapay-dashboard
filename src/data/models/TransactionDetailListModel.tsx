import { Pagination } from "../response/BaseResponse";
import { DetailEmPaylaterModel } from "./DetailEmPaylaterModel";
import { FeeModel } from "./FeeModel";

interface Price {
    priceUid: string;
    price: number;
    priceHistory: number | null;
    isActive: string;
    isPercentage: string;
    paymentMethodUid: string;
    merchantUid: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionDetail {
    transactionUid: string;
    externalTrxId: string | null;
    custTrxId: string | null;
    typeTrx: string;
    channelId: string | null;
    partnerServiceId: string | null;
    merchantId: string;
    productName: string | null;
    regionId: string | null;
    subMerchantId: string | null;
    deviceId: string | null;
    paymentMethodUid: string;
    paymentCode: string;
    extPaymentCode: string;
    pgDesc: string | null;
    transactionNumber: string;
    transactionDate: string;
    transactionExp: string;
    vaNumber: string | null;
    details: DetailEmPaylaterModel;
    fee: FeeModel | null;
    price: Price | null;
    amountTotal: number;
    nettProfit: number;
    withdrawUid: string | null;
    pelimpahan: string | null;
    danaTrxUid: string | null;
    status: string;
    extStatus: string;
    paymentId: string | null;
    paymentDate: string | null;
    datetimePaymentIso: string | null;
    paymentNtb: string | null;
    authCode: string | null;
    statusWebhook: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionDetailList {
    data: TransactionDetail[];
    pagination: Pagination;
}

export type TransactionDLSort = "transactionDate" | "paymentDate" | "createdAt" | "transactionNumber" | "paymentCode";
export type TransactionDLOrder = "asc" | "desc";
export type TransactionDLKeySearch =
    | "paymentCode"
    | "transactionNumber"
    | "transactionDate"
    | "paymentDate"
    | "status"
    | "extStatus"
    | "createdAt";
export type TransactionDLFilterBy = "merchantId" | "regionId" | "siteId" | "clusterId" | "deviceId" | "subMerchantId";
export interface GetTransactionDLParams {
    page: number;
    limit: number;
    sort: TransactionDLSort;
    order: TransactionDLOrder;
    searchBy?: TransactionDLKeySearch;
    q?: string;
    merchantId?: string;
    filterBy?: TransactionDLFilterBy; // ← baru
    id?: string; // ← baru
    endDate?: string;
    isWithdraw?: "Y" | "N";
}

export const TRANSACTION_DATE_SEARCH_FIELDS: TransactionDLKeySearch[] = ["transactionDate", "paymentDate", "createdAt"];

export const isDateSearchField = (value?: TransactionDLKeySearch) =>
    !!value && TRANSACTION_DATE_SEARCH_FIELDS.includes(value);
