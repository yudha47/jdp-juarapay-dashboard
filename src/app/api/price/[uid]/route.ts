import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeReadJson } from "@/utils/safeReadJson";
import { getAuthHeaders, getJsonAuthHeaders } from "../../../../lib/upstreamHeaders";

export async function GET(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const { uid } = await ctx.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/price/${uid}`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ uid: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { uid } = await ctx.params;

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/price/update/${uid}`, {
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

type Context = {
    params: Promise<{
        uid: string;
    }>;
};

export async function DELETE(request: Request, context: Context) {
    try {
        const { uid } = await context.params;

        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
        }

        const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/price/delete/${uid}`, {
            method: "DELETE",
            headers: getAuthHeaders(token),
            cache: "no-store",
        });

        let data = null;
        try {
            data = await upstream.json();
        } catch {
            data = null;
        }

        return NextResponse.json(data ?? { success: true }, { status: upstream.status });
    } catch (error) {
        console.error("DELETE payment method error:", error);
        return NextResponse.json({ status: 500, errors: "Internal Server Error" }, { status: 500 });
    }
}
