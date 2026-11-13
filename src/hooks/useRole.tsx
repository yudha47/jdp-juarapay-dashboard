import { useEffect, useMemo, useState } from "react";
import { createRole, deleteRole, getRoleByUid, getRoles, updateRole } from "@/hooks/server/roleService"; // sesuaikan path
import { RoleDetailedModel, RoleModel } from "../data/models/RoleModel";
import { RoleRequest } from "../data/request/RoleRequest";
import { useDebounce } from "./useDebounce";

type RoleLite = { roleUid: string; roleDesc: string };
interface UseRolesParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    searchBy?: "isActive" | "roleDesc";
    q?: string;
}

export function useRoleMap() {
    const [roles, setRoles] = useState<RoleLite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getRoles({ page: 1, limit: 100, sort: "createdAt", order: "desc" });
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setRoles(res.data ?? []);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch roles");
                setRoles([]);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const roleMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const r of roles) map.set(r.roleUid, r.roleDesc);
        return map;
    }, [roles]);

    return { roleMap, roles, loading, error };
}

export function useRoles(params?: UseRolesParams) {
    const [roles, setRoles] = useState<RoleModel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ── Internal search state (dikendalikan dari luar via setQ/setSearchBy) ──
    const [q, setQ] = useState(params?.q ?? "");
    const [searchBy, setSearchBy] = useState<"isActive" | "roleDesc" | undefined>(params?.searchBy);

    const debouncedQ = useDebounce(q, 400);

    const refetch = () => setRefreshKey((k) => k + 1);

    useEffect(() => {
        let active = true;

        const fetchRoles = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getRoles({
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                    sort: params?.sort ?? "createdAt",
                    order: params?.order ?? "desc",
                    // ✅ Gunakan state internal, bukan props
                    searchBy: debouncedQ ? searchBy : undefined,
                    q: debouncedQ || undefined,
                });

                if (!active) return;
                if (res.errors) throw new Error(res.errors);

                setRoles(res.data ?? []);
                setTotal(res.pagination?.total ?? 0);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch roles");
                setRoles([]);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        };

        fetchRoles();

        return () => {
            active = false;
        };
        // ✅ debouncedQ & searchBy masuk dependency — fetch ulang saat search berubah
    }, [params?.page, params?.limit, params?.sort, params?.order, refreshKey, debouncedQ, searchBy]);

    return { roles, total, loading, error, refetch, q, setQ, searchBy, setSearchBy };
}

export function useRoleByUid(uid?: string) {
    const [data, setData] = useState<RoleDetailedModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getRoleByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch role");
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

export function useCreateRole() {
    const [loading, setLoading] = useState(false);

    const submit = async (payload: RoleRequest) => {
        setLoading(true);

        try {
            const res = await createRole(payload);

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

export function useUpdateRole() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (uid: string, payload: RoleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateRole(uid, payload);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
}

export function useDeleteRole() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deleteRole(uid);

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
