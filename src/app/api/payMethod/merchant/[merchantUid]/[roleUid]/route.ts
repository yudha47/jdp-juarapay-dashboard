import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthHeaders } from "../../../../../../lib/upstreamHeaders";

type Params = {
    params: Promise<{
        merchantUid: string;
        roleUid: string;
    }>;
};

export async function GET(req: Request, { params }: Params) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ status: 401, errors: "Unauthorized" }, { status: 401 });
    }

    const { merchantUid, roleUid } = await params;

    const upstream = await fetch(`${process.env.API_BASE_URL}/api/v1/payMethod/merchant/${merchantUid}/${roleUid}`, {
        method: "GET",
        headers: getAuthHeaders(token),
        cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
}
