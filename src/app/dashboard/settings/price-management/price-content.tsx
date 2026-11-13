"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "../../../../components/shared/datatable/DataTable";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";
import { usePaymentMethods } from "../../../../hooks/usePaymentMethod";
import { useMerchants } from "../../../../hooks/useMerchant";
import { usePrices, useCreatePrice, useDeletePrice, usePrice, useUpdatePrice } from "../../../../hooks/usePrice";
import { PriceModel } from "../../../../data/models/PriceModel";
import AddPriceModal, { PriceFormData as AddPriceFormData } from "./components/AddPriceModal";
import EditPriceModal, { PriceFormData as EditPriceFormData } from "./components/EditPriceModal";
import PriceDetailPanel from "./components/PriceDetailPanel";
import { getLoggedInUser } from "../../../../lib/auth";

const defaultForm: AddPriceFormData = {
    price: 0,
    isActive: "Y",
    isPercentage: "Y",
    paymentMethodUid: "",
    merchantUid: "",
};

export default function PriceContent() {
    const pageSize = 5;

    const { items, loading, refetch, pagination, setPage, page, setMerchantUid } = usePrices({
        page: 1,
        limit: pageSize,
    });
    const { create, loading: createLoading } = useCreatePrice();
    const { update, loading: updateLoading } = useUpdatePrice();
    const { remove, loading: deleteLoading } = useDeletePrice();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<AddPriceFormData>(defaultForm);
    const [editData, setEditData] = useState<EditPriceFormData>(defaultForm);
    const [editId, setEditId] = useState<string>("");

    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [detailId, setDetailId] = useState<string>("");
    const { data: detailData, loading: detailPanelLoading } = usePrice(detailId);

    const { data: editDetail, loading: detailLoading } = usePrice(editId);
    const userLoggedIn = getLoggedInUser();

    useEffect(() => {
        if (!editDetail) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditData({
            price: editDetail.price,
            isActive: (editDetail.isActive === "Y" ? "Y" : "N") as "Y" | "N",
            isPercentage: (editDetail.isPercentage === "Y" ? "Y" : "N") as "Y" | "N",
            paymentMethodUid: editDetail.paymentMethodUid ?? "",
            merchantUid: editDetail.merchantUid?.merchantUid ?? "",
        });
    }, [editDetail]);

    const { toasts, toast, clear } = useToast();

    const { items: paymentMethodData, loading: pmLoading } = usePaymentMethods({
        page: 1,
        limit: 150,
        sort: "createdAt",
        order: "desc",
    });

    const { items: merchant, loading: merchantLoading } = useMerchants({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
    });

    const merchantData = merchant?.filter(
        (merchant) => merchant.isActive === "Y"
    );

    const isLoading = loading || pmLoading || merchantLoading;
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const paginationData = {
        currentPage: page - 1,
        totalPage: pagination?.totalPages ?? 0,
        totalItems: pagination?.total ?? 0,
        size: pagination?.limit ?? pageSize,
    };

    const paymentMethodMap = Object.fromEntries(paymentMethodData.map((pm) => [pm.paymentMethodUid, pm]));

    // ── MERCHANT SEARCH ────────────────────────────────────────────────────
    const [merchantSearch, setMerchantSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeMerchantLabel, setActiveMerchantLabel] = useState(""); // nama merchant yang sedang aktif sebagai filter
    const searchRef = useRef<HTMLDivElement>(null);

    // Filter suggestions dari merchantData berdasarkan teks yang diketik
    const suggestions = merchantSearch.trim()
        ? merchantData.filter((m) => m.merchantDesc.toLowerCase().includes(merchantSearch.toLowerCase()))
        : [];

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const formatDate = (dateStr: string): string => {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!match) return dateStr;

        const [, year, month, day, hour, minute, second] = match;
        return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
    };

    const handleSelectMerchant = (uid: string, label: string) => {
        setActiveMerchantLabel(label);
        setMerchantSearch("");
        setShowSuggestions(false);
        setMerchantUid(uid);
        setPage(1);
    };

    const handleResetMerchantFilter = () => {
        setActiveMerchantLabel("");
        setMerchantSearch("");
        setMerchantUid("");
        setPage(1);
    };

    // ── RENDER HELPERS ─────────────────────────────────────────────────────
    const renderStatus = (status: "Y" | "N") => {
        const isActive = status === "Y";
        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
                {isActive ? "Active" : "Inactive"}
            </span>
        );
    };

    const renderPercentage = (val: "Y" | "N") => (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${val === "Y" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
        >
            {val === "Y" ? "Percentage" : "Fixed"}
        </span>
    );

    const renderPrice = (price: number, isPercentage: "Y" | "N") =>
        isPercentage === "Y"
            ? `${price}%`
            : new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })
                .format(price)
                .replace(/\s/g, "");

    const handleOpenDetailPanel = (row: PriceModel) => {
        setDetailId("");
        setShowDetailPanel(true);
        setTimeout(() => setDetailId(row.priceUid), 0);
    };

    // ── ADD ────────────────────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData(defaultForm);
        setShowAddModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
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
                createdBy: userLoggedIn?.userUid ?? "",
            });
            setShowAddModal(false);
            setFormData(defaultForm);
            setPage(1);
            refetch();
            toast.success("Price Created", "Price has been added successfully.");
        } catch (err) {
            setShowAddModal(false);
            setFormData(defaultForm);
            toast.error("Failed to Create", "Something went wrong. Please try again.");
            console.error("Failed to create price:", err);
        }
    };

    // ── EDIT ───────────────────────────────────────────────────────────────
    const handleOpenEditModal = (row: PriceModel) => {
        setEditData(defaultForm);
        setEditId("");
        setShowEditModal(true);
        setTimeout(() => setEditId(row.priceUid), 0);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
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
                createdBy: userLoggedIn?.userUid ?? "",
            });
            resetEdit();
            refetch();
            toast.success("Price Updated", "Price has been updated successfully.");
        } catch (err) {
            resetEdit();
            toast.error("Failed to Update", "Something went wrong. Please try again.");
            console.error("Failed to update price:", err);
        }
    };

    // ── DELETE ─────────────────────────────────────────────────────────────
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
            const isLastItemOnPage = items.length === 1 && page > 1;
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

    const activeCount = items.filter((i) => i.isActive === "Y").length;
    const inactiveCount = items.filter((i) => i.isActive === "N").length;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Price Management</h1>
                    <p className="text-slate-600">Manage all price configurations per merchant and payment method.</p>
                </div>
                {/* Stats Cards
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            label: "Total Prices",
                            value: pagination?.total ?? items.length,
                            icon: "💰",
                            description: "All price records",
                            gradient: "from-slate-50 to-white",
                            iconBg: "from-slate-500 to-slate-600",
                        },
                        {
                            label: "Active",
                            value: activeCount,
                            icon: "✅",
                            description: "Currently active",
                            gradient: "from-green-50 to-white",
                            iconBg: "from-green-500 to-green-600",
                        },
                        {
                            label: "Inactive",
                            value: inactiveCount,
                            icon: "🚫",
                            description: "Currently inactive",
                            gradient: "from-red-50 to-white",
                            iconBg: "from-red-500 to-red-600",
                        },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br ${card.gradient} p-5 shadow-sm transition-all duration-300 hover:shadow-xl`}
                        >
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
                                    <p className="mt-1 text-xs text-gray-400">{card.description}</p>
                                </div>
                                <div className={`inline-flex rounded-lg bg-linear-to-br ${card.iconBg} p-3 shadow-lg`}>
                                    <span className="text-lg">{card.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
                {/* Merchant Search Filter */}
                <div className="flex items-center gap-3">
                    <div ref={searchRef} className="relative w-72">
                        {/* Active filter badge — tampil saat merchant sudah dipilih */}
                        {activeMerchantLabel ? (
                            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                                <svg
                                    className="h-4 w-4 text-primary/60 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                <span className="flex-1 truncate font-medium text-slate-700">
                                    {activeMerchantLabel}
                                </span>
                                <button
                                    onClick={handleResetMerchantFilter}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Reset filter"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            /* Text input saat belum ada filter aktif */
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={merchantSearch}
                                    onChange={(e) => {
                                        setMerchantSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => merchantSearch && setShowSuggestions(true)}
                                    placeholder="Search merchant..."
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        )}

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {suggestions.map((m) => (
                                    <li key={m.merchantUid}>
                                        <button
                                            onMouseDown={(e) => e.preventDefault()} // cegah blur sebelum onClick
                                            onClick={() => handleSelectMerchant(m.merchantUid, m.merchantDesc)}
                                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            {m.merchantDesc}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* No results hint */}
                        {showSuggestions && merchantSearch.trim() && suggestions.length === 0 && !merchantLoading && (
                            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 shadow-lg">
                                No merchant found
                            </div>
                        )}
                    </div>
                </div>
                {/* Data Table */}
                <DataTable
                    columns={[
                        {
                            key: "paymentMethodUid",
                            title: "Payment Method",
                            render: (row: PriceModel) => {
                                const pm = paymentMethodMap[row.paymentMethodUid];
                                return pm ? (
                                    <div>
                                        <p className="font-medium text-slate-800">{pm.bank}</p>
                                    </div>
                                ) : (
                                    <span className="font-mono text-xs text-slate-400">
                                        {row.paymentMethodUid?.slice(0, 8)}…
                                    </span>
                                );
                            },
                        },
                        {
                            key: "merchant",
                            title: "Merchant",
                            render: (row: PriceModel) =>
                                row.merchant ? (
                                    <div>
                                        <p className="font-medium text-slate-800">{row.merchant.merchantDesc}</p>
                                    </div>
                                ) : (
                                    <span className="text-slate-400">—</span>
                                ),
                        },
                        {
                            key: "price",
                            title: "Price",
                            render: (row: PriceModel) => (
                                <span className="font-semibold text-slate-700">
                                    {renderPrice(row.price, row.isPercentage)}
                                </span>
                            ),
                        },
                        {
                            key: "isPercentage",
                            title: "Type",
                            render: (row: PriceModel) => renderPercentage(row.isPercentage),
                        },
                        {
                            key: "createdAt",
                            title: "Created At",
                            render: (row: PriceModel) => formatDate(row.createdAt),
                        },
                        {
                            key: "isActive",
                            title: "Status",
                            render: (row: PriceModel) => renderStatus(row.isActive),
                        },
                    ]}
                    data={items}
                    loading={isLoading}
                    pagination={paginationData}
                    onPageChange={(newPage: number) => setPage(newPage + 1)}
                    addButton={{
                        label: createLoading ? "Saving..." : "Add Price",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        header: "Actions",
                        render: (row: PriceModel) => (
                            <div className="flex justify-end gap-2">
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

            <AddPriceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                formData={formData}
                paymentMethodData={paymentMethodData}
                merchantData={merchantData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                loading={createLoading}
            />

            <EditPriceModal
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
                loading={updateLoading}
                fetchLoading={detailLoading}
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

            <PriceDetailPanel
                isOpen={showDetailPanel}
                onClose={() => {
                    setShowDetailPanel(false);
                    setDetailId("");
                }}
                data={detailData ?? null}
                loading={detailPanelLoading}
                paymentMethodMap={paymentMethodMap}
            />
        </div>
    );
}
