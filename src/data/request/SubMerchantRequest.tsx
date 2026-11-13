export interface SubMerchantRequest {
    internalSmId?: string;
    siteUid: string;
    regionUid: string;
    subMerchantDesc: string;
    isActive?: "Y" | "N" | string;
    // subMerchantId: string;
}
