import type { Pagination } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";

import { useDebounce } from "./useDebounce";
import { GetPpnParams, PpnModel, PpnOrder, PpnSearchBy, PpnSort } from "../data/models/PpnModel";
import { createPpn, deletePpn, getPpn, getPpnByUid, updatePpn } from "./server/ppnService";
import { PpnRequest } from "../data/request/PpnRequest";

export function usePpns(initial?: Partial<GetPpnParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<PpnSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<PpnOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<PpnSearchBy | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<PpnModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetPpnParams = useMemo(
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
                const res = await getPpn(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch PPN");
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

export function useCreatePpn() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: PpnRequest) => {
        setLoading(true);

        try {
            const res = await createPpn(payload);

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

export function usePpn(uid?: string) {
    const [data, setData] = useState<PpnModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPpnByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch payment gateway");
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

export function useUpdatePpn() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: PpnRequest) => {
        setLoading(true);

        try {
            const res = await updatePpn(uid, payload);

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

export function useDeletePpn() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deletePpn(uid);

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
