"use client";

interface CategoryFormData {
    catDesc: string;
}

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: CategoryFormData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

export default function AddCategoryModal({
    isOpen,
    onClose,
    formData,
    onInputChange,
    onSubmit,
    loading,
}: AddCategoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">Add Category</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Category Name</label>
                        <input
                            type="text"
                            name="catDesc"
                            value={formData.catDesc}
                            onChange={onInputChange}
                            placeholder="e.g. Virtual Account"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Add Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
