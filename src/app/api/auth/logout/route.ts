import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthHeaders } from "../../../../lib/upstreamHeaders";

const ALLOWED_COOKIE = "allowed_prefixes";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    // Panggil backend logout (kalau token ada)
    if (token) {
        try {
            await fetch(`${process.env.API_BASE_URL}/api/v1/auth/logout`, {
                method: "POST",
                headers: getAuthHeaders(token),
                cache: "no-store",
            });
        } catch {
            // kalau gagal, tetap lanjut hapus cookie
        }
    }

    const response = NextResponse.json({ status: 200 });

    // Hapus semua cookie auth
    response.cookies.delete("access_token");
    response.cookies.delete("role_uid");
    response.cookies.delete("role_desc");
    response.cookies.delete(ALLOWED_COOKIE);

    return response;
}
