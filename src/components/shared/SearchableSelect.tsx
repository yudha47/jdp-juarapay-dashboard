import { useEffect, useRef, useState } from "react";

type SearchableOption = {
    value: string;
    label: string;
};

type SearchableSelectProps = {
    label: string;
    placeholder?: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    options: SearchableOption[];
    loading?: boolean;
    search: string;
    setSearch: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    emptyText?: string;
};

export function SearchableSelect({
    label,
    placeholder = "Search...",
    value,
    onChange,
    options,
    loading = false,
    search,
    setSearch,
    required = false,
    disabled = false,
    emptyText = "No data found",
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = options.find((item) => item.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if(!open) return;

        requestAnimationFrame(() => {
            dropdownRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        });
    }, [open]);

    return (
        <div className="relative" ref={containerRef}>
            <label className="mb-2 block text-sm font-medium text-gray-900">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <button
                type="button"
                onClick={() => !disabled && setOpen((prev) => !prev)}
                disabled={disabled}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
                <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
                    {selectedOption?.label ?? `Select ${label.toLowerCase()}`}
                </span>
                <svg
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div 
                    ref={dropdownRef}
                    className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                    <div className="border-b border-gray-100 p-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={placeholder}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                        {/* {!loading && value && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(undefined);
                                    setOpen(false);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                                Clear selection
                            </button>
                        )} */}

                        {loading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                        ) : options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">{emptyText}</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                        option.value === value
                                            ? "bg-blue-50 font-medium text-blue-700"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}