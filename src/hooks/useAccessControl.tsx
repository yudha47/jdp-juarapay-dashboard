import { getLoggedInRole, getLoggedInUser } from "@/lib/auth";
import { useRoleByUid } from "./useRole";
import { useMemo } from "react";
import { canAccessPath, getAllowedPathPrefixes } from "@/utils/rbac";

export function useAccessControl() {
  const role = getLoggedInRole();
  const user = getLoggedInUser();
  const roleUid = role?.roleUid ?? user?.roleUid;
  const { data } = useRoleByUid(roleUid);

  const allowedPrefixes = useMemo(
    () => getAllowedPathPrefixes(data?.menus),
    [data?.menus],
  );

  const canAccess = (path: string) => canAccessPath(allowedPrefixes, path);

  return {
    role,
    roleApi: data,
    menus: data?.menus ?? [],
    allowedPrefixes,
    canAccess,
    isRoleActive: data?.isActive === "Y",
  };
}
