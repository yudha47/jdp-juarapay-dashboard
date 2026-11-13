"use client";

import { TrendingUp, DollarSign } from "lucide-react";
import { StatCard } from "./StatCard";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StatsOverview({ stats, formatCurrency }: any) {
    const router = useRouter();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                title="Total Transaction"
                value={stats.totalTransaction.toLocaleString()}
                subtitle="This month"
                icon={TrendingUp}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                showDetail
                onDetailClick={() => router.push("/dashboard/transactions/transaction-list")}
            />

            <StatCard
                title="Total Amount"
                value={formatCurrency(stats.totalAmount)}
                subtitle="Revenue"
                icon={DollarSign}
                iconBg="bg-green-100"
                iconColor="text-green-600"
            />

            {/* <StatCard
                title="Without Fee"
                value={formatCurrency(stats.transactionWithoutFee)}
                subtitle="Net amount"
                icon={CreditCard}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
            /> */}

            {stats.margin !== undefined && (
                <StatCard
                    title="Our Margin"
                    value={formatCurrency(stats.margin)}
                    subtitle=""
                    icon={TrendingUp}
                    iconBg="bg-amber-100"
                    iconColor="text-amber-600"
                />
            )}
        </div>
    );
}
