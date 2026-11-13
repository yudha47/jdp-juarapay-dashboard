import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
    title: {
        default: "JuaraPay | Payment Aggregation Dashboard",
        template: "%s | Payment Aggregation",
    },
    description:
        "Dashboard sistem payment aggregation untuk memantau transaksi, settlement, dan laporan keuangan secara real-time.",
    keywords: [
        "payment aggregation",
        "payment gateway",
        "dashboard transaksi",
        "financial dashboard",
        "settlement",
        "monitoring pembayaran",
    ],

    applicationName: "Payment Aggregation Dashboard",
    authors: [{ name: "Payment Aggregation Team" }],
    creator: "Payment Aggregation Team",

    robots: {
        index: false,
        follow: false,
    },

    openGraph: {
        title: "Payment Aggregation Dashboard",
        description: "Sistem dashboard internal untuk monitoring dan manajemen transaksi payment aggregation.",
        siteName: "Payment Aggregation",
        type: "website",
    },

    icons: {
        icon: "/assets/images/favicon.png",
        apple: "/assets/images/favicon.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
