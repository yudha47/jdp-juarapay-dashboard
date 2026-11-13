import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/data/response/BaseResponse";
import { useDebounce } from "./useDebounce";
import { GetSitesParams, SiteSort, SiteOrder, SiteKeySearch, SiteModel, SiteDetailedModel } from "@/data/models/SiteModel";
import { SiteRequest } from "@/data/request/SiteRequest";
import { getSites, getSiteByUid, createSite, updateSite } from "./server/siteService";

export function useSites(initial?: Partial<GetSitesParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<SiteSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<SiteOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<SiteKeySearch>(initial?.searchBy ?? "siteDesc");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<SiteModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetSitesParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getSites(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch Sites");
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

export function useSiteByUid(uid?: string) {
  const [data, setData] = useState<SiteDetailedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getSiteByUid(uid);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch site");
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

export function useCreateSite() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: SiteRequest) => {
    setLoading(true);

    try {
      const res = await createSite(payload);

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

export function useUpdateSite() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: SiteRequest) => {
    setLoading(true);

    try {
      const res = await updateSite(uid, payload);
      
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