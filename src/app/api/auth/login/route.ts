import { NextResponse } from "next/server";
import { getJsonHeaders } from "../../../../lib/upstreamHeaders";

export async function POST(req: Request) {
    const body = await req.json();

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const json = await upstream.json();

    const res = NextResponse.json(json, { status: upstream.status });

    // kalau sukses dan ada token, simpan ke cookie
    const token = json?.data?.token;
    const roleUid = json?.data?.user?.roleUid;

    if (upstream.ok && token) {
        res.cookies.set("access_token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
        });

        if (roleUid) {
            res.cookies.set("role_uid", roleUid, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            });
        }

        // optional: hapus role_desc biar refetch sesuai role terbaru
        res.cookies.delete("role_desc");
    }

    return res;
}

// Optional: handle preflight jika diperlukan (biasanya same-origin tidak perlu,
// tapi aman kalau ada kasus tertentu)
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
