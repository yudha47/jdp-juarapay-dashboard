"use client";

import { useRouter } from "next/navigation";
import MerchantDetailPage from "./components/MerchantDetailPage";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { useApiKeyInfo, useApiKeyRefresh } from "@/hooks/useApiKeyInfo";
import { useState } from "react";

export default function MerchantClientWrapper({
  merchant,
}: {
  merchant: MerchantDetailedModel;
}) {
  const router = useRouter();

  const { data: apikey } = useApiKeyInfo(merchant.merchantUid, "merchant");

  const {
    data: refreshedApiKey,
    loading: refreshLoading,
    error: refreshError,
    refreshApiKey,
  } = useApiKeyRefresh();

  const [newKey, setNewKey] = useState<string | null>(null);

  const handleRefreshApiKey = async () => {
    const key = await refreshApiKey(merchant.merchantUid, "merchant");
    setNewKey(key);
  };

  const displayedApiKey = newKey ?? refreshedApiKey ?? apikey ?? "-";


  return (
    <MerchantDetailPage
      merchant={merchant}
      onRefresh={() => router.refresh()}
      onRefreshApiKey={handleRefreshApiKey}
      apiKey={displayedApiKey}
      apiKeyLoading={refreshLoading}
      apiKeyError={refreshError}
    />
  );
}