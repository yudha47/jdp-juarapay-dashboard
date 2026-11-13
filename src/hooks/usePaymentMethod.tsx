import {
    GetPaymentMethodByMerchantParams,
    GetPaymentMethodsParams,
    PaymentMethodByMerchantModel,
    PaymentMethodDetailModel,
    PaymentMethodModel,
    PaymentMethodOrder,
    PaymentMethodSearchBy,
    PaymentMethodSort,
} from "@/data/models/PaymentMethodModel";
import { useEffect, useMemo, useState } from "react";
import {
    createPaymentMethod,
    deletePaymentMethod,
    getMdr,
    getPaymentMethodByMerchant,
    getPaymentMethodByUid,
    getPaymentMethods,
    updatePaymentMethod,
} from "./server/paymentMethodService";
import { Pagination } from "@/data/response/BaseResponse";
import { useDebounce } from "./useDebounce";
import { PaymentMethodRequest } from "../data/request/PaymentMethodRequest";
import { GetMdrParams, MdrModel, MdrOrder, MdrSearchBy, MdrSort } from "../data/models/MdrModel";

// Tambahkan searchBy ke hook ini
// File: hooks/usePaymentMethod.ts (bagian usePaymentMethods saja yang perlu diupdate)

export function usePaymentMethods(initial?: Partial<GetPaymentMethodsParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<PaymentMethodSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<PaymentMethodOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<PaymentMethodSearchBy | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<PaymentMethodModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetPaymentMethodsParams = useMemo(
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
                const res = await getPaymentMethods(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Payment Methods");
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

export function usePaymentMethod(uid: string, options?: { enabled?: boolean }) {
    const enabled = options?.enabled ?? true;
    const [data, setData] = useState<PaymentMethodDetailModel | null>(null);
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
                const res = await getPaymentMethodByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Payment Method");
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

export function useCreatePaymentMethod() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: PaymentMethodRequest) => {
        setLoading(true);

        try {
            const res = await createPaymentMethod(payload);

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

export function useUpdatePaymetMethod() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: PaymentMethodRequest) => {
        setLoading(true);

        try {
            const res = await updatePaymentMethod(uid, payload);

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

export function useDeletePaymentMethod() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deletePaymentMethod(uid);

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

export function usePaymentMethodByMerchant(params: GetPaymentMethodByMerchantParams) {
    const { merchantUid, roleUid } = params;

    const [data, setData] = useState<PaymentMethodByMerchantModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!merchantUid) return;
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPaymentMethodByMerchant({ merchantUid, roleUid });
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? []);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch Payment Methods by Merchant");
                setData([]);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [merchantUid, roleUid, refreshKey]);

    const refetch = () => setRefreshKey((x) => x + 1);

    return { data, loading, error, refetch };
}

export function useMdr(initial?: Partial<GetMdrParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<MdrSort>(initial?.sort ?? "catDesc");
    const [order, setOrder] = useState<MdrOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<MdrSearchBy | undefined>(initial?.searchBy);
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<MdrModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetMdrParams = useMemo(
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
                const res = await getMdr(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch MDR");
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
