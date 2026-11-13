import React from "react";

interface RoleFormData {
    isActive: string;
    roleDesc: string;
}

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: RoleFormData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

export default function EditRoleModal({
    isOpen,
    onClose,
    formData,
    onInputChange,
    onSubmit,
    loading,
}: EditRoleModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <svg
                                    className="h-6 w-6 text-yellow-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5h2m-1-1v2m-6 8l8-8 4 4-8 8H5v-4z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit Role</h2>
                                <p className="text-sm text-gray-500">Update existing system role</p>
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
                        {/* Role Information */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Role Information</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Role Name */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Role Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="roleDesc"
                                        value={formData.roleDesc}
                                        onChange={onInputChange}
                                        placeholder="e.g., Admin, Merchant, Supervisor"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        required
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="isActive"
                                        value={formData.isActive}
                                        onChange={onInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <div className="flex gap-2">
                                <svg
                                    className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600"
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
                                <div className="text-sm text-yellow-800">
                                    <p className="mb-1 font-semibold">Important Notes:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Role name must remain unique</li>
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
                            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            onClick={onSubmit}
                            disabled={loading}
                            className="cursor-pointer rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
