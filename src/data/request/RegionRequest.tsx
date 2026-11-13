export interface RegionRequest {
    merchantUid: string;
    regionDesc: string;
    regionId?: string;
    bankName?: string;
    bankNoRek?: string;
    isActive?: "Y" | "N" | string;
}
