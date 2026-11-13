import { GetMerchantsParams, MerchantDetailedModel, MerchantModel, MerchantOrder, MerchantSort } from "@/data/models/MerchantModel";
import { Pagination } from "@/data/response/BaseResponse";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
import { createMerchant, getMerchant, getMerchantByUid, updateMerchant } from "./server/merchantService";
import { MerchantRequest } from "@/data/request/MerchantRequest";

export function useMerchants(initial?: Partial<GetMerchantsParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<MerchantSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<MerchantOrder>(initial?.order ?? "desc");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<MerchantModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetMerchantsParams = useMemo(
    () => ({ page, limit, sort, order, q: debouncedQ || undefined }),
    [page, limit, sort, order, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getMerchant(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch Merchants");
        setItems([]);
        setPagination(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [params, refreshKey]);
  
  const refetch = () => setRefreshKey((x) => x + 1);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, sort, order, limit]);

  return {
    items,
    pagination,
    loading,
    error,

    page,
    limit,
    sort,
    order,
    q,

    setPage,
    setLimit,
    setSort,
    setOrder,
    setQ,
    refetch,
  };
}

export function useMerchant(uid?: string) {
  const [data, setData] = useState<MerchantDetailedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getMerchantByUid(uid);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch merchant");
        setData(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [uid, refreshKey]);

  const refetch = () => setRefreshKey((x) => x + 1);

  return { data, loading, error, refetch };
}

export function useCreateMerchant() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: MerchantRequest) => {
    setLoading(true);

    try {
      const res = await createMerchant(payload);

      if (res.errors) {
        throw new Error(res.errors);
      }

      return res.data ?? null;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}

export function useUpdateMerchant() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: MerchantRequest) => {
    setLoading(true);

    try {
      const res = await updateMerchant(uid, payload);
      
      if (res.errors) {
        throw new Error(res.errors);
      }

      return res.data ?? null;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}