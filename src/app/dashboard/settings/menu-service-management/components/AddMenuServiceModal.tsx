/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";

interface MenuServiceFormData {
    serviceDesc: string;
    pathMenu: string;
    iconMenu: string;
    dirIconMenu: string;
}

interface AddMenuServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: MenuServiceFormData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (field: "iconMenu" | "dirIconMenu", file: File | null, preview: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

export default function AddMenuServiceModal({
    isOpen,
    onClose,
    formData,
    onInputChange,
    onFileChange,
    onSubmit,
    loading = false,
}: AddMenuServiceModalProps) {
    const iconMenuRef = useRef<HTMLInputElement>(null);

    const [iconMenuPreview, setIconMenuPreview] = useState<string>("");

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "iconMenu" | "dirIconMenu",
        setPreview: (v: string) => void,
    ) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = ev.target?.result as string;
                setPreview(preview);
                onFileChange(field, file, preview);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview("");
            onFileChange(field, null, "");
        }
    };

    const handleClearFile = (
        field: "iconMenu" | "dirIconMenu",
        ref: React.RefObject<HTMLInputElement | null>,
        setPreview: (v: string) => void,
    ) => {
        if (ref.current) ref.current.value = "";
        setPreview("");
        onFileChange(field, null, "");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">Add Menu Service</h2>
                            <p className="text-xs text-slate-400">Fill in the details to add a new menu</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Service Desc */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Menu Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceDesc"
                                value={formData.serviceDesc}
                                onChange={onInputChange}
                                placeholder="e.g. Dashboard"
                                required
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-slate-800 placeholder-gray-400 outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Path Menu */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Path Menu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pathMenu"
                                value={formData.pathMenu}
                                onChange={onInputChange}
                                placeholder="e.g. /admin/dashboard"
                                required
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-slate-800 placeholder-gray-400 font-mono outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Icon Menu Upload */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Icon Menu <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-start gap-3">
                                {/* Preview */}
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                                    {iconMenuPreview ? (
                                        <img
                                            src={iconMenuPreview}
                                            alt="Icon preview"
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <svg
                                            className="h-6 w-6 text-gray-300"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </div>

                                {/* Upload area */}
                                <div className="flex-1">
                                    <div
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50"
                                        onClick={() => iconMenuRef.current?.click()}
                                    >
                                        <svg
                                            className="mb-1 h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <p className="text-xs text-gray-500">
                                            <span className="font-medium text-blue-600">Click to upload</span> or drag &
                                            drop
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, SVG (max 2MB)</p>
                                    </div>
                                    <input
                                        ref={iconMenuRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "iconMenu", setIconMenuPreview)}
                                    />
                                    {iconMenuPreview && (
                                        <button
                                            type="button"
                                            onClick={() => handleClearFile("iconMenu", iconMenuRef, setIconMenuPreview)}
                                            className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                                        >
                                            <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Remove file
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dir Icon Menu Upload */}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 transition-all"
                        >
                            {loading && (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            {loading ? "Saving..." : "Add Menu Service"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
