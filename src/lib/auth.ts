import { RoleApiResponse, RoleModel } from "@/data/models/RoleModel";
import { UserModel } from "@/data/models/UserModel";
import { LoginData } from "@/data/response/LoginResponse";
import { apiClient } from "@/lib/apiClient";
// <- sesuaikan path import types kamu

const AUTH_STORAGE_KEY = "pga.auth.v1";

type StoredAuth = {
  token: string;
  user: UserModel;
  role?: RoleModel;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveAuthSession(data: LoginData) {
  if (!isBrowser()) return;

  const stored: StoredAuth = {
    token: data.token,
    user: data.user,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored));
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("menus");
}

export function getAuthSession(): StoredAuth | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return getAuthSession()?.token ?? null;
}

export function getLoggedInUser(): UserModel | null {
  return getAuthSession()?.user ?? null;
}

export function getLoggedInRole(): RoleModel | null {
  return getAuthSession()?.role ?? null;
}

/**
 * Fetch role detail berdasarkan roleUid dari user yang sedang login,
 * lalu cache ke localStorage supaya tidak perlu fetch berulang.
 */
export async function hydrateLoggedInRole(force = false) {
  const session = getAuthSession();
  if (!session?.token || !session.user?.roleUid) return null;

  if (!force && session.role) return session.role;

  const roleUid = session.user.roleUid;

  const res = await apiClient<RoleApiResponse>(`/api/role/${roleUid}`, {
    method: "GET",
    headers: {
      Authorization: session.token,
    },
  });

  const role = res.data ?? null;

  if (role) {
    localStorage.setItem(
      "pga.auth.v1",
      JSON.stringify({ ...session, role })
    );
  }

  return role;
}
