import { useState } from "react";
import { getApiKeyInfo, getApiKeyRefresh } from "./server/apiKeyService";

export function useApiKeyLazy(merchantUid: string) {
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});
    const [subMerchantRegionMap, setSubMerchantRegionMap] = useState<Record<string, string>>({});

    const buildCacheKey = (type: "region" | "subMerchant", uid: string) =>
        `${type}:${uid}`;

    const setKeyLoading = (cacheKey: string, val: boolean) => setLoading((prev) => ({ ...prev, [cacheKey]: val }));
    const setKeyError = (cacheKey: string, val: string | null) => setError((prev) => ({ ...prev, [cacheKey]: val }));
    const setKeyValue = (cacheKey: string, val: string) => setKeys((prev) => ({ ...prev, [cacheKey]: val }));

    const fetchKey = async (uid: string, type: "region" | "subMerchant", regionUid?: string) => {
        const cacheKey = buildCacheKey(type, uid);
        if (keys[cacheKey] || loading[cacheKey]) return;

        if (type === "subMerchant" && !regionUid) {
            setKeyError(cacheKey, "regionUid diperlukan untuk subMerchant");
            return;
        }

        if (type === "subMerchant" && regionUid) {
            setSubMerchantRegionMap((prev) => ({ ...prev, [uid]: regionUid }));
        }

        setKeyLoading(cacheKey, true);
        setKeyError(cacheKey, null);

        try {
            const params =
                type === "region"
                    ? { merchantUid, regionUid: uid }
                    : { merchantUid, regionUid: regionUid as string, subMerchantUid: uid };

            const res = await getApiKeyInfo(params);
            if (res.errors) throw new Error(res.errors);
            setKeyValue(cacheKey, res.data ?? "");
        } catch (e) {
            setKeyError(cacheKey, (e as Error)?.message ?? "Failed to fetch API Key");
        } finally {
            setKeyLoading(cacheKey, false);
        }
    };

    const refreshKey = async (uid: string, type: "region" | "subMerchant") => {
        const cacheKey = buildCacheKey(type, uid);
        setKeyLoading(cacheKey, true);
        setKeyError(cacheKey, null);

        try {
            const refreshParams =
                type === "region"
                    ? { regionUid: uid }
                    : { subMerchantUid: uid };

            const refreshRes = await getApiKeyRefresh(refreshParams);
            if (refreshRes.errors) throw new Error(refreshRes.errors);

            const infoParams =
                type === "region"
                    ? { merchantUid, regionUid: uid }
                    : {
                          merchantUid,
                          regionUid: subMerchantRegionMap[uid],
                          subMerchantUid: uid,
                      };

            if (type === "subMerchant" && !infoParams.regionUid) {
                throw new Error("regionUid tidak ditemukan untuk subMerchant");
            }

            const infoRes = await getApiKeyInfo(infoParams as {
                merchantUid: string;
                regionUid: string;
                subMerchantUid?: string;
            });
            if (infoRes.errors) throw new Error(infoRes.errors);

            setKeyValue(cacheKey, infoRes.data ?? "");
        } catch (e) {
            setKeyError(cacheKey, (e as Error)?.message ?? "Failed to refresh API Key");
        } finally {
            setKeyLoading(cacheKey, false);
        }
    };

    const getKey = (uid: string, type: "region" | "subMerchant") =>
        keys[buildCacheKey(type, uid)] ?? null;
    const isLoading = (uid: string, type: "region" | "subMerchant") =>
        loading[buildCacheKey(type, uid)] ?? false;
    const getError = (uid: string, type: "region" | "subMerchant") =>
        error[buildCacheKey(type, uid)] ?? null;

    return { fetchKey, refreshKey, getKey, isLoading, getError };
}
