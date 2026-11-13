"use client";

import { useMemo, useState } from "react";
import { useRoleMap } from "@/hooks/useRole";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useToast } from "@/components/ui/ToastProvider";
import PasswordInput from "@/components/ui/PasswordInput";

type TargetType = "region" | "subMerchant";

export default function CreateAssignedUserModal({
  targetType,
  targetUid,
  targetLabel,
  merchantUid,
  regionUid,
  onClose,
  onCreated,
}: {
  targetType: TargetType;
  targetUid: string;
  targetLabel: string;
  /** Merchant & region induk, dipakai saat targetType === "subMerchant" */
  merchantUid?: string;
  regionUid?: string;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const { showToast } = useToast();
  const { roles, loading: rolesLoading } = useRoleMap();
  const { create, loading: creating } = useCreateUser();
  const { update, loading: assigning } = useUpdateUser();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", userName: "", userPass: "" });
  const [error, setError] = useState("");

  const roleName = targetType === "region" ? "Region" : "Merchant";
  const roleUid = useMemo(
    () => roles.find((role) => role.roleDesc.toLowerCase() === roleName.toLowerCase())?.roleUid ?? "",
    [roles, roleName],
  );
  const loading = rolesLoading || creating || assigning;

  const setField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!roleUid) {
      const message = `Role ${roleName} tidak ditemukan.`;
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      const userUid = await create({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: Number(form.phone),
        roleUid,
        userName: form.userName.trim(),
        userPass: form.userPass,
      });
      if (!userUid) throw new Error("User berhasil dibuat tetapi userUid tidak diterima.");

      await update(userUid, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        roleUid,
        userName: form.userName.trim(),
        isActive: "Y",
        userDir: null,
        userImage: null,
        merchantUid,
        regionUid: targetType === "region" ? targetUid : regionUid,
        subMerchantUid: targetType === "subMerchant" ? targetUid : undefined,
      });

      await onCreated();
      showToast(`User berhasil dibuat dan di-assign ke ${targetLabel}.`, "success");
      onClose();
    } catch (caught) {
      const message = (caught as Error)?.message || "Gagal membuat dan meng-assign user.";
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create & Assign User</h2>
            <p className="mt-1 text-sm text-gray-500">{targetLabel} · Role {roleName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {[
              ["fullName", "Full Name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["userName", "Username", "text"],
            ].map(([field, label, type]) => (
              <label key={field}>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
                <input
                  type={type}
                  required
                  value={form[field as keyof typeof form]}
                  onChange={(event) => setField(field as keyof typeof form, event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Password</span>
              <PasswordInput
                required
                value={form.userPass}
                onChange={(event) => setField("userPass", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Role</span>
              <input readOnly value={roleName} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm" />
            </label>
            {error && <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          </div>
          <div className="flex gap-3 border-t border-gray-200 p-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
            <button disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "Processing..." : "Create & Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
