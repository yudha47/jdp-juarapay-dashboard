export interface MerchantRequest {
    bankName: string;
    bankNoRek: string;
    callbackUrl: string;
    redirectUrl?: string;
    createdBy: string;
    danaTalang: "Y" | "N" | string; // "Y" or "N", but allowing string for flexibility
    isClient: "Y" | "N" | string; // "Y" or "N", but allowing string for flexibility
    merchantDesc: string;
    registrationDate: string;
    status: string;
    userUid: string;
    withMdr: "Y" | "N" | string; // "Y" or "N", but allowing string for flexibility
    isActive: "Y" | "N" | string; // "Y" or "N", but allowing string for flexibility
    productName?: string;
}
