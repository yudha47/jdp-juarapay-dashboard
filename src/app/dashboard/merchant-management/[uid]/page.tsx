import { cookies } from "next/headers";
import MerchantClientWrapper from "./MerchantClientWrapper";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { getAuthHeaders } from "../../../../lib/upstreamHeaders";

interface PageProps {
  params: { uid: string };
}

async function getMerchant(uid: string, token: string): Promise<MerchantDetailedModel | null> {
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/merchant/${uid}`, {
    method: "GET",
    headers: getAuthHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data ?? null) as MerchantDetailedModel | null;
}


export default async function MerchantPage({ params }: PageProps) {
  const { uid } = await params;
  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return <div>Unauthorized</div>;
  }

  const merchant = await getMerchant(uid, token);

  if (!merchant) {
    return <div>Merchant not found</div>;
  }

  return (
    <MerchantClientWrapper
      merchant={merchant}
    />
  );
}