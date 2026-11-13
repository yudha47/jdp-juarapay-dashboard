import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeReadJson } from "@/utils/safeReadJson";
import { getJsonAuthHeaders } from "../../../../../lib/upstreamHeaders";

export async function PUT(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await ctx.params;
    const body = await req.json();

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/device/updateCredential/${uid}`, {
        method: "PUT",
        headers: getJsonAuthHeaders(token),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const json = await safeReadJson(upstream);

    return NextResponse.json(json, {
        status: upstream.status,
    });
}
