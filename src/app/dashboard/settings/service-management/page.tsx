"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared/datatable/DataTable";
import { ServiceModel } from "@/data/models/ServiceModel";
import { useServices } from "@/hooks/useService";
import { formatDate } from "@/utils/formatDate";
import { useToast } from "@/components/ui/ToastProvider";
import { ServiceRequest } from "@/data/request/ServiceRequest";
import { createService, updateService } from "@/hooks/server/serviceService";
import { AddServiceModal } from "./components/AddServiceModal";
import { EditServiceModal } from "./components/EditServiceModal";

export default function ServiceManagement() {
    const { showToast } = useToast();
    const { services, loading, error, refetch: refetchServices } = useServices();

    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);

    const filteredServices = services.filter((service) =>
        service.serviceDesc.toLowerCase().includes(q.toLowerCase())
    );

    const tablePagination = {
        currentPage: page,
        size: filteredServices.length,
        totalPage: 1,
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceModel | null>(null);

    const handleEditService = (service: ServiceModel) => {
        setSelectedService(service);
        setIsEditModalOpen(true);
    };
    const submitAddService = async (newService: ServiceRequest) => {
        try {
          await createService(newService);
    
          showToast("Service created successfully!", "success");
          refetchServices();
        } catch (err) {
          showToast(
            (err as Error)?.message ?? "Failed to create service",
            "error"
          );
        } finally {
          setIsAddModalOpen(false);
        }
    };

    const submitEditService = async (updatedService: ServiceRequest) => {
        if (!selectedService) return;
    
        try {
          await updateService(selectedService.serviceUid, updatedService);
    
          showToast("Service updated successfully!", "success");
          setIsEditModalOpen(false);
          setSelectedService(null);
          refetchServices();
        } catch (err) {
          showToast(
            (err as Error)?.message ?? "Failed to update service",
            "error"
          );
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                    <p className="mt-2 text-slate-600">Manage and configure services within the system</p>
                </div>
                {/* Optional: error banner */}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <DataTable<ServiceModel>
                    columns={[
                        { key: "serviceDesc", title: "Service" },
                        { key: "pathMenu", title: "Path" },
                        { key: "iconMenu", title: "Icon" },
                        { key: "createdAt", title: "Created At", render: (val) => formatDate(val.createdAt) },
                        { key: "updatedAt", title: "Updated At", render: (val) => formatDate(val.updatedAt) },
                    ]}
                    data={filteredServices as ServiceModel[]}
                    loading={loading}
                    searchable
                    onSearch={(val) => setQ(val)}
                    pagination={tablePagination}
                    onPageChange={(nextZeroBased) => setPage(nextZeroBased + 1)} // DataTable zero-based -> API 1-based
                    addButton={{
                        label: "Add Service",
                        onClick: () => setIsAddModalOpen(true),
                    }}
                    actions={{
                        render: (row) => (
                            <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleEditService(row)}
                                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                title="Edit Service"
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

            {isAddModalOpen && (
                <AddServiceModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={submitAddService}
                />
            )}
            
            {isEditModalOpen && selectedService && (
                <EditServiceModal
                    service={selectedService}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedService(null);
                    }}
                    onSave={submitEditService}
                />
            )}
        </div>
    )
}