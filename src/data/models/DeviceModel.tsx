import { Pagination } from "../response/BaseResponse";

export type DeviceModel = {
  createdAt: string;
  latitude: string;
  longitude: string;
  merchantID: string;
  serialNumber: string;
  deviceName: string;
  deviceType: "edc" | "reader" | string;
  deviceId: string;
  deviceUid: string;
  isActive: "Y" | "N" | string;
  updatedAt: string;
};

export type DeviceListModel = {
  data: DeviceModel[];
  pagination: Pagination;
};

export type DeviceSort = "createdAt" | "serialNumber" | "deviceId";
export type DeviceOrder = "asc" | "desc";
export type DeviceKeySearch = "roleDesc" | "isActive";

export type GetDevicesParams = {
  page: number;
  limit: number;
  sort: DeviceSort;
  order: DeviceOrder;
  searchBy?: DeviceKeySearch;
  q?: string;
};
