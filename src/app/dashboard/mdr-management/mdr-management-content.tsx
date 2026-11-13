"use client";
import { useEffect, useState } from "react";
import { DataTable } from "../../../components/shared/datatable/DataTable";
import { useDebounce } from "../../../hooks/useDebounce";
import ChangeHistoryModal, { ChangeHistory } from "./components/ChangeHistoryModal";
import { useMdr, usePaymentMethods } from "../../../hooks/usePaymentMethod";
import { PriceFormData as AddPriceFormData } from "../settings/price-management/components/AddPriceModal";
import { useMerchants } from "../../../hooks/useMerchant";
import { getLoggedInUser } from "../../../lib/auth";
import { useCreatePrice, useDeletePrice, usePrice, useUpdatePrice } from "../../../hooks/usePrice";
import { ToastContainer, useToast } from "../../../components/shared/Toast";
import { PriceFormData as EditPriceFormData } from "../settings/price-management/components/EditPriceModal";
import { PriceModel } from "../../../data/models/PriceModel";
import MdrDetailPanel from "./components/MdrDetailPanel";
import AddMdrModal from "./components/AddMdrModal";
import EditMdrModal from "./components/EditMdrModal";
import { MdrSort, MdrOrder } from "@/data/models/MdrModel";

export interface MdrApiItem {
    catDesc: string;
    bank: string;
    merchantDesc: string;
    pgDesc: string;
    fee: number;
    feeStatus: "Y" | "N";
    feePercentage: "Y" | "N";
    price: number;
    priceStatus: "Y" | "N";
    pricePercentage: "Y" | "N";
    margin: string;
}

export interface FormData {
    price: number;
    isActive: "Y" | "N";
    isPercentage: "Y" | "N";
    paymentMethodUid: string;
    merchantUid: string;
}

const defaultForm: AddPriceFormData = {
    price: 0,
    isActive: "Y",
    isPercentage: "Y",
    catUid: "",
    paymentMethodUid: "",
    merchantUid: "",
};

