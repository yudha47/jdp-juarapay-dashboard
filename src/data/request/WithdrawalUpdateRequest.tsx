export interface WithdrawalUpdateRequest {
    file?: File;
    status: string;
    settlementDate: string;
    isMerchant: "Y" | "N";
}
