"use client";
import { getLoggedInRole } from "@/lib/auth";
import MerchantAdminContent from "./merchant-admin-content";
import MerchantContent from "./merchant-content";

export default function MerchantManagementPage() {
    const role = getLoggedInRole();

    if (role?.roleDesc?.toLowerCase() === "super admin" || role?.roleDesc?.toLowerCase() === "dev") {
        return <MerchantAdminContent />
    } 
    return <MerchantContent />
}