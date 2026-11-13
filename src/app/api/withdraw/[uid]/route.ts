import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeReadJson } from "@/utils/safeReadJson";
import { getAuthHeaders } from "../../../../lib/upstreamHeaders";

export async function GET(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await ctx.params;

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/withdraw/${uid}`, {
        method: "GET",
        headers: getAuthHeaders(token),
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

export async function PUT(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await ctx.params;

    // ✅ Parse sebagai FormData, lalu forward ke BE
    const formData = await req.formData();

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/withdraw/update/${uid}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: formData,
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

export async function DELETE(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await ctx.params;

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/withdraw/delete/${uid}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}
