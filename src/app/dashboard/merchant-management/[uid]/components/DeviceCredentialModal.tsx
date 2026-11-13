"use client";

import { useState } from "react";
import Modal, { Field, Input } from "./Modal";
import { DeviceCredentialRequest } from "../../../../../data/request/DeviceCredentialRequest";
import PasswordInput from "../../../../../components/ui/PasswordInput";

interface Props {
    deviceUid: string;
    loading: boolean;
    onClose: () => void;
    onSubmit: (
        body: DeviceCredentialRequest,
        uid: string
    ) => void;
}

export default function DeviceCredentialModal({
    deviceUid,
    loading,
    onClose,
    onSubmit,
}: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        onSubmit(
            {
                username,
                password,
            },
            deviceUid
        );
    };

    return (
        <Modal
            title="Edit Credential"
            loading={loading}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel="Update Credential"
        >
            <Field label="Username" required>
                <Input
                    value={username}
                    onChange={setUsername}
                    placeholder="Enter username"
                />
            </Field>

            <Field label="Password" required>
                <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-foreground/3 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
            </Field>
        </Modal>
    );
}