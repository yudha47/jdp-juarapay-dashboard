import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/data/response/BaseResponse";
import { useDebounce } from "./useDebounce";
import { GetDevicesParams, DeviceSort, DeviceOrder, DeviceKeySearch, DeviceModel } from "@/data/models/DeviceModel";
import { DeviceRequest } from "@/data/request/DeviceRequest";
import { getDevices, getDeviceByUid, createDevice, updateDevice, updateDeviceCredential } from "./server/deviceService";
import { DeviceCredentialRequest } from "../data/request/DeviceCredentialRequest";

export function useDevices(initial?: Partial<GetDevicesParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<DeviceSort>(initial?.sort ?? "createdAt");
  const [order, setOrder] = useState<DeviceOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<DeviceKeySearch>(initial?.searchBy ?? "roleDesc"); // NOTES::
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<DeviceModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetDevicesParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getDevices(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch Devices");
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

export function useDeviceByUid(uid?: string) {
  const [data, setData] = useState<DeviceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getDeviceByUid(uid);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setData(res.data ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch device");
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

export function useCreateDevice() {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: DeviceRequest) => {
    setLoading(true);

    try {
      const res = await createDevice(payload);

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

export function useUpdateDevice() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: DeviceRequest) => {
    setLoading(true);

    try {
      const res = await updateDevice(uid, payload);

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

export function useUpdateCredential() {
  const [loading, setLoading] = useState(false);

  const update = async (uid: string, payload: DeviceCredentialRequest) => {
    setLoading(true);

    try {
      const res = await updateDeviceCredential(uid, payload);

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