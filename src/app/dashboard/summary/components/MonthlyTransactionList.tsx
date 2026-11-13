/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MonthlyTransactionList({ data, formatCurrency }: any) {
    const maxAmount = Math.max(...data.map((d: any) => d.amount));

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Monthly Transaction Amount
                </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-5">
                <div className="max-h-105 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    {data.map((item: any, index: number) => {
                        const prev = index > 0 ? data[index - 1].amount : item.amount;
                        const growth = ((item.amount - prev) / prev) * 100;
                        const isPositive = growth >= 0;

                        return (
                            <div
                                key={index}
                                className="p-4 rounded-lg bg-linear-to-br from-slate-50 via-white to-slate-50 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-12 w-12 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-center font-semibold text-sm">{item.month}</span>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-slate-500 uppercase leading-none">
                                                Total Amount
                                            </p>
                                            <p className="font-bold text-lg text-slate-800 leading-tight">
                                                {formatCurrency(item.amount)}
                                            </p>
                                        </div>
                                    </div>

                                    {index > 0 && (
                                        <div
                                            className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-medium ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            <TrendingUp className={`h-3.5 w-3.5 ${!isPositive && "rotate-180"}`} />
                                            {isPositive ? "+" : ""}
                                            {growth.toFixed(1)}%
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 bg-slate-200 h-1 rounded-full">
                                    <div
                                        className="bg-linear-to-r from-indigo-500 to-indigo-600 h-1 rounded-full transition-all"
                                        style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
