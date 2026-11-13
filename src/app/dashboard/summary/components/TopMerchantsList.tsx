/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TopMerchantsList({ data, formatCurrency }: any) {
    const totalTransactions = data.reduce((sum: number, m: any) => sum + m.transactions, 0);

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Top Transaction Merchants
                </CardTitle>
            </CardHeader>

            <CardContent className="px-6 pb-6">
                <div className="max-h-105 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    {data.map((merchant: any, index: number) => (
                        <div
                            key={index}
                            className="group flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-slate-50 to-white hover:from-blue-50 hover:to-white border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="h-12 w-12 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 mb-1">{merchant.name}</p>
                                    <span className="text-xs text-slate-500">
                                        {merchant.transactions.toLocaleString()} transactions •{" "}
                                        {((merchant.transactions / totalTransactions) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="text-right ml-4">
                                <p className="font-bold text-slate-800">{formatCurrency(merchant.amount)}</p>
                                <p className="text-xs text-slate-500">Total revenue</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
