import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/data/response/BaseResponse";
import { useDebounce } from "./useDebounce";
import { GetClustersParams, ClusterSort, ClusterOrder, ClusterKeySearch, ClusterModel, ClusterDetailedModel } from "@/data/models/ClusterModel";
import { ClusterRequest } from "@/data/request/ClusterRequest";
import { getClusters, getClusterByUid, createCluster, updateCluster } from "./server/clusterService";

export function useClusters(initial?: Partial<GetClustersParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<ClusterSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<ClusterOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<ClusterKeySearch>(initial?.searchBy ?? "clusterDesc");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<ClusterModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetClustersParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getClusters(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch Clusters");
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

export function useClusterByUid(uid?: string) {
  const [data, setData] = useState<ClusterDetailedModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getClusterByUid(uid);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch cluster");
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

export function useCreateCluster() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: ClusterRequest) => {
    setLoading(true);

    try {
      const res = await createCluster(payload);

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

export function useUpdateCluster() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: ClusterRequest) => {
    setLoading(true);

    try {
      const res = await updateCluster(uid, payload);
      
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