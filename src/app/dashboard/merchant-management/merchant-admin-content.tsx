"use client";

import { DataTable } from "@/components/shared/datatable/DataTable";
import { Column } from "@/components/shared/datatable/types";
import { useState } from "react";
import { AddMerchantModal } from "./components/AddMerchantModal";
import { MerchantModel, MerchantOrder, MerchantSort } from "@/data/models/MerchantModel";
import { DetailDrawer } from "./components/DetailDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/utils/formatDate";
import { useCreateMerchant, useMerchants, useUpdateMerchant } from "@/hooks/useMerchant";
import { getLoggedInRole } from "@/lib/auth";
import { MerchantRequest } from "@/data/request/MerchantRequest";
import { useToast } from "@/components/ui/ToastProvider";
import { UpdateMerchantModal } from "./components/UpdateMerchantModal";
import { getUserByUid } from "@/hooks/server/userService";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import { useUpdateUser } from "@/hooks/useUsers";

export default function MerchantAdminContent() {
    const { showToast } = useToast();
    const role = getLoggedInRole();
    const { submit: createMerchant } = useCreateMerchant();
    const { update: updateMerchant } = useUpdateMerchant();
    
    // user update
    const { update: updateUser } = useUpdateUser();

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
        setQ,
        refetch: refetchMerchants,
        } = useMerchants({ page: 1, limit: 10, sort: "createdAt", order: "desc" });

    const tablePagination = pagination
        ? {
            currentPage: (pagination.page ?? 1) - 1,
            totalPage: pagination.totalPages ?? 1,
            size: pagination.limit ?? limit,
          }
        : { currentPage: page - 1, totalPage: 1, size: limit };

    const isSuperAdmin = role?.roleDesc === "Super Admin" || role?.roleDesc === "DEV";

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<MerchantModel | null>(null);
    const [selectedUpdateMerchant, setSelectedUpdateMerchant] = useState<MerchantModel | null>(null);

    const handleOpenEditModal = (row: MerchantModel) => {
        setSelectedUpdateMerchant(row);
        setShowUpdateModal(true);
    };

    const handleAdd = async (m: MerchantRequest) => {
        try {
            const res = await createMerchant(m);

            if(res){
                const responseUser = await getUserByUid(m.userUid);
                if(responseUser && responseUser.data){
                    const user = responseUser.data;

                    const payload: UserUpdateRequest = {
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                        dateOfBirth: null,
                        gender: null,
                        isActive: "Y",
                        roleUid: user.role.roleUid,
                        userDir: null,
                        userImage: null,
                        userName: user.userName,

                        merchantUid: res,
                        regionUid: undefined,
                        subMerchantUid: undefined,
                    };
                    await updateUser(user.userUid, payload);
                }

            }

            showToast("Merchant created successfully!", "success");
            refetchMerchants();
        } catch (err) {
            showToast(
                (err as Error)?.message ?? "Failed to create merchant",
                "error"
            );
        } finally {
            setShowAddModal(false);
        }
    }

    const handleUpdate = async (m: MerchantRequest, merchantUid = selectedUpdateMerchant?.merchantUid) => {
        try {
            if (!merchantUid) {
                throw new Error("Merchant UID is required");
            }

            await updateMerchant(merchantUid, m);

            showToast("Merchant updated successfully!", "success");
            refetchMerchants();
        } catch (err) {
            showToast(
                (err as Error)?.message ?? "Failed to update merchant",
                "error"
            );
        } finally {
            setShowUpdateModal(false);
            setSelectedMerchant(null);
        }
    }

    const columns: Column<MerchantModel>[] = [
        {
            key: "name",
            title: "Merchant Name",
            render: (row) => <span className="font-semibold text-gray-800">{row.merchantDesc}</span>,
        },
        {
            key: "email",
            title: "Email",
            render: (row) => <span className="text-sm text-gray-600">{row.userMerchant.email}</span>,
        },
        {
            key: "status",
            title: "Status",
            render: (row) => <StatusBadge status={row.isActive === "Y" ? "Active" : "Inactive"} />,
        },
        {
            key: "registeredBy",
            title: "Registered By",
            render: (row) => <span className="text-gray-500">{row.createdBy.email}</span>,
        },
        {
            key: "registeredAt",
            title: "Registration Date",
            render: (row) => (
                <span className="text-sm text-gray-500">
                    {formatDate(row.createdAt)}
                </span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Merchant Management</h1>
                        <p className="mt-2 text-slate-600">
                            Centralized management and monitoring of registered merchant data
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Stats Row */}
                {/* <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Total Merchants",
                            value: merchants.length,
                            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                            gradient: "from-blue-50 to-white",
                            circle: "bg-blue-100",
                            iconGradient: "from-blue-500 to-blue-600",
                            shadow: "hover:shadow-blue-100/50",
                        },
                        {
                            label: "Active",
                            value: activeCount,
                            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                            gradient: "from-emerald-50 to-white",
                            circle: "bg-emerald-100",
                            iconGradient: "from-emerald-500 to-emerald-600",
                            shadow: "hover:shadow-emerald-100/50",
                        },
                        {
                            label: "Inactive",
                            value: inactiveCount,
                            icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636",
                            gradient: "from-slate-50 to-white",
                            circle: "bg-slate-100",
                            iconGradient: "from-slate-500 to-slate-600",
                            shadow: "hover:shadow-slate-100/50",
                        },
                        {
                            label: "Regions",
                            value: regionCount,
                            icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
                            gradient: "from-amber-50 to-white",
                            circle: "bg-amber-100",
                            iconGradient: "from-amber-500 to-amber-600",
                            shadow: "hover:shadow-amber-100/50",
                        },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br ${s.gradient} p-4 shadow-sm transition-all duration-300 hover:shadow-xl ${s.shadow}`}
                        >
                            <div
                                className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full ${s.circle} opacity-20 transition-transform duration-500 group-hover:scale-150`}
                            ></div>

                            <div className="relative flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {s.label}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                    <p className="mt-1 text-xs text-gray-400">Overview statistics</p>
                                </div>

                                <div
                                    className={`inline-flex rounded-lg bg-linear-to-br ${s.iconGradient} p-2.5 shadow-lg`}
                                >
                                    <svg
                                        className="h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}

                {/* Additional filter for Regional - rendered above table */}
                {/* <div className="flex items-center gap-3 flex-wrap mb-3">
                    <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                        Filter by Region:
                    </span>
                    {["all", ...regionItems.map((r) => r.regionDesc)].map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setRegionalFilter(r);
                                // setCurrentPage(0);
                            }}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                regionalFilter === r
                                    ? "border-primary/20 bg-primary text-primary-foreground"
                                    : "border-border bg-background text-foreground/70 hover:border-primary/30"
                            }`}
                        >
                            {r === "all" ? "All" : r}
                        </button>
                    ))}
                </div> */}

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as MerchantSort)}
                    >
                        <option value="createdAt">Created At</option>
                        <option value="name">Merchant</option>
                    </select>
        
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={order}
                        onChange={(e) => setOrder(e.target.value as MerchantOrder)}
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

                {/* DataTable */}
                <DataTable<MerchantModel>
                    columns={columns}
                    data={items as MerchantModel[]}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search merchant name"
                    onSearch={(val) => setQ(val)}
                    pagination={tablePagination}
                    onPageChange={(nextZeroBased) => setPage(nextZeroBased + 1)} // DataTable zero-based -> API 1-based
                    addButton={
                        isSuperAdmin
                            ? {
                                  label: "+ Add Merchant",
                                  onClick: () => setShowAddModal(true),
                              }
                            : undefined
                    }
                    // filters={
                    //     {
                    //         value: regionalFilter,
                    //         options: [{ value: "all", label: "All" }, ...regionItems.map((r) => ({ value: r.regionDesc, label: r.regionDesc }))],
                    //         onChange: (val) => setRegionalFilter(val),
                    //     }
                    // }
                    actions={{
                        header: "Details",
                        render: (row) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setSelectedMerchant(row)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    View
                                </button>

                                <button
                                    onClick={() => handleOpenEditModal(row)}
                                    className="cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    title="Edit Menu Service"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ),
                    }}
                    emptyText="No merchants found"
                />

                {/* HQ read-only note */}
                {/* {isHQ && (
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-5 py-4 flex gap-3">
                        <svg
                            className="h-5 w-5 text-primary shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-foreground">View-Only Access</p>
                            <p className="text-xs text-foreground/70 mt-0.5">
                                You are logged in as HEADQUARTER. You can only view merchant data without making any
                                changes.
                            </p>
                        </div>
                    </div>
                )} */}
            </div>

            {/* Modals */}
            {showAddModal && <AddMerchantModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
            {showUpdateModal && <UpdateMerchantModal existingData={selectedUpdateMerchant ?? undefined} onClose={() => setShowUpdateModal(false)} onUpdate={handleUpdate} />}

            {selectedMerchant && (
                <DetailDrawer
                    merchant={selectedMerchant}
                    onClose={() => setSelectedMerchant(null)}
                    canEdit={isSuperAdmin}
                    onToggleStatus={(payload) => handleUpdate(payload, selectedMerchant.merchantUid)}
                />
            )}
        </div>
    );
}
