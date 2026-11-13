import { useState, useEffect, useCallback } from "react";
import { getApiKeyInfo, getApiKeyRefresh } from "./server/apiKeyService";

type ApiKeySearchType = "merchant" | "region" | "subMerchant";

export function useApiKeyInfo(search?: string, keySearch?: ApiKeySearchType, merchantUid?: string) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search?.trim() || !keySearch) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const params =
          keySearch === "merchant"
            ? { merchantUid: search }
            : keySearch === "region"
              ? { merchantUid: merchantUid, regionUid: search }
              : { merchantUid: merchantUid, subMerchantUid: search };

        const res = await getApiKeyInfo(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch API Key");
        setData(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [search, keySearch, merchantUid]);

  return { data, loading, error };
}

export function useApiKeyRefresh() {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshApiKey = useCallback(
    async (search: string, keySearch: ApiKeySearchType) => {
      if (!search?.trim() || !keySearch) {
        setError("Invalid search parameter");
        setData(null);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const params =
          keySearch === "merchant"
            ? { merchantUid: search.trim() }
            : keySearch === "region"
              ? { regionUid: search.trim() }
              : { subMerchantUid: search.trim() };

        const res = await getApiKeyRefresh(params);
        if (res.errors) throw new Error(res.errors);

        const refreshedKey = res.data ?? null;
        setData(refreshedKey);

        return refreshedKey;
      } catch (e) {
        const message = (e as Error)?.message ?? "Failed to refresh API Key";
        setError(message);
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, refreshApiKey };
}