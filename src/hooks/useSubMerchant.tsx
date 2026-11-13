import { GetSubMerchantsParams, SubMerchantDetailedModel, SubMerchantKeySearch, SubMerchantModel, SubMerchantOrder, SubMerchantSort } from "@/data/models/SubMerchantModel";
import { Pagination } from "@/data/response/BaseResponse";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
import { createSubMerchant, getSubMerchant, getSubMerchantByUid, updateSubMerchant } from "./server/subMerchantService";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";

export function useSubMerchants(initial?: Partial<GetSubMerchantsParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<SubMerchantSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<SubMerchantOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<SubMerchantKeySearch>(initial?.searchBy ?? "subMerchantDesc");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<SubMerchantModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetSubMerchantsParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getSubMerchant(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch SubMerchants");
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
  }, [debouncedQ, sort, order, limit, searchBy]);

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
    setSearchBy,
    setQ,
    refetch,
  };
}

export function useSubMerchant(uid?: string) {
  const [data, setData] = useState<SubMerchantDetailedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getSubMerchantByUid(uid);
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
  }, [uid]);

  return { data, loading, error };
}

export function useCreateSubMerchant() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: SubMerchantRequest) => {
    setLoading(true);

    try {
      const res = await createSubMerchant(payload);

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

export function useUpdateSubMerchant() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: SubMerchantRequest) => {
    setLoading(true);

    try {
      const res = await updateSubMerchant(uid, payload);
      
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