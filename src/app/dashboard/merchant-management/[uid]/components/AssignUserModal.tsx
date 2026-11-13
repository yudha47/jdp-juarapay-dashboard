"use client";

import { useEffect, useMemo, useState } from "react";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRole";
import { SearchableSelect } from "@/components/shared/SearchableSelect";

type AssignTargetType = "merchant" | "region" | "subMerchant";

interface Props {
  open: boolean;
  targetType: AssignTargetType;
  targetUid: string;
  targetLabel: string;
  /** Merchant & region induk, dipakai saat targetType === "subMerchant" */
  merchantUid?: string;
  regionUid?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (body: UserUpdateRequest, userUid: string) => Promise<void> | void;
}

function getRoleLabel(targetType: AssignTargetType) {
  if (targetType === "merchant") return "Admin";
  if (targetType === "region") return "Region";
  return "Merchant";
}

export default function AssignUserModal({
  open,
  targetType,
  targetUid,
  targetLabel,
  merchantUid,
  regionUid,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserUid, setSelectedUserUid] = useState<string | undefined>();

  const { roles } = useRoles({page:1, limit: 9999});

  const {
    items: users,
    loading: usersLoading,
    q,
    setQ,
    setLimit,
  } = useUsers({ page: 1, limit: 30, q: "" });

  useEffect(() => {
    setLimit(10);
  }, [setLimit]);

  const userOptions = useMemo(() => {
    let roleDesc = "";
    if (targetType === "merchant") roleDesc = "Admin";
    else if (targetType === "region") roleDesc = "Region";
    else if (targetType === "subMerchant") roleDesc = "Merchant";

    const role = roles.find((r) => r.roleDesc.toLowerCase() === roleDesc.toLowerCase());
    return users
      .filter((item) => item.roleUid === role?.roleUid)
      .map((item) => ({
        value: item.userUid,
        label: `${item.fullName} (${item.userName})`,
      }));
  }, [users, roles, targetType]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedUserUid) {
      setErrorMessage("User wajib dipilih.");
      return;
    }

    const selectedUser = users.find((u) => u.userUid === selectedUserUid);
    if (!selectedUser) {
      setErrorMessage("User tidak ditemukan.");
      return;
    }

    const payload: UserUpdateRequest = {
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      phone: selectedUser.phone,
      dateOfBirth: null,
      gender: null,
      isActive: "Y",
      roleUid: selectedUser.roleUid,
      userDir: null,
      userImage: null,
      userName: selectedUser.userName,

      merchantUid: targetType === "merchant" ? targetUid : merchantUid,
      regionUid: targetType === "region" ? targetUid : targetType === "subMerchant" ? regionUid : undefined,
      subMerchantUid: targetType === "subMerchant" ? targetUid : undefined,
    };

    await onSubmit(payload, selectedUserUid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Assign User</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-900">
                  Assign user to {targetType === "subMerchant" ? "sub merchant" : targetType}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {targetType === "merchant" && "Merchant"}
                  {targetType === "region" && "Region"}
                  {targetType === "subMerchant" && "Sub Merchant"}
                  {" : "}
                  <span className="font-medium">{targetLabel}</span>
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Assigned Role
                </label>
                <input
                  type="text"
                  value={getRoleLabel(targetType)}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-700"
                />
              </div>

              <SearchableSelect
                label="User"
                placeholder="Search user..."
                value={selectedUserUid}
                onChange={setSelectedUserUid}
                options={userOptions}
                loading={usersLoading}
                search={q}
                setSearch={setQ}
                required
                emptyText="No user found"
              />

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Assigning..." : "Assign User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}