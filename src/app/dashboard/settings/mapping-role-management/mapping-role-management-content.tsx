"use client";

import { useState } from "react";
import { DataTable } from "../../../../components/shared/datatable/DataTable";
import {
    useCreateMappingRoleService,
    useDeleteMappingRoleService,
    useMappingRoleService,
    useUpdateMappingRoleService,
} from "../../../../hooks/useMappingRoleService";
import { MappingRoleEnriched, MappingRoleServiceModel } from "../../../../data/models/MappingRoleServiceModel";
import AddMappingRoleModal from "./components/AddMappingRoleModal";
import EditMappingRoleModal from "./components/EditMappingRoleModal";
import { ToastContainer, useToast } from "../../../../components/shared/Toast";

// ✅ Ganti FormData ke shape mapping
interface MappingFormData {
    roleUid: string;
    servicesUid: string;
    permission: "Y" | "N";
    status: "Y" | "N";
}

const defaultForm: MappingFormData = {
    roleUid: "",
    servicesUid: "",
    permission: "Y",
    status: "Y",
};

export default function MappingRoleManagementContent() {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<MappingFormData>(defaultForm);
    const [editFormData, setEditFormData] = useState<MappingFormData>(defaultForm);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 5;
    const { toasts, toast, clear } = useToast();

    const { enrichedData, roles, services, loading, refetch } = useMappingRoleService(); // ✅ tambah refetch (lihat poin 3)
    const { create, loading: createLoading } = useCreateMappingRoleService();
    const { update, loading: updateLoading } = useUpdateMappingRoleService();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { remove, loading: deleteLoading } = useDeleteMappingRoleService();

    const filteredData = enrichedData.filter(
        (item) =>
            item.roleDesc.toLowerCase().includes(search.toLowerCase()) ||
            item.serviceDesc.toLowerCase().includes(search.toLowerCase()),
    );
    // Tambahkan ini setelah kalkulasi pagination
    const total = filteredData.length;
    const pagination = {
        currentPage: page,
        totalPage: Math.ceil(total / pageSize),
        totalItems: total,
        size: pageSize,
    };

    const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

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

    const renderPermission = (status: "Y" | "N") => {
        const isActive = status === "Y";
        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
                {isActive ? "Allowed" : "Denied"}
            </span>
        );
    };

    const handleOpenAddModal = () => {
        setFormData(defaultForm);
        setShowAddModal(true);
    };

    const handleOpenEditModal = (row: MappingRoleServiceModel) => {
        setEditingId(row.mappingUid);
        setEditFormData({
            roleUid: row.roleUid,
            servicesUid: row.servicesUid,
            permission: row.permission,
            status: row.status,
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create(formData);
            setShowAddModal(false);
            setFormData(defaultForm);
            refetch();
            toast.success("Mapping Created", "Role service mapping has been added successfully.");
        } catch (err) {
            setShowAddModal(false); // ✅ tutup modal saat gagal
            setFormData(defaultForm); // ✅ reset form
            toast.error("Failed to Create", "Something went wrong. Please try again.");
            console.error("Failed to create mapping:", err);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await update(editingId, editFormData);
            setShowEditModal(false);
            setEditingId(null);
            refetch();
            toast.success("Mapping Updated", "Changes have been saved successfully.");
        } catch (err) {
            setShowEditModal(false); // ✅ tutup modal saat gagal
            setEditingId(null); // ✅ reset editingId
            toast.error("Failed to Update", "Something went wrong. Please try again.");
            console.error("Failed to update mapping:", err);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await remove(deleteId);

            toast.success("Mapping Deleted", "Role service mapping has been removed.");
            refetch();
        } catch (err) {
            toast.error("Failed to Delete", "Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Mapping Role Service Management</h1>
                        <p className="text-slate-600">This page is under construction.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            label: "Total Role Service",
                            value: enrichedData.length,
                            icon: "🗂️",
                            description: "All Role Service in the system",
                            gradient: "from-slate-50 to-white",
                            iconBg: "from-slate-500 to-slate-600",
                            shadow: "hover:shadow-slate-200/50",
                        },
                        {
                            label: "Active Role Service",
                            value: enrichedData.filter((item) => item.status === "Y").length,
                            icon: "✅",
                            description: "Role service currently active",
                            gradient: "from-green-50 to-white",
                            iconBg: "from-green-500 to-green-600",
                            shadow: "hover:shadow-green-200/50",
                        },
                        {
                            label: "Inactive Role Service",
                            value: enrichedData.filter((item) => item.status === "N").length,
                            icon: "🚫",
                            description: "Role service currently inactive",
                            gradient: "from-red-50 to-white",
                            iconBg: "from-red-500 to-red-600",
                            shadow: "hover:shadow-red-200/50",
                        },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br ${card.gradient} p-5 shadow-sm transition-all duration-300 hover:shadow-xl ${card.shadow}`}
                        >
                            {/* Decorative circle */}
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-white opacity-20 transition-transform duration-500 group-hover:scale-150"></div>

                            <div className="relative flex items-start justify-between">
                                <div className="flex-1">
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
                </div>
                <DataTable
                    columns={[
                        {
                            key: "roleDesc",
                            title: "Role Name",
                        },
                        {
                            key: "serviceDesc",
                            title: "Service",
                        },
                        {
                            key: "status",
                            title: "Status",
                            render: (row: MappingRoleEnriched) => renderStatus(row.status),
                        },
                        {
                            key: "permission",
                            title: "Permission",
                            render: (row: MappingRoleEnriched) => renderPermission(row.permission),
                        },
                    ]}
                    data={paginatedData}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search role name..."
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(0); // reset page saat search
                    }}
                    pagination={pagination}
                    onPageChange={(newPage: number) => setPage(newPage)}
                    addButton={{
                        label: createLoading ? "Saving..." : "Add Mapping Role Service",
                        onClick: handleOpenAddModal,
                    }}
                    actions={{
                        header: "Actions",
                        render: (row: MappingRoleServiceModel) => (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenEditModal(row)}
                                    className="cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    title="Edit Account"
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
                                        setDeleteId(row.mappingUid);
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

                <AddMappingRoleModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    formData={formData}
                    roles={roles}
                    services={services}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    loading={createLoading}
                />
                <EditMappingRoleModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    formData={editFormData}
                    roles={roles}
                    services={services}
                    onInputChange={handleEditInputChange}
                    onSubmit={handleEditSubmit}
                    loading={updateLoading}
                />
            </div>
            <ToastContainer toasts={toasts} onRemove={clear} />
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-800">Delete Mapping Role Service</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this mapping? This action cannot be undone.
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
