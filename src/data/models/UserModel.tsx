import { Pagination } from "../response/BaseResponse";
import { RoleModel } from "./RoleModel";

export type UserModel = {
  userUid: string;
  fullName: string;
  email: string;
  userName: string;
  phone: string;
  roleUid: string;
  isActive: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export type UserListData = {
  items: UserModel[];
  pagination: Pagination;
};

export type UserSort = "createdAt" | "fullname" | "uid" | "isActive";
export type UserOrder = "asc" | "desc";
export type UserSearchKey = "fullName" | "isActive";

export type GetUsersParams = {
  page: number;
  limit: number;
  sort: UserSort;
  order: UserOrder;
  searchBy: UserSearchKey;
  q?: string; // search by fullname
};

export type UserDetailedModel = {
  createdAt: string;
  dateOfBirth: string;
  email: string;
  fullName: string;
  gender: string;
  isActive: string;
  phone: string;
  role: RoleModel;
  updatedAt: string;
  userDir: string;
  userImage: string;
  userName: string;
  userUid: string;
  merchantUid: string | null;
  regionUid: string | null;
  subMerchantUid: string | null;
};