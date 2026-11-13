/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { DataTable } from "../../../../components/shared/datatable/DataTable";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";
import AddMenuServiceModal from "./components/AddMenuServiceModal";
import EditMenuServiceModal from "./components/EditMenuServiceModal";
import { useServices } from "../../../../hooks/useService";

interface MenuServiceItem {
    serviceUid: string;
    serviceDesc: string;
    pathMenu: string;
    iconMenu: string;
    dirIconMenu: string;
    createdAt: string;
    updatedAt: string;
}

interface MenuServiceFormData {
    serviceDesc: string;
    pathMenu: string;
    iconMenu: string;
    dirIconMenu: string;
}

const defaultForm: MenuServiceFormData = {
    serviceDesc: "",
    pathMenu: "",
    iconMenu: "",
    dirIconMenu: "",
};

export default function MenuServiceManagementContent() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 5;

    // ── Modal & form state ──────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MenuServiceFormData>(defaultForm);
    const [editFormData, setEditFormData] = useState<MenuServiceFormData>(defaultForm);

    // Replace with real service hooks when ready
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    const { toasts, toast, clear } = useToast();

    const { services } = useServices();

    // ── Filtering & pagination ──────────────────────────────────────────────
    const filteredData = services.filter(
        (item) =>
            item.serviceDesc.toLowerCase().includes(search.toLowerCase()) ||
            item.pathMenu.toLowerCase().includes(search.toLowerCase()),
    );

    const pagination = {
        currentPage: page,
        totalPage: Math.ceil(filteredData.length / pageSize),
        totalItems: filteredData.length,
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

    // `_file` is the raw File object — pass it to FormData when calling the real API
    const handleAddFileChange = (field: "iconMenu" | "dirIconMenu", _file: File | null, preview: string) => {
        setFormData((prev) => ({ ...prev, [field]: preview }));
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            // TODO: replace with real API call → await create(formData)
            await new Promise((r) => setTimeout(r, 800));
            setShowAddModal(false);
            setFormData(defaultForm);
            toast.success("Menu Created", "New menu service has been added successfully.");
        } catch {
            setShowAddModal(false);
            setFormData(defaultForm);
            toast.error("Failed to Create", "Something went wrong. Please try again.");
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Edit handlers ───────────────────────────────────────────────────────
    const handleOpenEditModal = (row: MenuServiceItem) => {
        setEditingId(row.serviceUid);
        setEditFormData({
            serviceDesc: row.serviceDesc,
            pathMenu: row.pathMenu,
            iconMenu: row.iconMenu,
            dirIconMenu: row.dirIconMenu,
        });
        setShowEditModal(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditFileChange = (field: "iconMenu" | "dirIconMenu", _file: File | null, preview: string) => {
        // When user clears upload (preview = ""), retain the existing URL
        setEditFormData((prev) => ({
            ...prev,
            [field]: preview || prev[field],
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setUpdateLoading(true);
        try {
            // TODO: replace with real API call → await update(editingId, editFormData)
            await new Promise((r) => setTimeout(r, 800));
            setShowEditModal(false);
            setEditingId(null);
            toast.success("Menu Updated", "Changes have been saved successfully.");
        } catch {
            setShowEditModal(false);
            setEditingId(null);
            toast.error("Failed to Update", "Something went wrong. Please try again.");
        } finally {
            setUpdateLoading(false);
        }
    };

    // ── Renderers ───────────────────────────────────────────────────────────
    const renderIcon = (row: MenuServiceItem) => (
        <div className="flex items-center gap-2">
            <img
                src={row.iconMenu}
                alt={row.serviceDesc}
                className="h-8 w-8 rounded-md object-contain border border-gray-100 p-1 bg-white shadow-sm"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/1177/1177568.png";
                }}
            />
        </div>
    );

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Menu Service Management</h1>
                        <p className="text-slate-600">Manage and configure menu services available in the system.</p>
                    </div>
                </div>

                <DataTable
                    columns={[
                        {
                            key: "iconMenu",
                            title: "Icon",
                            render: (row: MenuServiceItem) => renderIcon(row),
                        },
                        {
                            key: "serviceDesc",
                            title: "Menu Name",
                        },
                        {
                            key: "pathMenu",
                            title: "Path",
                            render: (row: MenuServiceItem) => (
                                <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                                    {row.pathMenu}
                                </code>
                            ),
                        },
                        {
                            key: "dirIconMenu",
                            title: "Icon Directory",
                            render: (row: MenuServiceItem) => (
                                <span className="text-xs text-slate-500">{row.dirIconMenu}</span>
                            ),
                        },
                        {
                            key: "createdAt",
                            title: "Created At",
                            render: (row: MenuServiceItem) => (
                                <span className="text-sm text-slate-600">{formatDate(row.createdAt)}</span>
                            ),
                        },
                    ]}
                    data={filteredData}
                    loading={false}
                    searchable
                    searchPlaceholder="Search menu name or path..."
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(0);
                    }}
                    pagination={pagination}
                    onPageChange={(newPage: number) => setPage(newPage)}
                    addButton={{
                        label: createLoading ? "Saving..." : "Add Menu Service",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        header: "Actions",
                        render: (row: MenuServiceItem) => (
                            <div className="flex justify-end gap-2">
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
                />
            </div>

            {/* Add Modal */}
            <AddMenuServiceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                formData={formData}
                onInputChange={handleAddInputChange}
                onFileChange={handleAddFileChange}
                onSubmit={handleAddSubmit}
                loading={createLoading}
            />

            {/*
             * Edit Modal
             * key={editingId} causes EditMenuServiceModal to remount its inner
             * component whenever a different row is selected, so the file upload
             * previews reset to the new row's data without needing useEffect.
             */}
            <EditMenuServiceModal
                key={editingId}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                formData={editFormData}
                onInputChange={handleEditInputChange}
                onFileChange={handleEditFileChange}
                onSubmit={handleEditSubmit}
                loading={updateLoading}
            />

            <ToastContainer toasts={toasts} onRemove={clear} />
        </div>
    );
}
