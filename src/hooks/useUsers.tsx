/* eslint-disable react-hooks/set-state-in-effect */
import type { GetUsersParams, UserSort, UserOrder, UserModel, UserDetailedModel, UserSearchKey } from "@/data/models/UserModel";
import type { Pagination } from "@/data/response/BaseResponse";
import { useState, useMemo, useEffect } from "react";
import { createUser, deleteUser, getUserByUid, getUsers, updateUser, updateUserPass } from "./server/userService";
import { useDebounce } from "./useDebounce";
import { UserRequest } from "@/data/request/UserRequest";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import { UserPassRequest } from "../data/request/UserPassRequest";

export function useUsers(initial?: Partial<GetUsersParams>) {
    const [page, setPage] = useState(initial?.page ?? 1);
    const [limit, setLimit] = useState(initial?.limit ?? 10);
    const [sort, setSort] = useState<UserSort>(initial?.sort ?? "createdAt");
    const [order, setOrder] = useState<UserOrder>(initial?.order ?? "desc");
    const [searchBy, setSearchBy] = useState<UserSearchKey>(initial?.searchBy ?? "fullName");
    const [q, setQ] = useState(initial?.q ?? "");

    const [refreshKey, setRefreshKey] = useState(0);

    // Filter isActive memakai nilai 1 karakter ("Y"/"N"), jadi jangan diabaikan oleh min length.
    const debouncedQ = useDebounce(q, 400, searchBy === "isActive" ? 1 : 3);

    const [items, setItems] = useState<UserModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params: GetUsersParams = useMemo(
        () => ({ page, limit, sort, order, searchBy, q: debouncedQ || undefined }),
        [page, limit, sort, order, searchBy, debouncedQ],
    );

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getUsers(params);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setItems(res.data ?? []);
                setPagination(res.pagination ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch users");
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
        searchBy,

        setPage,
        setLimit,
        setSort,
        setOrder,
        setSearchBy,
        setQ,
        refetch,
    };
}

export function useCreateUser() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: UserRequest) => {
        setLoading(true);

        try {
            const res = await createUser(payload);

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

export function useUser(uid?: string, options?: { enabled?: boolean }) {
    const enabled = options?.enabled ?? true;
    const [data, setData] = useState<UserDetailedModel | null>(null);
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
                const res = await getUserByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch user");
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

export function useUpdateUser() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: UserUpdateRequest) => {
        setLoading(true);

        try {
            const res = await updateUser(uid, payload);

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

export function useDeleteUser() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deleteUser(uid);

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

export function useUpdateUserPass() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: UserPassRequest) => {
        setLoading(true);

        try {
            const res = await updateUserPass(uid, payload);

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
