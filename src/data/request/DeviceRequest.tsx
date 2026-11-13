export interface DeviceRequest {
    latitude: string;
    longitude: string;
    serialNumber: string;
    deviceName: string;
    deviceType: "edc" | "reader" | string;
    subMerchantUid: string;
    deviceId: string;
    isActive?: "Y" | "N" | string;
}
