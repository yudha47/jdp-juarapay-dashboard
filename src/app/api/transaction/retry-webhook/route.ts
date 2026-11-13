import { getJsonAuthHeaders } from "@/lib/upstreamHeaders";
import { safeReadJson } from "@/utils/safeReadJson";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/transaction/retryWebhook`, {
        method: "PUT",
        headers: getJsonAuthHeaders(token),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const json = await safeReadJson(upstream);

    if (!json) {
        return NextResponse.json(
            { status: upstream.ok ? 200 : upstream.status, message: "No response body" },
            { status: upstream.status },
        );
    }

    return NextResponse.json(json, { status: upstream.status });
}
