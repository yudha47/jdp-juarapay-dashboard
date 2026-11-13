import {
    GetWithdrawsParams,
    WithdrawDetailModel,
    WithdrawKeySearch,
    WithdrawModel,
    WithdrawOrder,
    WithdrawSort,
} from "@/data/models/WithdrawModel";
import { Pagination } from "@/data/response/BaseResponse";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
import {
    createWithdraw,
    deleteWithdraw,
    getWithdrawByUid,
    getWithdraws,
    getWithdrawSaldo,
    updateWithdraw,
} from "./server/withdrawService";
import { WithdrawalRequest } from "@/data/request/WithdrawalRequest";
import { WithdrawalUpdateRequest } from "@/data/request/WithdrawalUpdateRequest";

export function useWithdraws(initial?: Partial<GetWithdrawsParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<WithdrawSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<WithdrawOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<WithdrawKeySearch | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<WithdrawModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetWithdrawsParams = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            searchBy: debouncedQ ? searchBy : undefined,
            q: debouncedQ || undefined,
        }),
        [page, limit, sort, order, searchBy, debouncedQ],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getWithdraws(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Withdraws");
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

export function useWithdraw(uid: string, options?: { enabled?: boolean }) {
    const enabled = options?.enabled ?? true;
    const [data, setData] = useState<WithdrawDetailModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !uid) {
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
                const res = await getWithdrawByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Withdraw");
                setData(null);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [enabled, uid]);

    return { data, loading, error };
}

export function useCreateWithdraw() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: WithdrawalRequest) => {
        setLoading(true);

        try {
            const res = await createWithdraw(payload);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading };
}

export function useUpdateWithdraw() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: WithdrawalUpdateRequest) => {
        setLoading(true);

        try {
            const res = await updateWithdraw(uid, payload);

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

export function useDeleteWithdraw() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deleteWithdraw(uid);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { remove, loading };
}

export function useWithdrawSaldo() {
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Tambahkan refreshKey untuk trigger manual refetch
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getWithdrawSaldo();
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Withdraw");
                setData(null);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
        // 2. Masukkan refreshKey ke dependency array
    }, [refreshKey]);

    // 3. Buat fungsi refetch yang menaikkan counter refreshKey
    const refetch = () => setRefreshKey((prev) => prev + 1);

    return {
        data,
        loading,
        error,
        refetch,
    };
}
