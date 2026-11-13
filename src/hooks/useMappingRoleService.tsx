// hooks/useMappingRoleService.ts
import { useEffect, useState } from "react";
import {
    createMappingRoleService,
    deleteMappingRoleService,
    getMappingRoleService,
    getMappingRoleServiceByUid,
    updateMappingRoleService,
} from "./server/mappingRoleService";
import { getRoles } from "./server/roleService";
import { getServices } from "./server/serviceService";
import { MappingRoleEnriched, MappingRoleServiceModel } from "../data/models/MappingRoleServiceModel";
import { RoleModel } from "../data/models/RoleModel";
import { ServiceModel } from "../data/models/ServiceModel";
import { MappingRoleServiceRequest } from "../data/request/MappingRoleServiceRequest";

export function useMappingRoleService() {
    const [mappingData, setMappingData] = useState<MappingRoleServiceModel[]>([]);
    const [enrichedData, setEnrichedData] = useState<MappingRoleEnriched[]>([]);
    const [roles, setRoles] = useState<RoleModel[]>([]);
    const [services, setServices] = useState<ServiceModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trigger, setTrigger] = useState(0); // ✅ tambah trigger

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [mappingRes, rolesRes, servicesRes] = await Promise.all([
                    getMappingRoleService(),
                    getRoles({
                        page: 1,
                        limit: 100,
                        sort: "createdAt",
                        order: "desc",
                    }),
                    getServices(),
                ]);

                if (mappingRes.errors) throw new Error(mappingRes.errors);
                if (rolesRes.errors) throw new Error(rolesRes.errors);
                if (servicesRes.errors) throw new Error(servicesRes.errors);

                const mapping = mappingRes.data ?? [];
                const rolesData = rolesRes.data ?? [];
                const servicesData = servicesRes.data ?? [];

                // Simpan raw mapping
                setMappingData(mapping);

                // Lookup map
                const roleMap = new Map(rolesData.map((r) => [r.roleUid, r.roleDesc]));

                const serviceMap = new Map(servicesData.map((s) => [s.serviceUid, s.serviceDesc]));

                // Enrich
                const merged: MappingRoleEnriched[] = mapping.map((m) => ({
                    ...m,
                    roleDesc: roleMap.get(m.roleUid) ?? m.roleUid,
                    serviceDesc: serviceMap.get(m.servicesUid) ?? m.servicesUid,
                }));

                setEnrichedData(merged);
                setRoles(rolesData);
                setServices(servicesData);
            } catch (err) {
                setError("Failed to load mapping role data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [trigger]);

    const refetch = () => setTrigger((prev) => prev + 1);

    return {
        mappingData,
        enrichedData,
        roles,
        services,
        loading,
        error,
        refetch,
    };
}

export function useMappingRoleServiceById(uid: string) {
    const [data, setData] = useState<MappingRoleServiceModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const res = await getMappingRoleServiceByUid(uid);
                if (res.errors) throw new Error(res.errors);
                setData(res.data ?? null);
            } catch (err) {
                setError("Failed to load mapping role by uid data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [uid]);

    return { data, loading, error };
}

export function useCreateMappingRoleService() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (payload: MappingRoleServiceRequest) => {
        setLoading(true);
        setError(null);

        try {
            const res = await createMappingRoleService(payload);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error };
}

export function useUpdateMappingRoleService() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (uid: string, payload: MappingRoleServiceRequest) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateMappingRoleService(uid, payload);
            if (res.errors) throw new Error(res.errors);
            return res.data ?? null;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
}

export function useDeleteMappingRoleService() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = async (uid: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await deleteMappingRoleService(uid);

            if (res.errors) {
                throw new Error(res.errors);
            }

            return res.data ?? null;
        } catch (e) {
            const message = (e as Error)?.message ?? "Failed to delete mapping";
            setError(message);
            throw e; // ⬅️ penting supaya bisa ditangkap di component
        } finally {
            setLoading(false);
        }
    };

    return { remove, loading, error };
}
