/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, DataTableFilterConfig, Pagination, SearchByOption } from "./types";

type Props<T, TSort extends string = string> = {
    columns: Column<T, TSort>[];
    data: T[];
    loading?: boolean;

    searchable?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearch?: (value: string) => void;
    searchByOptions?: SearchByOption[];
    searchBy?: string;
    onSearchByChange?: (value: string) => void;

    actions?: {
        header?: string;
        render: (row: T) => React.ReactNode;
    };
    filters?: DataTableFilterConfig[];
    customFilters?: React.ReactNode;
    addButton?: {
        label: string;
        onClick: () => void;
    };
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    emptyText?: string;

    sort?: TSort;
    order?: "asc" | "desc";
    onSortChange?: (sort: TSort, order: "asc" | "desc") => void;
};

export function DataTable<T, TSort extends string = string>({
    columns,
    data,
    searchable,
    searchPlaceholder = "Search...",
    searchValue,
    onSearch,
    searchByOptions,
    searchBy,
    onSearchByChange,
    filters,
    customFilters,
    addButton,
    actions,
    pagination,
    onPageChange,
    emptyText = "No data found",
    loading,
    sort,
    order = "desc",
    onSortChange,
}: Props<T, TSort>) {
    const handleSort = (sortKey: TSort) => {
        if (!onSortChange) return;

        const nextOrder =
            sort === sortKey ? (order === "asc" ? "desc" : "asc") : "asc";

        onSortChange(sortKey, nextOrder);
    };

    const renderSortIcon = (colSortKey: TSort) => {
        if (sort !== colSortKey) {
            return <span className="ml-2 text-gray-400">↕</span>;
        }

        return (
            <span className="ml-2 text-blue-600">
                {order === "asc" ? "↑" : "↓"}
            </span>
        );
    };

    const activeSearchByLabel = searchByOptions?.find((o) => o.value === searchBy)?.label;
    const resolvedPlaceholder = activeSearchByLabel
        ? `Search by ${activeSearchByLabel}...`
        : searchPlaceholder;

    return (
        <div className="rounded-xl bg-white shadow-sm border border-gray-200">
            {(searchable || filters?.length || customFilters || addButton) && (
                <div className="p-6 flex flex-wrap gap-4 justify-between border-b border-gray-200">
                    <div className="flex flex-wrap items-end gap-4">
                        {searchable && (
                            <div className="flex flex-none w-auto min-w-90 max-w-130">
                                {searchByOptions && searchByOptions.length > 0 && (
                                    <select
                                        value={searchBy}
                                        onChange={(e) => onSearchByChange?.(e.target.value)}
                                        className="
                                            shrink-0 rounded-l-lg border border-r-0 border-gray-300
                                            bg-gray-50 px-3 py-2 text-sm text-gray-600
                                            focus:border-blue-500 focus:outline-none focus:ring-2
                                            focus:ring-blue-500/20 cursor-pointer
                                        "
                                    >
                                        {searchByOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <input
                                    value={searchValue}
                                    className={`
                                        flex-1 min-w-45 border border-gray-300 px-4 py-2 text-sm
                                        focus:border-blue-500 focus:outline-none focus:ring-2
                                        focus:ring-blue-500/20
                                        ${searchByOptions && searchByOptions.length > 0
                                            ? "rounded-r-lg"
                                            : "rounded-lg"
                                        }
                                    `}
                                    placeholder={resolvedPlaceholder}
                                    onChange={(e) => onSearch?.(e.target.value)}
                                />
                            </div>
                        )}

                        {filters?.map((filter) => {
                            if (filter.type === "searchPair") {
                                return (
                                    <div key={filter.key} className="flex flex-col gap-1 min-w-[320px]">
                                        {filter.label && (
                                            <label className="text-xs font-medium text-gray-600">
                                                {filter.label}
                                            </label>
                                        )}

                                        <div className="flex">
                                            <select
                                                value={filter.selectValue}
                                                onChange={(e) => filter.onSelectChange(e.target.value)}
                                                className="
                                                    shrink-0 rounded-l-lg border border-r-0 border-gray-300
                                                    bg-gray-50 px-3 py-2 text-sm text-gray-600
                                                    focus:border-blue-500 focus:outline-none focus:ring-2
                                                    focus:ring-blue-500/20 cursor-pointer
                                                "
                                            >
                                                {filter.selectOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                value={filter.inputValue}
                                                onChange={(e) => filter.onInputChange(e.target.value)}
                                                placeholder={filter.inputPlaceholder ?? "Search..."}
                                                className="
                                                    w-full rounded-r-lg border border-gray-300 px-4 py-2 text-sm
                                                    focus:border-blue-500 focus:outline-none focus:ring-2
                                                    focus:ring-blue-500/20
                                                "
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={filter.key} className="flex flex-col gap-1">
                                    {filter.label && (
                                        <label className="text-xs font-medium text-gray-600">
                                            {filter.label}
                                        </label>
                                    )}

                                    <select
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={filter.value}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                    >
                                        {filter.options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}

                        {customFilters}
                    </div>

                    {addButton && (
                        <button
                            onClick={addButton.onClick}
                            className="rounded-lg cursor-pointer bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
                        >
                            {addButton.label}
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-max w-full">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            {columns.map((col) => {
                                const colSortKey = (col.sortKey ?? col.key) as TSort;
                                const isSortable = !!col.sortable;

                                return (
                                    <th
                                        key={String(col.key)}
                                        className="px-6 py-3 text-left text-xs font-bold tracking-wider text-gray-500"
                                    >
                                        {isSortable ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSort(colSortKey)}
                                                className="inline-flex items-center cursor-pointer select-none hover:text-blue-600"
                                            >
                                                {col.title}
                                                {renderSortIcon(colSortKey)}
                                            </button>
                                        ) : (
                                            col.title
                                        )}
                                        {col.headerInfo}
                                    </th>
                                );
                            })}

                            {actions && (
                                <th className="px-6 py-3 text-right text-xs font-bold tracking-wider text-gray-500">
                                    {actions.header ?? "Actions"}
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="py-12 text-center text-sm text-gray-500"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className={`px-6 py-4 text-sm ${col.className ?? ""}`}>
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </td>
                                    ))}

                                    {actions && (
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            {actions.render(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="py-12 text-center text-sm text-gray-500"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Page {pagination.currentPage + 1} of {pagination.totalPage}
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={pagination.currentPage === 0}
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            className="border border-gray-300 px-3 py-2 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={pagination.currentPage + 1 >= pagination.totalPage}
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            className="border border-gray-300 px-3 py-2 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
