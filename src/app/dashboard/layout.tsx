import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LayoutWrapper } from "./layout-wrapper";
import { RoleMenu } from "@/data/models/RoleModel";
import { getAuthHeaders } from "../../lib/upstreamHeaders";

type RoleApi = {
  roleUid: string;
  roleDesc: string;
  isActive: "Y" | "N";
  menus: RoleMenu[];
};

async function fetchRoleByUid(roleUid: string, token: string) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/role/${roleUid}`, {
    method: "GET",
    headers: getAuthHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data ?? null) as RoleApi | null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;
  const roleUid = cookieStore.get("role_uid")?.value;

  if (!token || !roleUid) redirect("/login");

  const roleData = await fetchRoleByUid(roleUid, token);
  if (!roleData || roleData.isActive !== "Y") redirect("/unauthorized");

  return <LayoutWrapper>{children}</LayoutWrapper>;
}