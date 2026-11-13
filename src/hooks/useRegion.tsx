import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/data/response/BaseResponse";
import { useDebounce } from "./useDebounce";
import { GetRegionsParams, RegionSort, RegionOrder, RegionModel, RegionDetailedModel, RegionKeySearch } from "@/data/models/RegionModel";
import { createRegion, getRegionByUid, getRegions, updateRegion } from "./server/regionService";
import { RegionRequest } from "@/data/request/RegionRequest";

export function useRegions(initial?: Partial<GetRegionsParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<RegionSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<RegionOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<RegionKeySearch>(initial?.searchBy ?? "regionDesc");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<RegionModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetRegionsParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getRegions(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch Regions");
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
    searchBy,
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

export function useRegionByUid(uid?: string) {
  const [data, setData] = useState<RegionDetailedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getRegionByUid(uid);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch region");
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

export function useCreateRegion() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: RegionRequest) => {
    setLoading(true);

    try {
      const res = await createRegion(payload);

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

export function useUpdateRegion() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: RegionRequest) => {
    setLoading(true);

    try {
      const res = await updateRegion(uid, payload);
      
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