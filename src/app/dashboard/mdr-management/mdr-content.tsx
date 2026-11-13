"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../components/shared/datatable/DataTable";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePaymentMethodByMerchant } from "../../../hooks/usePaymentMethod";
import { getLoggedInUser } from "../../../lib/auth";
import { MerchantInfoCard } from "./components/MerchantInfoCard";
import { useMerchant } from "../../../hooks/useMerchant";
import { usePrices } from "../../../hooks/usePrice";
import { useUser } from "../../../hooks/useUsers";

const PAGE_SIZE = 5;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MdrContent() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 600);
    const [currentPage, setCurrentPage] = useState(0);
    const userData = getLoggedInUser();
    const { data: userDetail, loading: loadingUser } = useUser(userData?.userUid);

    const {
        items,
        loading: loadingPrice,
        setMerchantUid,
    } = usePrices({
        page: 1,
        limit: 400,
        merchantUid: "",
    });

    useEffect(() => {
        if (userDetail?.merchantUid) {
            setMerchantUid(userDetail.merchantUid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userDetail?.merchantUid]);

    const { data, loading, error, refetch } = usePaymentMethodByMerchant({
        merchantUid: userDetail?.merchantUid || "",
        roleUid: userData?.roleUid || "",
    });

    const isLoading = loading || loadingPrice || loadingUser;

    const dataMDR = data?.filter((d) => items?.some((i) => i.priceUid === d.price?.priceUid));
    const { data: dataMerchant } = useMerchant(userDetail?.merchantUid || "");

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 20,
        }).format(value);
    };

    const formatPercentage = (value: number): string => `${value.toFixed(2)}%`;

    const renderStatus = (isActive: "Y" | "N") => {
        const config =
            isActive === "Y"
                ? { bg: "bg-green-100", text: "text-green-800", label: "Active" }
                : { bg: "bg-red-100", text: "text-red-800", label: "Inactive" };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    const sortedAndFiltered = useMemo(() => {
        let result = [...(dataMDR ?? [])].sort((a, b) => {
            const catA = a.category?.catDesc ?? "";
            const catB = b.category?.catDesc ?? "";
            return catA.localeCompare(catB);
        });

        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(
                (item) =>
                    item.bank?.toLowerCase().includes(q) ||
                    item.category?.catDesc?.toLowerCase().includes(q) ||
                    item.pgate?.pgDesc?.toLowerCase().includes(q),
            );
        }

        return result;
    }, [dataMDR, debouncedSearch]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(0);
    }, [debouncedSearch]);

    const totalPage = Math.max(1, Math.ceil(sortedAndFiltered.length / PAGE_SIZE));

    const pagedData = useMemo(() => {
        const start = currentPage * PAGE_SIZE;
        return sortedAndFiltered.slice(start, start + PAGE_SIZE);
    }, [sortedAndFiltered, currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    if (userDetail?.merchantUid === null) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Method Information</h1>
                            <p className="text-slate-600">This Payment Method information for merchant.</p>
                        </div>
                    </div>

                    <div className="mb-6 w-fit rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Akun anda belum terdaftar sebagai merchant.
                    </div>
                </div>
            </div>
        );
    }

    if (dataMDR?.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Method Information</h1>
                            <p className="text-slate-600">This Payment Method information for merchant.</p>
                        </div>
                    </div>

                    <div className="mb-6 w-fit rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        This merchant has no Payment Method information yet.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Method Information</h1>
                        <p className="text-slate-600">This Payment Method information for merchant.</p>
                    </div>
                </div>

                {/* Merchant Info */}
                <MerchantInfoCard merchant={dataMerchant} />

                {/* Error State */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        ⚠️ {error}
                        <button onClick={refetch} className="ml-3 underline font-medium">
                            Retry
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <DataTable
                    columns={[
                        {
                            key: "category",
                            title: "Category",
                            render: (row) => row.category?.catDesc ?? "-",
                        },
                        {
                            key: "bank",
                            title: "Payment Method",
                        },
                        {
                            key: "paymentCode",
                            title: "Payment Code",
                            render: (row) => row.paymentCode,
                        },
                        {
                            key: "isActive",
                            title: "Status",
                            render: (row) => renderStatus(row.isActive),
                        },
                        {
                            key: "price",
                            title: "Price",
                            render: (row) => {
                                if (!row.price) return "-";
                                return row.price.isPercentage === "Y"
                                    ? formatPercentage(row.price.price)
                                    : formatCurrency(row.price.price);
                            },
                        },
                    ]}
                    data={pagedData}
                    loading={isLoading}
                    searchable
                    onSearch={(val) => {
                        setSearch(val);
                        setCurrentPage(0);
                    }}
                    pagination={{
                        currentPage,
                        totalPage,
                        size: PAGE_SIZE,
                    }}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
