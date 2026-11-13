import React from "react";
import { RoleModel } from "../../../../../data/models/RoleModel";
import { ServiceModel } from "../../../../../data/models/ServiceModel";

interface MappingRoleFormData {
    roleUid: string;
    servicesUid: string;
    permission: string;
    status: string;
}

interface AddMappingRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: MappingRoleFormData;
    roles: RoleModel[];
    services: ServiceModel[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

export default function AddMappingRoleModal({
    isOpen,
    onClose,
    formData,
    roles,
    services,
    onInputChange,
    onSubmit,
    loading,
}: AddMappingRoleModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <svg
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add Mapping Role</h2>
                                <p className="text-sm text-gray-500">Assign a service to a role</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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
                </div>

                {/* Body */}
                <form onSubmit={onSubmit} className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Mapping Information</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Role */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="roleUid"
                                        value={formData.roleUid}
                                        onChange={onInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map((role) => (
                                            <option key={role.roleUid} value={role.roleUid}>
                                                {role.roleDesc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Service */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Service <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="servicesUid"
                                        value={formData.servicesUid}
                                        onChange={onInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Service</option>
                                        {services.map((service) => (
                                            <option key={service.serviceUid} value={service.serviceUid}>
                                                {service.serviceDesc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Permission */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Permission <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="permission"
                                        value={formData.permission}
                                        onChange={onInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Permission</option>
                                        <option value="Y">Allowed</option>
                                        <option value="N">Denied</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={onInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <div className="flex gap-2">
                                <svg
                                    className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
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
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Important Notes:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Each role-service combination must be unique</li>
                                        <li>Permission controls access rights for the selected service</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            onClick={onSubmit}
                            disabled={loading}
                            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading ? "Saving..." : "Add Mapping"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
