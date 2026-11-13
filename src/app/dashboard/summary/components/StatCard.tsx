import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    showDetail?: boolean;
    onDetailClick?: () => void;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
    showDetail = false,
    onDetailClick,
}: StatCardProps) {
    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardContent className="p-6 h-full">
                <div className="flex flex-col h-full relative">
                    {/* Icon di pojok kanan atas */}
                    <div
                        className={`absolute top-0 right-0 h-8 w-8 ${iconBg} rounded-full flex items-center justify-center`}
                    >
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>

                    {/* Konten */}
                    <div className="flex-1 pr-12">
                        <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>

                        <h3 className="text-xl lg:text-2xl font-bold text-slate-800 wrap-break-words">{value}</h3>

                        {(subtitle || showDetail) && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                {subtitle && <span className="text-slate-500 whitespace-nowrap">{subtitle}</span>}

                                {subtitle && showDetail && <span className="text-slate-400">•</span>}

                                {showDetail && (
                                    <button
                                        type="button"
                                        onClick={onDetailClick}
                                        className="cursor-pointer font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                                    >
                                        Lihat detail
                                        <span>→</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
