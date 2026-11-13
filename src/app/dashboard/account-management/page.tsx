"use client";

import { DataTable } from "@/components/shared/datatable/DataTable";
import { useState } from "react";
import { EditAccountModal } from "./components/EditAccountModal";
import { AddAccountModal } from "./components/AddAccountModal";
import type { UserModel } from "@/data/models/UserModel";
import type { UserSort, UserOrder } from "@/data/models/UserModel";
import { useCreateUser, useUpdateUser, useUpdateUserPass, useUsers, useUser } from "@/hooks/useUsers";
import { useRoleMap } from "@/hooks/useRole";
import { UserRequest } from "@/data/request/UserRequest";
import { useToast } from "@/components/ui/ToastProvider";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";


const StatusBadge = ({ status }: { status: string }) => {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status === "Y" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
        >
            {status === "Y" ? "Active" : "Inactive"}
        </span>
    );
};

export default function AccountManagement() {
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserModel | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserModel | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<UserModel | null>(null);
  const [passwords, setPasswords] = useState({ userPass: "", confirmPass: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({ userPass: false, confirmPass: false });

  const {
    items,
    pagination,
    loading,
    error,
    page,
    limit,
    sort,
    order,
    setPage,
    setLimit,
    setSort,
    setOrder,
    setSearchBy,
    setQ,
    refetch: refetchUsers,
  } = useUsers({ page: 1, limit: 10, sort: "createdAt", order: "desc", searchBy: "isActive", q: "Y" });
  const { roleMap } = useRoleMap();
  const { create: createAccount } = useCreateUser();
  const { update: updateAccount } = useUpdateUser();
  const { update: updatePassword, loading: passwordLoading } = useUpdateUserPass();

  // Fetch full user data for deactivate target
  const { data: deactivateUserData, loading: deactivateUserLoading } = useUser(
    deactivateTarget?.userUid ?? undefined
  );

  const tablePagination = pagination
    ? {
      currentPage: (pagination.page ?? 1) - 1,
      totalPage: pagination.totalPages ?? 1,
      size: pagination.limit ?? limit,
    }
    : { currentPage: page - 1, totalPage: 1, size: limit };

  const handleEditAccount = (account: UserModel) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim();

    if (keyword) {
      setSearchBy("fullName");
      setQ(keyword);
      return;
    }

    setSearchBy("isActive");
    setQ("Y");
  };

  const submitAddAccount = async (newAccount: UserRequest) => {
    try {
      await createAccount(newAccount);
      showToast("Account created successfully!", "success");
      refetchUsers();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to create account", "error");
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const submitEditAccount = async (updatedAccount: UserUpdateRequest) => {
    if (!selectedAccount) return;
    try {
      await updateAccount(selectedAccount.userUid, updatedAccount);
      showToast("Account updated successfully!", "success");
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      refetchUsers();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update account", "error");
    }
  };

  const handleOpenDeactivateDialog = (row: UserModel) => {
    setDeactivateTarget(row);
    setShowDeactivateDialog(true);
  };

  const closePasswordModal = () => {
    setPasswordTarget(null);
    setPasswords({ userPass: "", confirmPass: "" });
    setPasswordError("");
    setShowPasswords({ userPass: false, confirmPass: false });
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordTarget) return;

    if (passwords.userPass.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (passwords.userPass !== passwords.confirmPass) {
      setPasswordError("Password confirmation does not match.");
      return;
    }

    try {
      setPasswordError("");
      await updatePassword(passwordTarget.userUid, { userPass: passwords.userPass });
      showToast(`Password for ${passwordTarget.fullName} changed successfully!`, "success");
      closePasswordModal();
    } catch (err) {
      const message = (err as Error)?.message ?? "Failed to change password";
      setPasswordError(message);
      showToast(message, "error");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget || !deactivateUserData) return;

    const nextIsActive = deactivateTarget.isActive === "Y" ? "N" : "Y";

    const payload: UserUpdateRequest = {
      fullName: deactivateUserData.fullName ?? "",
      email: deactivateUserData.email ?? "",
      phone: deactivateUserData.phone ?? "",
      dateOfBirth: deactivateUserData.dateOfBirth ?? null,
      roleUid: deactivateUserData.role?.roleUid ?? deactivateUserData.role.roleUid ?? "",
      userDir: deactivateUserData.userDir ?? null,
      userImage: deactivateUserData.userImage ?? null,
      userName: deactivateUserData.userName ?? "",
      gender: deactivateUserData.gender ?? null,
      isActive: nextIsActive,
      merchantUid: deactivateUserData.merchantUid ?? undefined,
      regionUid: deactivateUserData.regionUid ?? undefined,
      subMerchantUid: deactivateUserData.subMerchantUid ?? undefined,
    };

    try {
      setDeactivateLoading(true);
      await updateAccount(deactivateTarget.userUid, payload);
      showToast(
        nextIsActive === "Y" ? "Account activated successfully!" : "Account deactivated successfully!",
        "success"
      );
      refetchUsers();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update account status", "error");
    } finally {
      setDeactivateLoading(false);
      setShowDeactivateDialog(false);
      setDeactivateTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="mt-2 text-slate-600">Manage accounts and monitor access control</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as UserSort)}
          >
            <option value="createdAt">Created At</option>
            <option value="fullname">Full Name</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(e.target.value as UserOrder)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        <DataTable<UserModel>
          columns={[
            { key: "fullName", title: "Name" },
            { key: "email", title: "Email" },
            { key: "phone", title: "Phone" },
            { 
              key: "status", 
              title: "Status", 
              render: (val) => <StatusBadge status={val.isActive} />, 
              // sortable: true, sortKey: "isActive" 
            },
            { key: "roleUid", title: "Role", render: (row) => roleMap.get(row.roleUid) ?? row.roleUid },
          ]}
          data={items as UserModel[]}
          loading={loading}
          searchable
          onSearch={handleSearch}
          pagination={tablePagination}
          onPageChange={(nextZeroBased) => setPage(nextZeroBased + 1)}
          addButton={{
            label: "Add Account",
            onClick: () => setIsAddModalOpen(true),
          }}
          actions={{
            render: (row) => (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => handleEditAccount(row)}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Edit Account"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setPasswordTarget(row)}
                  className="cursor-pointer rounded-lg border border-amber-300 bg-amber-50 p-2 text-amber-700 transition-all hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  title="Change Password"
                  aria-label={`Change password for ${row.fullName}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="7.5" cy="15.5" r="4.5" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.7 12.3 21 2m-3 3 2 2m-5 1 2 2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleOpenDeactivateDialog(row)}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    row.isActive === "Y"
                      ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                  title={row.isActive === "Y" ? "Deactivate Account" : "Activate Account"}
                >
                  {row.isActive === "Y" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            ),
          }}
        />
      </div>

      {isAddModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={submitAddAccount}
        />
      )}

      {isEditModalOpen && selectedAccount && (
        <EditAccountModal
          account={selectedAccount}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAccount(null);
          }}
          onSave={submitEditAccount}
        />
      )}

      {showDeactivateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
          <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-lg">⚠️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {deactivateTarget?.isActive === "Y" ? "Deactivate User" : "Activate User"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to {deactivateTarget?.isActive === "Y" ? "deactivate" : "activate"}{" "}
              <span className="font-medium text-gray-800">{deactivateTarget?.fullName}</span>?
              {deactivateTarget?.isActive === "Y"
                ? " Their account will be disabled and they will no longer be able to log in."
                : " Their account will be enabled and they will be able to log in again."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeactivateDialog(false);
                  setDeactivateTarget(null);
                }}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={deactivateLoading || deactivateUserLoading}
                className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                {deactivateLoading || deactivateUserLoading
                  ? "Processing..."
                  : deactivateTarget?.isActive === "Y"
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                <p className="mt-1 text-sm text-gray-500">{passwordTarget.fullName}</p>
              </div>
              <button type="button" onClick={closePasswordModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">New Password</span>
                <div className="relative">
                  <input
                    type={showPasswords.userPass ? "text" : "password"}
                    required
                    minLength={8}
                    autoFocus
                    value={passwords.userPass}
                    onChange={(event) => setPasswords((current) => ({ ...current, userPass: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((current) => ({ ...current, userPass: !current.userPass }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title={showPasswords.userPass ? "Hide password" : "Show password"}
                  >
                    {showPasswords.userPass ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</span>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwords.confirmPass}
                    onChange={(event) => setPasswords((current) => ({ ...current, confirmPass: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((current) => ({ ...current, confirmPass: !current.confirmPass }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title={showPasswords.confirmPass ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirmPass ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              {passwordError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</p>}
              <div className="flex gap-3 border-t border-gray-100 pt-5">
                <button type="button" onClick={closePasswordModal} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button disabled={passwordLoading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  {passwordLoading ? "Saving..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
