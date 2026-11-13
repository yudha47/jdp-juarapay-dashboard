// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "./lib/jwt";
import { canAccessPath, getAllowedPathPrefixes } from "./utils/rbac";
import { getAuthHeaders } from "./lib/upstreamHeaders";

const ALLOWED_COOKIE = "allowed_prefixes";

function clearAuthCookies(response: NextResponse) {
    response.cookies.delete("access_token");
    response.cookies.delete("role_uid");
    response.cookies.delete("role_desc");
    response.cookies.delete(ALLOWED_COOKIE);
    return response;
}

function redirectAndClearAuth(url: URL) {
    const response = NextResponse.redirect(url);
    return clearAuthCookies(response);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/unauthorized") return NextResponse.next();

    const token = request.cookies.get("access_token")?.value;

    const isRootPage = pathname === "/";
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isDashboardPage = pathname.startsWith("/dashboard");
    const isDashboardRoot = pathname === "/dashboard";

    if (isRootPage) {
        if (!token) return NextResponse.redirect(new URL("/login", request.url));
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!token) {
        if (isDashboardPage) return NextResponse.redirect(new URL("/login", request.url));
        return NextResponse.next();
    }

    const payload = decodeJwt(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
        return redirectAndClearAuth(new URL("/login", request.url));
    }

    if (isAuthPage) return NextResponse.redirect(new URL("/dashboard", request.url));

    const roleUid = request.cookies.get("role_uid")?.value;
    if (!roleUid && isDashboardPage) return redirectAndClearAuth(new URL("/login", request.url));

    const response = NextResponse.next();
    response.cookies.delete(ALLOWED_COOKIE);

    let allowedPrefixes: string[] | null = null;

    if (isDashboardPage && roleUid) {
        const res = await fetch(`${process.env.API_BASE_URL}/api/v1/role/${roleUid}`, {
            method: "GET",
            headers: getAuthHeaders(token),
            cache: "no-store",
        });

        if (!res.ok) {
            if (isDashboardPage) return redirectAndClearAuth(new URL("/login", request.url));
            return response;
        }

        const json = await res.json();
        const menus = json?.data?.menus ?? [];
        allowedPrefixes = getAllowedPathPrefixes(menus);
    }

    const isSandboxMode = process.env.SIMULATOR === "sandbox";
    const isSandboxPath = pathname.startsWith("/dashboard/sandbox");
    const shouldBypassSandboxAccess = isSandboxMode && isSandboxPath;

    // RBAC check harus pakai data role terbaru, bukan cache localStorage/cookie.
    if (isDashboardPage && !isDashboardRoot && allowedPrefixes) {
        if (!shouldBypassSandboxAccess && !canAccessPath(allowedPrefixes, pathname)) {
            const fallback = allowedPrefixes[0] ?? "/dashboard";
            const redirectUrl = new URL(fallback, request.url);
            const redirectResponse = NextResponse.redirect(redirectUrl);
            redirectResponse.cookies.delete(ALLOWED_COOKIE);
            return redirectResponse;
        }
    }

    return response;
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
