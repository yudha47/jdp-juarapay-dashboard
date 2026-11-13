export interface FeeRequest {
    createdBy: string;
    paymentMethodUid: string;
    fee: number; // integer
    isPercentage: string;
    isActive: string;
}
