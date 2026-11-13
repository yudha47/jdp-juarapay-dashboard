import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthHeaders } from "../../../../lib/upstreamHeaders";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/report/period`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}
