import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAllowedPathPrefixes, canAccessPath } from "@/utils/rbac";
import { getAuthHeaders } from "../../lib/upstreamHeaders";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const roleUid = cookieStore.get("role_uid")?.value;

    if (!token || !roleUid) redirect("/login");

    const res = await fetch(`${process.env.API_BASE_URL}/api/v1/role/${roleUid}`, {
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    if (!res.ok) redirect("/login");

    const json = await res.json();
    const menus = json?.data?.menus ?? [];
    const allowed = getAllowedPathPrefixes(menus);

    // prioritas: kalau summary memang allowed
    if (canAccessPath(allowed, "/dashboard/summary")) redirect("/dashboard/summary");

    // fallback: ke menu pertama yang allowed
    const fallback = // eslint-disable-next-line @typescript-eslint/no-explicit-any
        menus.find((m: any) => m?.pathMenu && canAccessPath(allowed, m.pathMenu))?.pathMenu;

    redirect(fallback ?? "/login");
}