export default function MdrManagementContent() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 600);
    const [page, setPage] = useState(0);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<AddPriceFormData>(defaultForm);
    const { toasts, toast, clear } = useToast();
    const [editData, setEditData] = useState<EditPriceFormData>(defaultForm);
    const [editId, setEditId] = useState<string>("");
    const [detailId, setDetailId] = useState<string>("");
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [changeHistory] = useState<ChangeHistory[]>([
        {
            id: "CH001",
            merchantId: "MRC001",
            merchantName: "PT Maju Jaya",
            category: "E-Wallet",
            method: "Dana",
            oldValue: 0.8,
            newValue: 1.0,
            isPercentage: true,
            changedBy: "Admin John",
            changedAt: "2025-02-10 14:30:00",
            changeType: "Price",
        },
        {
            id: "CH002",
            merchantId: "MRC002",
            merchantName: "PT Sukses Selalu",
            category: "E-Wallet",
            method: "Dana",
            oldValue: 0.9,
            newValue: 1.1,
            isPercentage: true,
            changedBy: "Admin Sarah",
            changedAt: "2025-02-09 10:15:00",
            changeType: "Price",
        },
        {
            id: "CH003",
            merchantId: "MRC001",
            merchantName: "PT Maju Jaya",
            category: "Virtual Account",
            method: "BCA",
            oldValue: 800,
            newValue: 1000,
            isPercentage: false,
            changedBy: "Admin John",
            changedAt: "2025-02-08 16:45:00",
            changeType: "Price",
        },
        {
            id: "CH004",
            merchantId: "MRC001",
            merchantName: "PT Maju Jaya",
            category: "E-Wallet",
            method: "Dana",
            oldValue: 1.2,
            newValue: 1.5,
            isPercentage: true,
            changedBy: "Admin Mike",
            changedAt: "2025-02-07 11:20:00",
            changeType: "Price",
        },
        {
            id: "CH005",
            merchantId: "MRC002",
            merchantName: "PT Sukses Selalu",
            category: "E-Wallet",
            method: "Dana",
            oldValue: 2.0,
            newValue: 2.3,
            isPercentage: true,
            changedBy: "Admin Sarah",
            changedAt: "2025-02-06 09:00:00",
            changeType: "Price",
        },
    ]);

    const userData = getLoggedInUser();

    const {
        items: mdrItems,
        pagination: mdrPagination,
        loading: mdrLoading,
        setPage: setMdrPage,
        limit,
        sort,
        order,
        setQ,
        refetch,
        setLimit,
        setSort,
        setOrder,
    } = useMdr({
        page: page + 1,
        limit: 5,
        order: "desc",
        q: debouncedSearch,
    });

    const mdrData = mdrItems.filter((item) => item.priceUid !== null);

    useEffect(() => {
        setMdrPage(page + 1); // 1-based
    }, [page, setMdrPage]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(0);
        setQ(debouncedSearch);
    }, [debouncedSearch, setQ]);

    const { items: paymentMethodData } = usePaymentMethods({
        page: 1,
        limit: 150,
        sort: "createdAt",
        order: "desc",
    });

    const { items } = useMerchants({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const merchantData = items?.filter(
        (merchant) => merchant.isActive === "Y"
    );

    const { create, loading: createLoading } = useCreatePrice();
    const { update, loading: updateLoading } = useUpdatePrice();
    const { remove, loading: deleteLoading } = useDeletePrice();

    const { data: detailData, loading: detailPanelLoading } = usePrice(detailId);
    const { data: editDetail, loading: detailLoading } = usePrice(editId);
    const paymentMethodMap = Object.fromEntries(paymentMethodData.map((pm) => [pm.paymentMethodUid, pm]));

    const isEditSaving = updateLoading;

    const pagination = {
        currentPage: (mdrPagination?.page ?? 1) - 1,
        totalPage: mdrPagination?.totalPages ?? 1,
        size: mdrPagination?.limit ?? 10,
    };

    // Populate edit form when detail arrives
    useEffect(() => {
        if (!editDetail) return;

        const selectedPaymentMethod = paymentMethodData.find(
            (pm) => pm.paymentMethodUid === editDetail.paymentMethodUid,
        );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditData({
            price: editDetail.price,
            isActive: (editDetail.isActive === "Y" ? "Y" : "N") as "Y" | "N",
            isPercentage: (editDetail.isPercentage === "Y" ? "Y" : "N") as "Y" | "N",
            catUid: selectedPaymentMethod?.category?.catUid ?? "",
            paymentMethodUid: editDetail.paymentMethodUid ?? "",
            merchantUid: editDetail.merchantUid?.merchantUid ?? "",
        });
    }, [editDetail, paymentMethodData]);

    // ─── Formatters ──────────────────────────────────────────────────────────

    const formatCurrency = (value: number): string =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 20,
        }).format(value);

    const formatPercentage = (value: number): string => `${value.toFixed(2)}%`;

    const renderFeeValue = (row: MdrApiItem, field: "fee" | "price") => {
        const value = row[field];
        const isPercentage = field === "fee" ? row.feePercentage === "Y" : row.pricePercentage === "Y";
        return isPercentage ? formatPercentage(value) : formatCurrency(value);
    };

    const renderMargin = (row: MdrApiItem) => {
        const value = parseFloat(row.margin);
        // Use price's percentage flag to determine margin display format
        return row.pricePercentage === "Y" ? formatPercentage(value) : formatCurrency(value);
    };

    const renderStatus = (row: MdrApiItem) => {
        const isActive = row.feeStatus === "Y" && row.priceStatus === "Y";
        return isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
            </span>
        );
    };

    const handleOpenAddModal = () => {
        setFormData(defaultForm);
        setShowAddModal(true);
    };

    const handleOpenEditModal = (row: PriceModel) => {
        setEditData(defaultForm);
        setEditId("");
        setShowEditModal(true);
        setTimeout(() => setEditId(row.priceUid), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create({
                price: formData.price,
                isActive: formData.isActive,
                isPercentage: formData.isPercentage,
                paymentMethodUid: formData.paymentMethodUid,
                merchantUid: formData.merchantUid,
                createdBy: userData?.userUid ?? "",
            });
            setShowAddModal(false);
            setFormData(defaultForm);
            setPage(0);
            refetch();
            toast.success("Mdr Created", "Mdr has been added successfully.");
        } catch (err) {
            setShowAddModal(false);
            setFormData(defaultForm);
            toast.error("Failed to Create", "Something went wrong. Please try again.");
            console.error("Failed to create mdr:", err);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const resetEdit = () => {
            setShowEditModal(false);
            setEditData(defaultForm);
            setEditId("");
        };

        try {
            await update(editId, {
                price: editData.price,
                isActive: editData.isActive,
                isPercentage: editData.isPercentage,
                paymentMethodUid: editData.paymentMethodUid,
                merchantUid: editData.merchantUid,
                createdBy: userData?.userUid ?? "",
            });
            resetEdit();
            refetch();
            toast.success("Mdr Updated", "Mdr has been updated successfully.");
        } catch (err) {
            resetEdit();
            toast.error("Failed to Update", "Something went wrong. Please try again.");
            console.error("Failed to update price:", err);
        }
    };

    const handleOpenDeleteDialog = (row: PriceModel) => {
        setDeleteId(row.priceUid);
        setDetailId(row.priceUid);
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
            await remove(deleteId);
            toast.success("Deleted", "Price has been removed.");
            const isLastItemOnPage = mdrItems.length === 1 && page > 1;
            if (isLastItemOnPage) {
                setPage(page - 1);
            } else {
                refetch();
            }
        } catch (err) {
            toast.error("Failed", "Something went wrong.");
            console.error(err);
        } finally {
            resetDelete();
        }
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "catUid") {
                return {
                    ...prev,
                    catUid: value,
                    paymentMethodUid: "",
                };
            }

            return {
                ...prev,
                [name]: name === "price" ? Number(value) : value,
            };
        });
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setEditData((prev) => {
            if (name === "catUid") {
                return {
                    ...prev,
                    catUid: value,
                    paymentMethodUid: "",
                };
            }

            return {
                ...prev,
                [name]: name === "price" ? Number(value) : value,
            };
        });
    };
    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Method Management</h1>
                        <p className="text-slate-600">Manage Payment Method data for all merchants</p>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as MdrSort)}
                    >
                        <option value="merchantDesc">Merchant Name</option>
                        <option value="bank">Payment Method</option>
                    </select>

                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={order}
                        onChange={(e) => setOrder(e.target.value as MdrOrder)}
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

                    {mdrLoading && <span className="text-sm text-gray-500">Loading...</span>}
                </div>

                {/* Main Table */}
                <DataTable
                    columns={[
                        // catDesc  → "Category"
                        { key: "catDesc", title: "Category" },
                        // bank     → "Payment Method"
                        { key: "bank", title: "Payment Method" },
                        // merchantDesc → "Merchant Name"
                        { key: "merchantDesc", title: "Merchant Name" },
                        // pgDesc   → "Payment Gateway"
                        { key: "pgDesc", title: "Payment Gateway" },
                        {
                            key: "status",
                            title: "Status",
                            // Derived from feeStatus + priceStatus
                            render: (row: MdrApiItem) => renderStatus(row),
                        },
                        {
                            key: "fee",
                            title: "PG Fee",
                            render: (row: MdrApiItem) => renderFeeValue(row, "fee"),
                        },
                        {
                            key: "price",
                            title: "Price",
                            render: (row: MdrApiItem) => renderFeeValue(row, "price"),
                        },
                        {
                            key: "margin",
                            title: "Margin",
                            render: (row: MdrApiItem) => renderMargin(row),
                        },
                    ]}
                    data={mdrData as MdrApiItem[]}
                    loading={mdrLoading}
                    searchable
                    searchPlaceholder="Search by merchant name…"
                    onSearch={(value) => setSearch(value)}
                    pagination={pagination}
                    onPageChange={(newPage) => setPage(newPage)} // newPage is already 0-based
                    addButton={{
                        label: "Add Payment Method",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        render: (row) => (
                            <div className="flex justify-end gap-2">
                                {/* <button
                                    onClick={() => handleOpenDetailPanel(row as unknown as PriceModel)}
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
                                </button> */}
                                <button
                                    onClick={() => handleOpenEditModal(row as unknown as PriceModel)}
                                    className="rounded-lg cursor-pointer border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    title="Edit MDR"
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
                                    onClick={() => handleOpenDeleteDialog(row as unknown as PriceModel)}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-primary/30 hover:text-foreground transition-all"
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

                {/* Modals */}
                <EditMdrModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditId("");
                        setEditData(defaultForm);
                    }}
                    formData={editData}
                    paymentMethodData={paymentMethodData}
                    merchantData={merchantData}
                    onInputChange={handleEditInputChange}
                    onSubmit={handleEditSubmit}
                    loading={isEditSaving}
                    fetchLoading={detailLoading}
                />

                <AddMdrModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    formData={formData}
                    paymentMethodData={paymentMethodData}
                    merchantData={merchantData}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    loading={createLoading}
                />

                <ChangeHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    changeHistory={changeHistory}
                />

                <MdrDetailPanel
                    isOpen={showDetailPanel}
                    onClose={() => {
                        setShowDetailPanel(false);
                        setDetailId("");
                    }}
                    data={detailData ?? null}
                    loading={detailPanelLoading}
                    paymentMethodMap={paymentMethodMap}
                />

                {showDeleteDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
                        <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-lg">🗑️</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Delete Price</h2>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                Are you sure you want to delete this price? This action cannot be undone.
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
                                    disabled={deleteLoading}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer toasts={toasts} onRemove={clear} />
            </div>
        </div>
    );
}
