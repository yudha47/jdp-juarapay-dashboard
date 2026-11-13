import type { Role } from "@/constants/roles";

export type JwtPayload = {
  exp: number;
  data?: {
    role?: {
      roleDesc?: Role;
    };
  };
};

function base64UrlToBase64(input: string) {
  return input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(base64UrlToBase64(payload)));
    return json;
  } catch {
    return null;
  }
}
