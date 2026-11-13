import { BaseResponse } from "../response/BaseResponse";

export type FeeModel = {
    feeUid: string;
    paymentMethodUid: string;
    fee: number;
    isPercentage: "Y" | "N";
    isActive: "Y" | "N";
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

export type FeeListResponse = BaseResponse<FeeModel[]>;

export type FeeSingleResponse = BaseResponse<FeeModel>;
