import { routeAccessMap } from "@/config/routeAccess";
import { ROLES, type Role } from "@/constants/roles";

export function canAccess(
  role: Role,
  path: string
): boolean {
  if (role === ROLES.DEV) return true;
  
  const matchedRoute = routeAccessMap.find(
    (route) =>
      path === route.path ||
      path.startsWith(route.path + "/")
  );

  if (!matchedRoute) {
    return false;
  }

  return matchedRoute.roles.includes(role);
}
