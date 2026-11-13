import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthHeaders, getJsonAuthHeaders } from "../../../lib/upstreamHeaders";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/service`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/service`, {
        method: "POST",
        headers: getJsonAuthHeaders(token),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}
