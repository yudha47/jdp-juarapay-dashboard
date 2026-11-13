/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function PaymentMethodList({ data }: any) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">Top 5 Payment Methods</CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
                {data.map((method: any, index: number) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm font-medium">
                            <span>{method.method}</span>
                            {/* <span className="text-slate-500">{method.count.toLocaleString()} Transaction</span> */}
                        </div>

                        {/* Total amount */}
                        <div className="text-xs text-slate-400 mt-0.5">
                            Rp {method.total.toLocaleString("id-ID")}
                        </div>

                        <div className="h-2 bg-slate-200 rounded-full mt-2">
                            <div
                                className="h-2 bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                                style={{ width: `${method.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}