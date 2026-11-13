import type { Pagination } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";

import { useDebounce } from "./useDebounce";
import {
    GetPricesParams,
    PriceDetailModel,
    PriceModel,
    PriceOrder,
    PriceSearchBy,
    PriceSort,
} from "../data/models/PriceModel";
import { createPrice, deletePrice, getPriceByUid, getPrices, updatePrice } from "./server/priceService";
import { PriceRequest } from "../data/request/PriceRequest";

export function usePrices(initial?: Partial<GetPricesParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<PriceSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<PriceOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<PriceSearchBy | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");
    const [merchantUid, setMerchantUid] = useState(initial?.merchantUid ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<PriceModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetPricesParams = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            searchBy: debouncedQ ? searchBy : undefined,
            q: debouncedQ || undefined,
            merchantUid,
        }),
        [page, limit, sort, order, searchBy, debouncedQ, merchantUid],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPrices(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch price");
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
        merchantUid,

        setPage,
        setLimit,
        setSort,
        setOrder,
        setSearchBy,
        setQ,
        refetch,
        setMerchantUid,
    };
}

export function useCreatePrice() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: PriceRequest) => {
        setLoading(true);

        try {
            const res = await createPrice(payload);

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

export function usePrice(uid?: string) {
    const [data, setData] = useState<PriceDetailModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPriceByUid(uid);
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

export function useUpdatePrice() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: PriceRequest) => {
        setLoading(true);

        try {
            const res = await updatePrice(uid, payload);

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

export function useDeletePrice() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deletePrice(uid);

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
