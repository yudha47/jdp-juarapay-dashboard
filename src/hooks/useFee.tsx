import { useState } from "react";
import { FeeRequest } from "../data/request/FeeRequest";
import { createFee, deleteFee, updateFee } from "./server/feeService";

export function useCreateFee() {
    const [loading, setLoading] = useState(false);

    const create = async (payload: FeeRequest) => {
        setLoading(true);

        try {
            const res = await createFee(payload);

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

export function useUpdateFee() {
    const [loading, setLoading] = useState(false);

    const update = async (uid: string, payload: FeeRequest) => {
        setLoading(true);

        try {
            const res = await updateFee(uid, payload);

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

export function useDeleteFee() {
    const [loading, setLoading] = useState(false);

    const remove = async (uid: string) => {
        setLoading(true);

        try {
            const res = await deleteFee(uid);

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
