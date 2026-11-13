export interface WithdrawalRequest {
    amount: number;
    merchantUid: string;
    regionUid: string;
    isMerchant: "Y" | "N";
    trxIds: Array<{
        transactionUid: string;
    }>;
}
