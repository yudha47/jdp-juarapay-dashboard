import { ReportTrxPerMonthModel } from "@/data/models/ReportTrxPerMonthModel";

export type DashboardSummaryStats = {
    totalTransaction: number;
    totalAmount: number;
    transactionWithoutFee: number;
    margin: number;
    totalPaid: number;
    pendingPaid: number;
    failedPaid: number;
};

// const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// export function formatPeriodLabel(period: number | string): string {
//   const value = String(period);

//   const year = value.slice(0, 4);
//   const month = value.slice(4, 6);

//   const date = new Date(Number(year), Number(month) - 1);

//   return date.toLocaleString("id-ID", {
//     month: "long",
//     year: "numeric",
//   });
// }

export function formatPeriodLabel(period: string | number): string {
    const value = String(period);
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);

    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    return `${monthNames[Number(month) - 1]} ${year}`;
}

export function getMonthOptions(items: ReportTrxPerMonthModel[]) {
    const periods = Array.from(new Set(items.map((item) => item.period))).sort((a, b) => Number(b) - Number(a));

    return periods.map((period) => ({
        value: period,
        label: formatPeriodLabel(period),
    }));
}

export function getLatestPeriod(items: ReportTrxPerMonthModel[]): string | null {
    if (!items.length) return null;

    return (
        items
            .map((item) => item.period)
            .sort()
            .at(-1) ?? null
    );
}

export function filterItemsByPeriod(items: ReportTrxPerMonthModel[], period?: string | null) {
    if (!period) return [];

    return items.filter((item) => item.period === period);
}

export function aggregateStats(items: ReportTrxPerMonthModel[]): DashboardSummaryStats {
    return items.reduce<DashboardSummaryStats>(
        (acc, item) => {
            const status = item.status?.toLowerCase().trim();
            const count = item.countStatus ?? 0;

            acc.totalTransaction += count;
            acc.transactionWithoutFee += item.nettProfit;

            switch (status) {
                case "paid":
                    acc.totalPaid += count;
                    acc.totalAmount += item.total;
                    acc.margin += item.margin;
                    break;

                case "pending-paid":
                case "request":
                    acc.pendingPaid += count;
                    break;

                default:
                    acc.failedPaid += count;
                    break;
            }

            return acc;
        },
        {
            totalTransaction: 0,
            totalAmount: 0,
            transactionWithoutFee: 0,
            margin: 0,
            totalPaid: 0,
            pendingPaid: 0,
            failedPaid: 0,
        },
    );
}
