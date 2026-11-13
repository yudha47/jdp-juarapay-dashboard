"use client";

import { useState, useEffect } from "react";
import { DataTable } from "../../../../components/shared/datatable/DataTable";
import {
    useCreatePaymentMethod,
    useDeletePaymentMethod,
    usePaymentMethod,
    usePaymentMethods,
    useUpdatePaymetMethod,
} from "../../../../hooks/usePaymentMethod";
import { PaymentMethodModel } from "../../../../data/models/PaymentMethodModel";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";
import { usePaymentGateways } from "../../../../hooks/usePaymentGateway";
import { useCategories } from "../../../../hooks/useCategory";
import { useCreateFee, useDeleteFee, useUpdateFee } from "../../../../hooks/useFee";
import AddPaymentMethodModal, { FeeFormData as AddFeeFormData } from "./components/AddPaymentMethodModal";
import EditPaymentMethodModal, { FeeFormData as EditFeeFormData } from "./components/EditPaymentMethodModal";
import PaymentMethodDetailPanel from "./components/PaymentMethodDetailPanel";
import { getLoggedInUser } from "../../../../lib/auth";
import { SearchByOption } from "@/components/shared/datatable/types";

interface PaymentMethodFormData {
    bank: string;
    bankDir: string;
    bankId: string;
    bankImg: string;
    catUid: string;
    channelId: string;
    extPaymentCode: string;
    isActive: "Y" | "N";
    paymentCode: string;
    pgUid: string;
    subBankId: string;
}

const defaultForm: PaymentMethodFormData = {
    bank: "",
    bankDir: "",
    bankId: "",
    bankImg: "",
    catUid: "",
    channelId: "",
    extPaymentCode: "",
    isActive: "Y",
    paymentCode: "",
    pgUid: "",
    subBankId: "",
};

const defaultAddFeeForm: AddFeeFormData = {
    fee: 0,
    isActive: "Y",
    isPercentage: "Y",
};

const defaultEditFeeForm: EditFeeFormData = {
    feeUid: "",
    fee: 0,
    isActive: "Y",
    isPercentage: "Y",
};

const formatCreatedAt = (value: string): string => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return value;

    const [, year, month, day, hour, minute, second] = match;
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
};

