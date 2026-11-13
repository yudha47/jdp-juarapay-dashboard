import {
    GetTransactionsParams,
    TransactionSort,
    TransactionOrder,
    TransactionKeySearch,
    TransactionModel,
    TransactionDetailedModel,
    TransactionFilterBy,
} from "@/data/models/TransactionModel";
import { Pagination, PaginatedResponse } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";
import { getTransactionByUid, getTransactionDetailList, getTransactions, retryWebhook, updatePelimpahan } from "./server/transactionService";
import { useDebounce } from "./useDebounce";
import {
    GetTransactionDLParams,
    TransactionDetail,
    TransactionDLFilterBy,
    TransactionDLKeySearch,
    TransactionDLOrder,
    TransactionDLSort,
} from "@/data/models/TransactionDetailListModel";
import { PelimpahanRequest } from "../data/request/PelimpahanRequest";
import { RetryWebhookRequest } from "../data/request/RetryWebhookRequest";

export function useTransactions(initial?: Partial<GetTransactionsParams & { endDate?: string }>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<TransactionSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<TransactionOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<TransactionKeySearch>(initial?.searchBy ?? "transactionNumber");
    const [q, setQ] = useState(initial?.q ?? "");
    const [endDate, setEndDate] = useState(initial?.endDate ?? ""); // ← tambah
    const [merchantId, setMerchantId] = useState(initial?.merchantId ?? "");
    const [filterBy, setFilterBy] = useState<TransactionFilterBy>(initial?.filterBy ?? "merchantId");
    const [id, setId] = useState(initial?.id ?? "");

    const [refreshKey, setRefreshKey] = useState(0);
    const debouncedQ = useDebounce(q, 400);
    const debouncedEndDate = useDebounce(endDate, 400); // ← debounce juga

    const [items, setItems] = useState<TransactionModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            searchBy,
            q: debouncedQ || undefined,
            endDate: debouncedEndDate || undefined, // ← kirim ke API
            merchantId: merchantId || undefined,
            filterBy,
            id,
        }),
        [page, limit, sort, order, searchBy, debouncedQ, debouncedEndDate, merchantId, filterBy, id],
    );

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getTransactions(params);
                if (!active) return;
                if (res.errors) throw new Error(res.errors);
                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Transactions");
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
    }, [debouncedQ, debouncedEndDate, sort, order, limit, searchBy, merchantId, filterBy, id]);

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
        endDate,
        merchantId,
        filterBy,
        id,
        setPage,
        setLimit,
        setSort,
        setOrder,
        setSearchBy,
        setQ,
        setEndDate,
        setMerchantId,
        setFilterBy,
        setId,
        refetch,
    };
}

export function useTransaction(uid?: string) {
    const [data, setData] = useState<TransactionDetailedModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;
        if (!uid) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getTransactionByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch transaction");
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

export function useTransactionDetailList(initial?: Partial<GetTransactionDLParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<TransactionDLSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<TransactionDLOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<TransactionDLKeySearch>(initial?.searchBy ?? "transactionNumber");
    const [q, setQ] = useState(initial?.q ?? "");
    const [merchantId, setMerchantId] = useState(initial?.merchantId ?? "");
    const [filterBy, setFilterBy] = useState<TransactionDLFilterBy | undefined>(initial?.filterBy);
    const [id, setId] = useState(initial?.id ?? "");
    const [endDate, setEndDate] = useState(initial?.endDate ?? "");
    const [isWithdraw, setIsWithdraw] = useState<"Y" | "N" | undefined>(initial?.isWithdraw);
    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);
    const debouncedId = useDebounce(id, 400);

    const [items, setItems] = useState<TransactionDetail[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetTransactionDLParams = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            searchBy,
            q: debouncedQ || undefined,
            merchantId: merchantId || undefined,
            filterBy,
            id: debouncedId || undefined,
            endDate: endDate || undefined,
            isWithdraw,
        }),
        [page, limit, sort, order, searchBy, debouncedQ, merchantId, filterBy, debouncedId, endDate, isWithdraw],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getTransactionDetailList(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Transactions");
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
    }, [debouncedQ, sort, order, limit, searchBy, filterBy, debouncedId, endDate, isWithdraw]);

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
        merchantId,
        filterBy,
        id,
        endDate,
        isWithdraw,

        setPage,
        setLimit,
        setSort,
        setOrder,
        setSearchBy,
        setQ,
        setMerchantId,
        refetch,
        setFilterBy,
        setId,
        setEndDate,
        setIsWithdraw,
    };
}

