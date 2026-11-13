export interface PaymentMethodRequest {
    bank: string;
    bankDir: string;
    bankId: string;
    bankImg: string;
    catUid: string;
    channelId: string;
    extPaymentCode: string;
    isActive: "Y" | "N";
    paymentCode: string;
    pgUid: string;
    subBankId: string;
}
