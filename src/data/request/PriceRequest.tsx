export interface PriceRequest {
    createdBy: string;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
    merchantUid: string;
    paymentMethodUid: string;
    price: number;
}
