export function Pagination({
    currentPage,
    total,
    onChange,
}: {
    currentPage: number;
    total: number;
    onChange: (p: number) => void;
}) {
    const getPages = (): (number | "...")[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        const pages: (number | "...")[] = [1];

        if (currentPage > 4) pages.push("...");

        const start = Math.max(2, currentPage - 2);
        const end = Math.min(total - 1, currentPage + 2);

        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < total - 3) pages.push("...");

        pages.push(total);
        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
                Page {currentPage} of {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ‹ Prev
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400 select-none">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                p === currentPage
                                    ? "bg-primary text-white"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {p}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onChange(Math.min(total, currentPage + 1))}
                    disabled={currentPage === total}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}
