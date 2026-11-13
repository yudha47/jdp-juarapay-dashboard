import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
import { CategoryModel, CategoryOrder, CategorySort, GetCategoryParams } from "../data/models/CategoryModel";
import { Pagination } from "../data/response/BaseResponse";
import { createCategory, deleteCategory, getCategory, updateCategory } from "./server/categoryService";
import { CategoryRequest } from "../data/request/CategoryRequest";

export function useCategories(initial?: Partial<GetCategoryParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<CategorySort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<CategoryOrder>(initial?.order ?? "desc");
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedQ = useDebounce(q, 400);

    const [items, setItems] = useState<CategoryModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetCategoryParams = useMemo(
        () => ({ page, limit, sort, order, q: debouncedQ || undefined }),
        [page, limit, sort, order, debouncedQ],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getCategory(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch categories");
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
    }, [debouncedQ, sort, order, limit]);

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
        setQ,
        refetch,
    };
}

export function useCreateCategory() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: CategoryRequest) => {
        setLoading(true);

        try {
            const res = await createCategory(payload);

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

export function useUpdateCategory() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: CategoryRequest) => {
        setLoading(true);

        try {
            const res = await updateCategory(uid, payload);

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

export function useDeleteCategory() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deleteCategory(uid);

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
