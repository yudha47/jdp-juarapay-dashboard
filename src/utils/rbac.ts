import { RoleMenu } from "@/data/models/RoleModel";

function normalize(p: string) {
  // buang whitespace (termasuk \t) di ujung & pangkas trailing slash
  return p.trim().replace(/\/+$/, "");
}

export function getAllowedPathPrefixes(menus: RoleMenu[] | undefined) {
  if (!menus?.length) return [];

  return menus
    .filter((m) => m.status === "Y" && m.permission === "Y" && !!m.pathMenu)
    .map((m) => normalize(m.pathMenu!));
}

export function canAccessPath(allowedPrefixes: string[], pathname: string) {
  const clean = normalize(pathname);
  return allowedPrefixes.some((prefix) => {
    const p = normalize(prefix);
    return clean === p || clean.startsWith(p + "/");
  });
}