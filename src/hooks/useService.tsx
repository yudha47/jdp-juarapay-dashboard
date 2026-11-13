import { useEffect, useState } from "react";
import { ServiceModel } from "../data/models/ServiceModel";
import { getServiceByUid, getServices, updateService } from "./server/serviceService";
import { ServiceRequest } from "@/data/request/ServiceRequest";

export function useServices() {
    const [services, setServices] = useState<ServiceModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const fetchservice = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getServices();

                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setServices(res.data ?? []);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch service");
                setServices([]);
            } finally {
                if (!active) return;
                setLoading(false);
            }
        };

        fetchservice();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const refetch = () => setRefreshKey((x) => x + 1);

    return {
        services,
        loading,
        error,
        refetch,
    };
}

export function useService(uid?: string) {
    const [data, setData] = useState<ServiceModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) return;

        let active = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getServiceByUid(uid);
                if (!active) return;

                if (res.errors) throw new Error(res.errors);

                setData(res.data ?? null);
            } catch (e) {
                if (!active) return;
                setError((e as Error)?.message ?? "Failed to fetch service");
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

export function useUpdateService() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: ServiceRequest) => {
        setLoading(true);

        try {
            const res = await updateService(uid, payload);

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
