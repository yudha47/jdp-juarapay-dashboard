/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TransactionStatusPie({ data }: any) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Transaction Quantity (Month)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((item: any, i: number) => (
                                <Cell key={i} fill={item.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
