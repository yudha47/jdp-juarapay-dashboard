import type {
    GetPaymentGatewayParams,
    PaymentGatewaySort,
    PaymentGatewayOrder,
    PaymentGatewayModel,
    PaymentGatewaySearchBy,
} from "@/data/models/PaymentGatewayModel";
import type { Pagination } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";

import { useDebounce } from "./useDebounce";
import { PaymentGatewayRequest } from "@/data/request/PaymentGatewayRequest";
import {
    createPaymentGateway,
    deletePaymentGateway,
    getPaymentGateway,
    getPaymentGatewayByUid,
    updatePaymentGateway,
} from "./server/paymentGatewayService";

export function usePaymentGateways(initial?: Partial<GetPaymentGatewayParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<PaymentGatewaySort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<PaymentGatewayOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<PaymentGatewaySearchBy | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<PaymentGatewayModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetPaymentGatewayParams = useMemo(
        () => ({
            page,
            limit,
            sort,
            order,
            // ✅ Auto-detect: angka → pgCode, huruf → pgDesc
            searchBy: debouncedQ ? (/^\d+$/.test(debouncedQ) ? "pgCode" : "pgDesc") : undefined,
            q: debouncedQ || undefined,
        }),
        [page, limit, sort, order, debouncedQ],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPaymentGateway(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch payment gateways");
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

export function useCreatePaymentGateway() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: PaymentGatewayRequest) => {
        setLoading(true);

        try {
            const res = await createPaymentGateway(payload);

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

export function usePaymentGateway(uid?: string) {
    const [data, setData] = useState<PaymentGatewayModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPaymentGatewayByUid(uid);
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

export function useUpdatePaymentGateway() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: PaymentGatewayRequest) => {
        setLoading(true);

        try {
            const res = await updatePaymentGateway(uid, payload);

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

export function useDeletePaymentGateway() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deletePaymentGateway(uid);

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