interface UseTransactionReportOptions {
    manual?: boolean;
}

export function useTransactionReport(initial?: Partial<GetTransactionDLParams>, options?: UseTransactionReportOptions) {
    const manual = options?.manual ?? false;

    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<TransactionDLSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<TransactionDLOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<TransactionDLKeySearch>(initial?.searchBy ?? "createdAt");
    const [q, setQ] = useState(initial?.q ?? "");
    const [endDate, setEndDate] = useState(initial?.endDate ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<TransactionDetail[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetTransactionDLParams = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            searchBy,
            q: debouncedQ || undefined,
            endDate: endDate || undefined,
        }),
        [page, limit, sort, order, searchBy, debouncedQ, endDate],
    );

    const fetchReport = async (override?: Partial<GetTransactionDLParams>) => {
        setLoading(true);
        setError(null);

        try {
            const mergedParams: GetTransactionDLParams = {
                page: override?.page ?? params.page,
                limit: override?.limit ?? params.limit,
                sort: override?.sort ?? params.sort,
                order: override?.order ?? params.order,
                searchBy: override?.searchBy ?? params.searchBy,
                q: override?.q ?? params.q,
                endDate: override?.endDate ?? params.endDate,
            };

            const MAX_LIMIT = 100;

            if (mergedParams.limit > MAX_LIMIT) {
                const baseParams: GetTransactionDLParams = {
                    ...mergedParams,
                    page: 1,
                    limit: MAX_LIMIT,
                };

                const first = await getTransactionDetailList({ ...baseParams, page: 1 });

                if (first.errors) throw new Error(first.errors);

                const total = first.pagination?.total ?? 0;

                if (total <= MAX_LIMIT) {
                    setItems(first.data ?? []);
                    setPagination(first.pagination ?? null);
                    return first;
                }

                const totalPages = first.pagination?.totalPages ?? 1;
                let allData = first.data ?? [];
                let lastPagination = first.pagination;

                for (let p = 2; p <= totalPages; p++) {
                    const res = await getTransactionDetailList({ ...baseParams, page: p });

                    if (res.errors) throw new Error(res.errors);

                    allData = allData.concat(res.data ?? []);
                    lastPagination = res.pagination ?? lastPagination;
                }

                const merged: PaginatedResponse<TransactionDetail[]> = {
                    ...first,
                    data: allData,
                    pagination: lastPagination,
                };

                setItems(allData);
                setPagination(lastPagination ?? null);

                return merged;
            }

            const res = await getTransactionDetailList(mergedParams);

            if (res.errors) throw new Error(res.errors);

            setItems(res.data ?? []);
            setPagination(res.pagination ?? null);

            return res;
        } catch (e) {
            const message = (e as Error)?.message ?? "Failed to fetch transactions report";
            setError(message);
            setItems([]);
            setPagination(null);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (manual) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getTransactionDetailList(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch transactions report");
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
    }, [params, refreshKey, manual]);

    const refetch = () => setRefreshKey((x) => x + 1);

    useEffect(() => {
        if (manual) return;
        setPage(1);
    }, [debouncedQ, sort, order, limit, searchBy, endDate, manual]);

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
        endDate,

        setPage,
        setLimit,
        setSort,
        setOrder,
        setSearchBy,
        setQ,
        setEndDate,
        refetch,
        fetchReport,
    };
}

export function useUpdatePelimpahan() {
    const [loading, setLoading] = useState(false);

    const update = async (payload: PelimpahanRequest) => {
        setLoading(true);

        try {
            const res = await updatePelimpahan(payload);

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

export function useResetWebhook() {
    const [loading, setLoading] = useState(false);

    const reset = async (payload: RetryWebhookRequest) => {
        setLoading(true);

        try {
            const res = await retryWebhook(payload);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { reset, loading };
}


