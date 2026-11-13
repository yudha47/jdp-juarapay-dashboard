/* eslint-disable react-hooks/set-state-in-effect */
import { GetReportTrxPerMonthsParams, ReportTrxPerMonthSort, ReportTrxPerMonthOrder, ReportTrxPerMothSearchBy, ReportTrxPerMonthModel, ReportPeriodModel } from "@/data/models/ReportTrxPerMonthModel";
import { Pagination } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";
import { getReportPaymentMethodsPerMonths, getReportPelimpahan, getReportPeriods, getReportTrxPerMonths } from "./server/reportService";
import { useDebounce } from "./useDebounce";
import { ReportPaymentMethodKeySearch, ReportPaymentMethodModel, ReportPaymentMethodOrder, ReportPaymentMethodSort } from "@/data/models/ReportPaymentMethodModel";
import { GetReportPaymentMethodsParams } from "@/data/models/ReportPaymentMethodModel";
import { GetReportPelimpahanParams, ReportPelimpahanModel, ReportPelimpahanOrder, ReportPelimpahanSearchBy, ReportPelimpahanSort } from "../data/models/ReportPelimpahanModel";
import { get } from "http";

export function useReportTrxPerMonth(initial?: Partial<GetReportTrxPerMonthsParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<ReportTrxPerMonthSort>(initial?.sort ?? "period");
  const [order, setOrder] = useState<ReportTrxPerMonthOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<ReportTrxPerMothSearchBy>(initial?.searchBy ?? "period");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<ReportTrxPerMonthModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetReportTrxPerMonthsParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getReportTrxPerMonths(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch ReportTrxPerMonths");
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

export function useReportPeriods() {
  const [items, setItems] = useState<ReportPeriodModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getReportPeriods();
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch ReportPeriods");
        setItems([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return {
    items,
    loading,
    error,
  };
}

export function useReportPaymentMethodsPerMonth(initial?: Partial<GetReportPaymentMethodsParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<ReportPaymentMethodSort>(initial?.sort ?? "period");
  const [order, setOrder] = useState<ReportPaymentMethodOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<ReportPaymentMethodKeySearch>(initial?.searchBy ?? "period");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<ReportPaymentMethodModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetReportPaymentMethodsParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getReportPaymentMethodsPerMonths(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch ReportPaymentMethodsPerMonths");
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

export function useReportPelimpahan(initial?: Partial<GetReportPelimpahanParams>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sort, setSort] = useState<ReportPelimpahanSort>(initial?.sort ?? "period");
  const [order, setOrder] = useState<ReportPelimpahanOrder>(initial?.order ?? "desc");
  const [searchBy, setSearchBy] = useState<ReportPelimpahanSearchBy>(initial?.searchBy ?? "period");
  const [q, setQ] = useState(initial?.q ?? "");

  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedQ = useDebounce(q, 400);

  const [items, setItems] = useState<ReportPelimpahanModel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params: GetReportPelimpahanParams = useMemo(
    () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
    [page, limit, sort, order, searchBy, debouncedQ]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getReportPelimpahan(params);
        if (!active) return;

        if (res.errors) throw new Error(res.errors);

        setItems(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (e) {
        if (!active) return;
        setError((e as Error)?.message ?? "Failed to fetch ReportPelimpahan");
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
