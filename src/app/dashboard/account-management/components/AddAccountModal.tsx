import { UserRequest } from "@/data/request/UserRequest";
import { useRoleMap } from "@/hooks/useRole";
import { getLoggedInRole } from "@/lib/auth";
import { useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

export function AddAccountModal({ onClose, onSave }: { onClose: () => void; onSave: (account: UserRequest) => void }) {
    const userLoggedInRole = getLoggedInRole();
    const { roles } = useRoleMap();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        roleUid: userLoggedInRole !== null && userLoggedInRole.roleDesc === "headquarter" ? roles.find(r => r.roleDesc === "headquarter")?.roleUid || "" : "",
        confirmPassword: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function validate() {
        const e: Record<string, string> = {}
        if (!formData.name.trim()) e.name = "Merchant name is required"
        if (!formData.email.trim()) e.email = "Email is required"
        if (!formData.username.trim()) e.username = "Username is required"
        if (!formData.roleUid.trim()) e.roleUid = "Account role is required"
        if (!formData.phone.trim()) e.phone = "Phone number is required"
        if (!formData.password) e.password = "Password is required"
        if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match"
        return e
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate()
        if (Object.keys(error).length) {
            setError(Object.values(error)[0])
            return
        }

        setLoading(true);

        try {
            const newAccount: UserRequest = {
                fullName: formData.name,
                email: formData.email,
                phone: parseInt(formData.phone) || 0,
                roleUid: formData.roleUid,
                userName: formData.username,
                userPass: formData.password,
            };
    
            onSave(newAccount);
        } catch (error) {
            console.error("Error creating account:", error);
            setError("An error occurred while creating the account. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-primary-foreground tracking-tight">Add New Account</h2>
                        </div>
                        <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                            <svg
                                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Fullname <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Fullname"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="6281234567890"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <PasswordInput
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <PasswordInput
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">
                                Account Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.roleUid}
                                onChange={(e) => setFormData({ ...formData, roleUid: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.roleUid} value={role.roleUid}>
                                        {role.roleDesc.charAt(0).toUpperCase() + role.roleDesc.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Role Info */}
                        {/* <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Account Role: Headquarter</p>
                                    <p className="mt-1 text-sm text-blue-700">
                                        This account will have access to national dashboard reporting
                                    </p>
                                </div>
                            </div>
                        </div> */}
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
                                    Creating...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}