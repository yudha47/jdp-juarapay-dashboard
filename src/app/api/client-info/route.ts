import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ ip: "127.0.0.1" });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? headersList.get("x-real-ip") ?? "0.0.0.0";
    return NextResponse.json({ ip });
}
