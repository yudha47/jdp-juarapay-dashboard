/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TransactionStatusCards({ stats }: any) {
    return (
        <div className="space-y-3">
            < div className="flex items-center justify-between" >
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">Summary Status Transaction</h3>
                    <p className="text-xs text-slate-400 mt-0.5"> </p>
                </div>
            </div >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <Card className="border-0 shadow-lg bg-linear-to-br from-green-50 to-green-100">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-green-700">Total Paid</p>
                            <h3 className="text-3xl font-bold text-green-800">{stats.totalPaid.toLocaleString()}</h3>
                        </div>
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-linear-to-br from-amber-50 to-amber-100">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-amber-700">Pending Paid</p>
                            <h3 className="text-3xl font-bold text-amber-800">{stats.pendingPaid.toLocaleString()}</h3>
                        </div>
                        <Clock className="h-10 w-10 text-amber-600" />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-linear-to-br from-red-50 to-red-100">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-red-700">Failed Paid</p>
                            <h3 className="text-3xl font-bold text-red-800">{stats.failedPaid.toLocaleString()}</h3>
                        </div>
                        <XCircle className="h-10 w-10 text-red-600" />
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
