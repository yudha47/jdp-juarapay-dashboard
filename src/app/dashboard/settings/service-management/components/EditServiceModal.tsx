import { ServiceModel } from "@/data/models/ServiceModel";
import { ServiceRequest } from "@/data/request/ServiceRequest";
import { useState } from "react";

export function EditServiceModal({
    service,
    onClose,
    onSave,
}: {
    service: ServiceModel;
    onClose: () => void;
    onSave: (service: ServiceRequest) => void;
}) {
    
    const [formData, setFormData] = useState<ServiceRequest>({
        serviceDesc: service.serviceDesc ?? "",
        pathMenu: service.pathMenu ?? "",
        iconMenu: service.iconMenu ?? "",
        dirIconMenu: service.dirIconMenu ?? "/service",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        onSave({
            serviceDesc: formData.serviceDesc,
            pathMenu: formData.pathMenu,
            iconMenu: formData.iconMenu,
            dirIconMenu: formData.dirIconMenu,
        });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Service</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Service Description <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Service Description"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.serviceDesc}
                                onChange={(e) => setFormData({ ...formData, serviceDesc: e.target.value })}
                                required
                            />
                        </div>

                        {/* Path Menu */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Path Menu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Path Menu"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.pathMenu}
                                onChange={(e) => setFormData({ ...formData, pathMenu: e.target.value })}
                                required
                            />
                        </div>

                        {/* Icon Menu */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Icon Menu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Icon Menu"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.iconMenu}
                                onChange={(e) => setFormData({ ...formData, iconMenu: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
