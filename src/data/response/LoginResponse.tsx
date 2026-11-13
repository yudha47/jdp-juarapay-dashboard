import { UserModel } from "../models/UserModel";
import { BaseResponse } from "./BaseResponse";

export type LoginData = {
  token: string;
  user: UserModel;
};

export type LoginApiResponse = BaseResponse<LoginData>;
