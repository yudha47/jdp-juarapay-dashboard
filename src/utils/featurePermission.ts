import { ROLES, type Role } from "@/constants/roles";
import { featureAccessMap } from "@/config/featureAccess";

export function canAccessFeature(role: Role, feature: string): boolean {
    if (role === ROLES.DEV) return true;
    
    const found = featureAccessMap.find((item) => item.feature === feature);

    if (!found) return false;

    return found.roles.includes(role);
}
