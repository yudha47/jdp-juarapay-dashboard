export interface UserUpdateRequest {
    dateOfBirth?: string | null;
    email: string;
    fullName: string;
    gender?: string | null;
    isActive?: string;
    merchantUid?: string;
    phone: string;
    regionUid?: string;
    roleUid: string;
    subMerchantUid?: string;
    userDir: string | null;
    userImage: string | null;
    userName: string;
}