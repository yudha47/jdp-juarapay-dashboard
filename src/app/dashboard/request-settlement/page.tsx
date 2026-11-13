"use client";
import { getLoggedInRole } from "../../../lib/auth";
import RequestSettlementContent from "./request-settlement-content";
import RequestSettlementSuperContent from "./request-settlement-super-content";

export default function RequestSettlement() {
    const userData = getLoggedInRole();
    if (userData?.roleDesc.toLowerCase() === "super admin" || userData?.roleDesc.toLowerCase() === "dev") {
        return <RequestSettlementSuperContent />;
    } else {
        return <RequestSettlementContent />;
    }
}
