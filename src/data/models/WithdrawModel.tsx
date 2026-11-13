import { Pagination } from "../response/BaseResponse";
import { MerchantDetailedModel } from "./MerchantModel";
import { RegionDetailedModel } from "./RegionModel";

export interface WithdrawTransactionListModel {
    externalTrxId: string;
    nettProfit: number;
    transactionNumber: string;
    transactionUid: string;
    merchantId: string;
    regionId: string;
    subMerchantId: string;
    merchantDesc: string;
    regionDesc: string;
    subMerchantDesc: string;
}

export interface WithdrawModel {
    amount: number;
    createdAt: string;
    // only use merchant info
    merchant: MerchantDetailedModel;
    region: RegionDetailedModel;
    requestTime: string;
    status: string;
    updatedAt: string;
    withdrawUid: string;
    isMerchant?: "Y" | "N";
}

export interface WithdrawListModel {
    data: WithdrawModel[];
    pagination: Pagination;
}

export type WithdrawSort = "createdAt" | "uid";
export type WithdrawOrder = "asc" | "desc";
export type WithdrawKeySearch = "merchantUid";

export interface GetWithdrawsParams {
    page: number;
    limit: number;
    sort: WithdrawSort;
    order: WithdrawOrder;
    searchBy?: WithdrawKeySearch;
    q?: string;
}

export interface WithdrawDetailModel {
    amount: number;
    buktiDir: string;
    buktiTrf: string;
    createdAt: string;
    listTrx: WithdrawTransactionListModel[];
    merchant: MerchantDetailedModel;
    region: RegionDetailedModel;
    requestTime: string;
    settlementDate: string;
    status: string;
    updatedAt: string;
    withdrawUid: string;
    isMerchant?: "Y" | "N";
}
