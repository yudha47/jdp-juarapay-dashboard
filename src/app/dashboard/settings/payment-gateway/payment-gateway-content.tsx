"use client";

import { useState } from "react";
import { DataTable } from "../../../../components/shared/datatable/DataTable";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";
import AddPaymentGatewayModal from "./components/AddPaymentGatewayModal";
import EditPaymentGatewayModal from "./components/EditPaymentGatewayModal";
import {
    usePaymentGateways,
    useCreatePaymentGateway,
    useUpdatePaymentGateway,
    useDeletePaymentGateway,
} from "../../../../hooks/usePaymentGateway";
import type { PaymentGatewayModel } from "@/data/models/PaymentGatewayModel";

interface PaymentGatewayFormData {
    pgDesc: string;
    pgCode: string;
}

const defaultForm: PaymentGatewayFormData = {
    pgDesc: "",
    pgCode: "",
};

export default function PaymentGatewayContent() {
    const pageSize = 10;

    // ── Modal & form state ──────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PaymentGatewayFormData>(defaultForm);
    const [editFormData, setEditFormData] = useState<PaymentGatewayFormData>(defaultForm);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toasts, toast, clear } = useToast();

    // ── Data fetching ───────────────────────────────────────────────────────
    const {
        items,
        pagination: apiPagination,
        loading,
        page,
        setPage,
        setQ,
        setSearchBy,
        refetch,
    } = usePaymentGateways({ page: 1, limit: pageSize, sort: "createdAt", order: "desc" });

    // ── Mutations ───────────────────────────────────────────────────────────
    const { create, loading: createLoading } = useCreatePaymentGateway();
    const { update, loading: updateLoading } = useUpdatePaymentGateway();
    const { remove, loading: deleteLoading } = useDeletePaymentGateway();

    // ── Pagination adapter (API is 1-based, DataTable is 0-based) ──────────
    const pagination = {
        currentPage: (apiPagination?.page ?? 1) - 1,
        totalPage: apiPagination?.totalPages ?? 1,
        totalItems: apiPagination?.total ?? 0,
        size: pageSize,
    };


    // ── Add handlers ────────────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData(defaultForm);
        setShowAddModal(true);
    };

    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create({
                pgDesc: formData.pgDesc,
                pgCode: Number(formData.pgCode),
            });
            setShowAddModal(false);
            setFormData(defaultForm);
            toast.success("Gateway Created", "New payment gateway has been added successfully.");
            refetch();
        } catch (err) {
            toast.error("Failed to Create", (err as Error)?.message ?? "Something went wrong. Please try again.");
        }
    };

    // ── Edit handlers ───────────────────────────────────────────────────────
    const handleOpenEditModal = (row: PaymentGatewayModel) => {
        setEditingId(row.pgUid);
        setEditFormData({
            pgDesc: row.pgDesc,
            pgCode: row.pgCode.toString(),
        });
        setShowEditModal(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await update(editingId, {
                pgDesc: editFormData.pgDesc,
                pgCode: Number(editFormData.pgCode),
            });
            setShowEditModal(false);
            setEditingId(null);
            toast.success("Gateway Updated", "Changes have been saved successfully.");
            refetch();
        } catch (err) {
            toast.error("Failed to Update", (err as Error)?.message ?? "Something went wrong. Please try again.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await remove(deleteId);
            toast.success("Gateway Deleted", "Payment gateway has been removed successfully.");
            refetch();
        } catch (err) {
            toast.error("Failed to Delete", (err as Error)?.message ?? "Something went wrong. Please try again.");
        } finally {
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };

    // ── Helpers ─────────────────────────────────────────────────────────────
    const formatDate = (dateStr: string): string => {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!match) return dateStr;

        const [, year, month, day, hour, minute, second] = match;
        return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Gateway</h1>
                        <p className="text-slate-600">
                            Manage and configure payment gateway providers available in the system.
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={[
                        {
                            key: "pgCode",
                            title: "Code",
                            render: (row: PaymentGatewayModel) => (
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                    {row.pgCode}
                                </span>
                            ),
                        },
                        {
                            key: "pgDesc",
                            title: "Gateway Name",
                        },
                        {
                            key: "createdAt",
                            title: "Created At",
                            render: (row: PaymentGatewayModel) => (
                                <span className="text-sm text-slate-600">{formatDate(row.createdAt)}</span>
                            ),
                        },
                        {
                            key: "updatedAt",
                            title: "Updated At",
                            render: (row: PaymentGatewayModel) => (
                                <span className="text-sm text-slate-600">{formatDate(row.updatedAt)}</span>
                            ),
                        },
                    ]}
                    data={items}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search gateway name or code..."
                    onSearch={(value) => {
                        // ✅ auto-detect: angka → pgCode, huruf → pgDesc
                        setSearchBy(value !== "" && /^\d+$/.test(value) ? "pgCode" : "pgDesc");
                        setQ(value);
                        setPage(1);
                    }}
                    pagination={pagination}
                    onPageChange={(newPage: number) => setPage(newPage + 1)}
                    addButton={{
                        label: createLoading ? "Saving..." : "Add Payment Gateway",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        header: "Actions",
                        render: (row: PaymentGatewayModel) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenEditModal(row)}
                                    className="cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    title="Edit Payment Gateway"
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
                                <button
                                    onClick={() => {
                                        setDeleteId(row.pgUid);
                                        setShowDeleteDialog(true);
                                    }}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
                                    title="Delete Category"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-3H10a1 1 0 00-1 1v2h6V5a1 1 0 00-1-1z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ),
                    }}
                />
            </div>

            {/* Add Modal */}
            <AddPaymentGatewayModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                formData={formData}
                onInputChange={handleAddInputChange}
                onSubmit={handleAddSubmit}
                loading={createLoading}
            />

            {/* Edit Modal */}
            <EditPaymentGatewayModal
                key={editingId}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                formData={editFormData}
                onInputChange={handleEditInputChange}
                onSubmit={handleEditSubmit}
                loading={updateLoading}
            />

            <ToastContainer toasts={toasts} onRemove={clear} />

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-800">Delete Payment Gateway</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this payment gateway? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteId(null);
                                }}
                                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
