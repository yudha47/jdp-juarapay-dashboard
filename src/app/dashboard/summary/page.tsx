"use client";
import { getLoggedInRole } from "../../../lib/auth";
import SummaryAdminContent from "./summary-admin-content";
import SummaryMerchantContent from "./summary-merchant-content";
import SummaryRegionContent from "./summary-region-content";
import SummarySuperContent from "./summary-super-content";

export default function DashboardPage() {
    const userData = getLoggedInRole();

    if (userData?.roleDesc.toLowerCase() === "super admin") {
        return <SummarySuperContent />;
    } else if (userData?.roleDesc.toLowerCase() === "admin") {
        return <SummaryAdminContent />;
    } else if (userData?.roleDesc.toLowerCase() === "merchant") {
        return <SummaryMerchantContent />;
    } else if (userData?.roleDesc.toLowerCase() === "region") {
        return <SummaryRegionContent />;
    } else {
        return <div>ROLE LAIN</div>;
    }
}
