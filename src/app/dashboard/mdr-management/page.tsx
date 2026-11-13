"use client";

import { getLoggedInRole } from "../../../lib/auth";
import MdrContent from "./mdr-content";
import MdrManagementContent from "./mdr-management-content";

export default function MdrManagement() {
    const role = getLoggedInRole();

    if (role?.roleDesc?.toLowerCase() === "super admin" || role?.roleDesc?.toLowerCase() === "dev") {
        return <MdrManagementContent />;
    } else if (role?.roleDesc?.toLowerCase() === "finance") {
        return <MdrManagementContent />;
    } else if (role?.roleDesc?.toLowerCase() === "admin" || role?.roleDesc?.toLowerCase() === "headquarter") {
        return <MdrContent />;
    }
}