export default function PaymentMethodContent() {
    const pageSize = 10;

    const { items, loading, refetch, pagination, setQ, setSearchBy, setPage } = usePaymentMethods({
        page: 1,
        limit: pageSize,
        searchBy: "bank",
    });

    const { create, loading: createLoading } = useCreatePaymentMethod();
    const { update, loading: updateLoading } = useUpdatePaymetMethod();
    const { remove, loading: deleteLoading } = useDeletePaymentMethod();
    const { create: createFee, loading: createFeeLoading } = useCreateFee();
    const { update: updateFee, loading: updateFeeLoading } = useUpdateFee();
    const { remove: deleteFee, loading: deleteFeeLoading } = useDeleteFee();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<PaymentMethodFormData>(defaultForm);
    const [addFeeData, setAddFeeData] = useState<AddFeeFormData>(defaultAddFeeForm);
    const [editData, setEditData] = useState<PaymentMethodFormData>(defaultForm);
    const [editFeeData, setEditFeeData] = useState<EditFeeFormData>(defaultEditFeeForm);
    const [editId, setEditId] = useState<string>("");

    // ── DETAIL ─────────────────────────────────────────────────────────────
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [detailId, setDetailId] = useState<string>("");
    const { data: detailData, loading: detailPanelLoading } = usePaymentMethod(detailId);

    // Fetch detail whenever editId changes
    const { data: editDetail, loading: detailLoading } = usePaymentMethod(editId);
    const userLoggedIn = getLoggedInUser();
    // Sync detail into editData & editFeeData once loaded
    useEffect(() => {
        if (!editDetail) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditData({
            bank: editDetail.bank,
            bankDir: editDetail.bankDir ?? "",
            bankId: editDetail.bankId ?? "",
            bankImg: editDetail.bankImg ?? "",
            catUid: editDetail.category?.catUid ?? "",
            channelId: editDetail.channelId ?? "",
            extPaymentCode: editDetail.extPaymentCode ?? "",
            isActive: editDetail.isActive,
            paymentCode: editDetail.paymentCode,
            pgUid: editDetail.pgate?.pgUid ?? "",
            subBankId: editDetail.subBankId ?? "",
        });

        setEditFeeData({
            feeUid: editDetail.fee?.feeUid ?? "",
            fee: editDetail.fee?.fee ?? 0,
            isActive: editDetail.fee?.isActive ?? "Y",
            isPercentage: editDetail.fee?.isPercentage ?? "Y",
        });
    }, [editDetail]);

    const { toasts, toast, clear } = useToast();

    const { items: pgData, loading: pgLoading } = usePaymentGateways({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const { items: categoryData, loading: categoryLoading } = useCategories({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const isLoading = loading || pgLoading || categoryLoading;
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const paginationData = {
        currentPage: (pagination?.page ?? 1) - 1, // convert ke 0-based untuk DataTable
        totalPage: pagination?.totalPages ?? 0,
        totalItems: pagination?.total ?? 0,
        size: pagination?.limit ?? pageSize,
    };

    const renderStatus = (status: "Y" | "N") => {
        const isActive = status === "Y";
        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
            >
                {isActive ? "Active" : "Inactive"}
            </span>
        );
    };

    const handleOpenDetailPanel = (row: PaymentMethodModel) => {
        setDetailId("");
        setShowDetailPanel(true);
        setTimeout(() => setDetailId(row.paymentMethodUid), 0);
    };

    // ── ADD ────────────────────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData(defaultForm);
        setAddFeeData(defaultAddFeeForm);
        setShowAddModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddFeeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddFeeData((prev) => ({
            ...prev,
            [name]: name === "fee" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const paymentMethodUid = await create({ ...formData, bankDir: "/bank" });

            if (!paymentMethodUid) {
                throw new Error("Failed to retrieve payment method UID");
            }

            try {
                await createFee({
                    fee: addFeeData.fee,
                    isActive: addFeeData.isActive,
                    isPercentage: addFeeData.isPercentage,
                    paymentMethodUid,
                    createdBy: userLoggedIn?.userUid ?? "",
                });
            } catch (feeErr) {
                console.error("Failed to create fee:", feeErr);
                setShowAddModal(false);
                setFormData(defaultForm);
                setAddFeeData(defaultAddFeeForm);
                refetch();
                toast.success(
                    "Payment Method Created",
                    "Payment method was added, but fee configuration failed. Please add the fee manually.",
                );
                return;
            }

            setShowAddModal(false);
            setFormData(defaultForm);
            setAddFeeData(defaultAddFeeForm);
            refetch();
            toast.success(
                "Payment Method Created",
                "Payment method and fee configuration have been added successfully.",
            );
        } catch (err) {
            setShowAddModal(false);
            setFormData(defaultForm);
            setAddFeeData(defaultAddFeeForm);
            toast.error("Failed to Create", "Something went wrong. Please try again.");
            console.error("Failed to create payment method:", err);
        }
    };

    // ── EDIT ───────────────────────────────────────────────────────────────
    const handleOpenEditModal = (row: PaymentMethodModel) => {
        setEditData(defaultForm);
        setEditFeeData(defaultEditFeeForm);
        setEditId("");
        setShowEditModal(true);
        setTimeout(() => {
            setEditId(row.paymentMethodUid);
        }, 0);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditFeeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFeeData((prev) => ({
            ...prev,
            [name]: name === "fee" ? Number(value) : value,
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const resetEdit = () => {
            setShowEditModal(false);
            setEditData(defaultForm);
            setEditFeeData(defaultEditFeeForm);
            setEditId("");
        };

        try {
            await update(editId, { ...editData, bankDir: "/bank" });

            if (editFeeData.feeUid) {
                try {
                    await updateFee(editFeeData.feeUid, {
                        fee: editFeeData.fee,
                        isActive: editFeeData.isActive,
                        isPercentage: editFeeData.isPercentage,
                        paymentMethodUid: editId,
                        createdBy: userLoggedIn?.userUid ?? "",
                    });
                } catch (feeErr) {
                    console.error("Failed to update fee:", feeErr);
                    resetEdit();
                    refetch();
                    toast.success(
                        "Payment Method Updated",
                        "Payment method was updated, but fee configuration failed. Please update the fee manually.",
                    );
                    return;
                }
            }

            resetEdit();
            refetch();
            toast.success("Payment Method Updated", "Payment method and fee have been updated successfully.");
        } catch (err) {
            resetEdit();
            toast.error("Failed to Update", "Something went wrong. Please try again.");
            console.error("Failed to update payment method:", err);
        }
    };

    // ── DELETE ─────────────────────────────────────────────────────────────
    const handleOpenDeleteDialog = (row: PaymentMethodModel) => {
        setDeleteId(row.paymentMethodUid);
        setDetailId(row.paymentMethodUid);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        const resetDelete = () => {
            setShowDeleteDialog(false);
            setDeleteId(null);
            setDetailId("");
        };

        try {
            const feeUid = detailData?.fee?.feeUid ?? null;

            if (feeUid) {
                try {
                    await deleteFee(feeUid);
                } catch (feeErr) {
                    console.error("Failed to delete fee:", feeErr);
                    toast.error("Failed to Delete", "Could not delete associated fee. Please try again.");
                    resetDelete();
                    return;
                }
            }

            await remove(deleteId);
            toast.success("Deleted", "Payment method has been removed.");
            refetch();
        } catch (err) {
            toast.error("Failed", "Something went wrong.");
            console.error(err);
        } finally {
            resetDelete();
        }
    };

    const isAddSaving = createLoading || createFeeLoading;
    const isEditSaving = updateLoading || updateFeeLoading;
    const isDeleteSaving = deleteLoading || deleteFeeLoading || detailPanelLoading;
    const PM_SEARCH_BY_OPTIONS: SearchByOption[] = [
        { label: "Bank", value: "bank" },
        { label: "Category", value: "catDesc" },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Method Management</h1>
                    <p className="text-slate-600">Manage all available payment methods in the system.</p>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={[
                        { key: "bank", title: "Bank" },
                        { key: "paymentCode", title: "Payment Code" },
                        {
                            key: "category",
                            title: "Category",
                            render: (row: PaymentMethodModel) => row.category?.catDesc ?? "-",
                        },
                        {
                            key: "createdAt",
                            title: "Created At",
                            render: (row: PaymentMethodModel) => formatCreatedAt(row.createdAt),
                        },
                        {
                            key: "isActive",
                            title: "Status",
                            render: (row: PaymentMethodModel) => renderStatus(row.isActive),
                        },
                    ]}
                    data={items}
                    loading={isLoading}
                    searchable
                    searchPlaceholder="Search bank name..."
                    onSearch={(value) => {
                        setSearchBy("bank");
                        setQ(value);
                        setPage(1); // ← setPage dari hook, 1-based
                    }}
                    // searchByOptions={PM_SEARCH_BY_OPTIONS}
                    pagination={paginationData}
                    onPageChange={(newPage: number) => setPage(newPage + 1)}
                    addButton={{
                        label: isAddSaving ? "Saving..." : "Add Payment Method",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        header: "Actions",
                        render: (row: PaymentMethodModel) => (
                            <div className="flex justify-end gap-2">
                                {/* View */}
                                <button
                                    onClick={() => handleOpenDetailPanel(row)}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
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

                                {/* Edit */}
                                <button
                                    onClick={() => handleOpenEditModal(row)}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18.414 2.586a2 2 0 112.828 2.828L11.828 14H9v-2.828l9.414-9.586z"
                                        />
                                    </svg>
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => handleOpenDeleteDialog(row)}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <AddPaymentMethodModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                formData={formData}
                feeData={addFeeData}
                pgData={pgData}
                categoryData={categoryData}
                onInputChange={handleInputChange}
                onFeeInputChange={handleAddFeeInputChange}
                onSubmit={handleSubmit}
                loading={isAddSaving}
            />

            {/* Edit Modal */}
            <EditPaymentMethodModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditId("");
                    setEditFeeData(defaultEditFeeForm);
                }}
                formData={editData}
                feeData={editFeeData}
                pgData={pgData}
                categoryData={categoryData}
                onInputChange={handleEditInputChange}
                onFeeInputChange={handleEditFeeInputChange}
                onSubmit={handleEditSubmit}
                loading={isEditSaving}
                fetchLoading={detailLoading}
            />

            {/* Delete Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
                    <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <span className="text-lg">🗑️</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800">Delete Payment Method</h2>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this payment method? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteId(null);
                                    setDetailId("");
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleteSaving}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isDeleteSaving ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} onRemove={clear} />

            {/* Detail Panel */}
            <PaymentMethodDetailPanel
                isOpen={showDetailPanel}
                onClose={() => {
                    setShowDetailPanel(false);
                    setDetailId("");
                }}
                data={detailData ?? null}
                loading={detailPanelLoading}
            />
        </div>
    );
}