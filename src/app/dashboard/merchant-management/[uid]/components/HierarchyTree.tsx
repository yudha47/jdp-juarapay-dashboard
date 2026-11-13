"use client";

import { useEffect, useMemo, useState } from "react";
import { ClusterDetailedModel } from "@/data/models/ClusterModel";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";
import { SiteDetailedModel } from "@/data/models/SiteModel";
import { RegionDetailedModel } from "@/data/models/RegionModel";
import { DeviceModel } from "@/data/models/DeviceModel";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { UserModel } from "@/data/models/UserModel";
import { Pagination } from "@/data/response/BaseResponse";
import { apiClient } from "@/lib/apiClient";
import { ApiKeyInline } from "./ApiKeyInLine";
import { KeyIcon, UsersIcon } from "lucide-react";
import { getLoggedInRole } from "@/lib/auth";

interface Props {
    merchant: MerchantDetailedModel;
    level?: HierarchyLevel;
    search?: string;
    onEditRegion: (r: RegionDetailedModel) => void;
    onAddCluster: (regionUid: string) => void;
    onEditCluster: (c: ClusterDetailedModel, regionUid: string) => void;
    onAddSite: (clusterUid: string) => void;
    onEditSite: (s: SiteDetailedModel, clusterUid: string) => void;
    onAddDevice: (subMerchantUid: string) => void;
    onEditDevice: (t: DeviceModel, subMerchantUid: string) => void;
    onEditCredential: (deviceUid: string) => void;
    onAddSubMerchant: (siteUid: string, regionUid: string) => void;
    onEditSubMerchant: (sm: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleRegionStatus: (region: RegionDetailedModel) => void;
    onToggleSubMerchantStatus: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleDeviceStatus: (device: DeviceModel, subMerchantUid: string) => void;
    onAssignUser: (targetType: "merchant" | "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => void;
    apiKeyLazy: {
        fetchKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => void;
        getKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
        isLoading: (uid: string, type: "region" | "subMerchant", regionUid?: string) => boolean;
        getError: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
    };
    onRefreshApiKey: (uid: string, type: "region" | "subMerchant") => void;
}

export type HierarchyLevel = "all" | "region" | "cluster" | "site" | "subMerchant" | "device";

// ─── Search helpers ───────────────────────────────────────────────────────────
function textMatch(q: string, ...values: (string | undefined | null)[]) {
    if (!q) return true;
    return values.some((v) => (v ?? "").toLowerCase().includes(q));
}

function regionMatchesSearch(region: RegionDetailedModel, q: string) {
    return textMatch(q, region.regionDesc, region.regionId, region.bankName, region.bankNoRek);
}

export function filterRegionsBySearch(regions: RegionDetailedModel[], q: string): RegionDetailedModel[] {
    if (!q) return regions;

    const result: RegionDetailedModel[] = [];

    for (const region of regions) {
        if (regionMatchesSearch(region, q)) {
            result.push(region);
            continue;
        }

        const clusters: ClusterDetailedModel[] = [];

        for (const cluster of region.cluster ?? []) {
            if (textMatch(q, cluster.clusterDesc)) {
                clusters.push(cluster);
                continue;
            }

            const sites: SiteDetailedModel[] = [];

            for (const site of cluster.site ?? []) {
                if (textMatch(q, site.siteDesc)) {
                    sites.push(site);
                    continue;
                }

                const subMerchants: SubMerchantDetailedModel[] = [];

                for (const sm of site.subMerchant ?? []) {
                    if (textMatch(q, sm.subMerchantDesc, sm.subMerchantId, sm.internalSmId)) {
                        subMerchants.push(sm);
                        continue;
                    }

                    const devices = (sm.devices ?? []).filter((d) =>
                        textMatch(q, d.deviceId, d.deviceName, d.serialNumber, d.deviceType)
                    );

                    if (devices.length > 0) {
                        subMerchants.push({ ...sm, devices });
                    }
                }

                if (subMerchants.length > 0) {
                    sites.push({ ...site, subMerchant: subMerchants });
                }
            }

            if (sites.length > 0) {
                clusters.push({ ...cluster, site: sites });
            }
        }

        if (clusters.length > 0) {
            result.push({ ...region, cluster: clusters });
        }
    }

    return result;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function PlusIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            style={{ display: "block" }}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    );
}

function EditIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ display: "block" }}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
        </svg>
    );
}

function UserPlusIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ display: "block" }}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
        </svg>
    );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
function GhostBtn({ onClick, children }: { onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
        >
            {children}
        </button>
    );
}
function AddBtn({ onClick, children }: { onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 transition-all hover:bg-blue-100 active:scale-95"
        >
            {children}
        </button>
    );
}

function StatusPill({ value }: { value?: string }) {
    const active = value === "Y";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}

function StatusBtn({ value, onClick }: { value?: string; onClick: (e: React.MouseEvent) => void }) {
    const active = value === "Y";

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${active
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
        >
            {active ? "Deactivate" : "Activate"}
        </button>
    );
}



function AssignBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-95"
        >

            <UserPlusIcon size={12} />
            <span>Assign User</span>
        </button>
    );
}

type UserSearchTarget = "regionUid" | "subMerchantUid";

type TargetUserListResponse = {
    data?: UserModel[] | { items: UserModel[]; pagination: Pagination };
    pagination?: Pagination;
    status: number;
    errors?: string;
    message?: string;
};

export function TargetUserModal({
    title,
    targetLabel,
    targetUid,
    searchBy,
    onClose,
}: {
    title: string;
    targetLabel: string;
    targetUid: string;
    searchBy: UserSearchTarget;
    onClose: () => void;
}) {
    const [users, setUsers] = useState<UserModel[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchUsers() {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: String(page),
                limit: "10",
                sort: "createdAt",
                order: "desc",
                searchBy,
                q: targetUid,
            });

            try {
                const response = await apiClient<TargetUserListResponse>(`/api/user?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (response.errors) throw new Error(response.errors);

                const items = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
                const responsePagination = Array.isArray(response.data)
                    ? (response.pagination ?? null)
                    : (response.data?.pagination ?? response.pagination ?? null);

                setUsers(items);
                setPagination(responsePagination);
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                setUsers([]);
                setPagination(null);
                setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch users");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void fetchUsers();
        return () => controller.abort();
    }, [page, searchBy, targetUid]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-xl border border-border bg-background shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="mt-1 text-sm text-foreground/50">{targetLabel}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                    {loading ? (
                        <div className="flex min-h-45 items-center justify-center text-sm text-foreground/40">
                            Loading users...
                        </div>
                    ) : error ? (
                        <div className="flex min-h-45 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-4 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex min-h-45 items-center justify-center text-sm text-foreground/40">
                            No user data available.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border">
                            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-3 border-b border-border bg-foreground/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                                <span>User</span><span>Email</span><span>Phone</span><span>Status</span>
                            </div>
                            {users.map((user) => (
                                <div
                                    key={user.userUid}
                                    className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{user.fullName || "—"}</p>
                                        <p className="truncate text-xs text-foreground/45">@{user.userName || "—"}</p>
                                    </div>
                                    <p className="truncate text-sm text-foreground/60" title={user.email}>{user.email || "—"}</p>
                                    <p className="truncate text-sm text-foreground/60">{user.phone || "—"}</p>
                                    <StatusPill value={user.isActive} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
                    <p className="text-xs text-foreground/40">
                        {pagination ? `Page ${pagination.page} of ${pagination.totalPages} · ${pagination.total} users` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={loading || !pagination?.hasPrev}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={loading || !pagination?.hasNext}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Flat row type ────────────────────────────────────────────────────────────
type FlatRow = {
    cluster: ClusterDetailedModel;
    site: SiteDetailedModel;
    subMerchant: SubMerchantDetailedModel | null;
    device: DeviceModel | null;
    clusterRowSpan: number;
    siteRowSpan: number;
    smRowSpan: number;
    isFirstInCluster: boolean;
    isFirstInSite: boolean;
    isFirstInSm: boolean;
};

function flattenRegion(region: RegionDetailedModel): FlatRow[] {
    const rows: FlatRow[] = [];

    for (const cluster of region.cluster ?? []) {
        const clusterRows: FlatRow[] = [];

        for (const site of cluster.site ?? []) {
            const siteRows: FlatRow[] = [];
            const subMerchants = site.subMerchant ?? [];
            const smList = subMerchants.length > 0 ? subMerchants : [null];

            for (const sm of smList) {
                const devices = sm?.devices ?? [];
                const entries = devices.length > 0 ? devices : [null];

                entries.forEach((device, ti) => {
                    siteRows.push({
                        cluster,
                        site,
                        subMerchant: sm,
                        device,
                        clusterRowSpan: 0,
                        siteRowSpan: 0,
                        smRowSpan: entries.length,
                        isFirstInCluster: false,
                        isFirstInSite: false,
                        isFirstInSm: ti === 0,
                    });
                });
            }

            if (siteRows.length > 0) {
                siteRows[0].isFirstInSite = true;
                siteRows.forEach((r) => (r.siteRowSpan = siteRows.length));
            }

            clusterRows.push(...siteRows);
        }

        if (clusterRows.length > 0) {
            clusterRows[0].isFirstInCluster = true;
            clusterRows.forEach((r) => (r.clusterRowSpan = clusterRows.length));
        }

        rows.push(...clusterRows);
    }

    return rows;
}

// ─── RegionTable ──────────────────────────────────────────────────────────────
function RegionTable({
    region,
    onEditRegion,
    onAddCluster,
    onEditCluster,
    onAddSite,
    onEditSite,
    onAddDevice,
    onEditDevice,
    onEditCredential,
    onAddSubMerchant,
    onEditSubMerchant,
    onToggleRegionStatus,
    onToggleSubMerchantStatus,
    onToggleDeviceStatus,
    onAssignUser,
    apiKeyLazy,
    onRefreshApiKey,
}: {
    region: RegionDetailedModel;
    onEditRegion: (r: RegionDetailedModel) => void;
    onAddCluster: (regionUid: string) => void;
    onEditCluster: (c: ClusterDetailedModel, regionUid: string) => void;
    onAddSite: (clusterUid: string) => void;
    onEditSite: (s: SiteDetailedModel, clusterUid: string) => void;
    onAddDevice: (subMerchantUid: string) => void;
    onEditDevice: (t: DeviceModel, subMerchantUid: string) => void;
    onEditCredential: (deviceUid: string) => void;
    onAddSubMerchant: (siteUid: string, regionUid: string) => void;
    onEditSubMerchant: (sm: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleRegionStatus: (region: RegionDetailedModel) => void;
    onToggleSubMerchantStatus: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleDeviceStatus: (device: DeviceModel, subMerchantUid: string) => void;
    onAssignUser: (targetType: "merchant" | "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => void;
    apiKeyLazy: {
        fetchKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => void;
        getKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
        isLoading: (uid: string, type: "region" | "subMerchant", regionUid?: string) => boolean;
        getError: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
    };
    onRefreshApiKey: (uid: string, type: "region" | "subMerchant") => void;
}) {
    const rows = flattenRegion(region);
    const clusters = region.cluster ?? [];
    const isSuperAdmin = ["super admin", "dev"].includes(getLoggedInRole()?.roleDesc?.toLowerCase() ?? "");
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedSubMerchant, setSelectedSubMerchant] = useState<SubMerchantDetailedModel | null>(null);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Region header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100">
                        <span className="text-[8px] font-semibold uppercase leading-none tracking-widest text-violet-400">
                            reg
                        </span>
                        <span className="text-[13px] font-bold leading-tight text-violet-700">{region.regionId}</span>
                    </div>
                    {/* Label + name */}
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 leading-none mb-0.5">
                            Regional
                        </div>
                        <div className="text-sm font-semibold text-slate-800 leading-tight">{region.regionDesc}</div>
                    </div>
                    <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                        {clusters.length} cluster{clusters.length !== 1 ? "s" : ""}
                    </span>
                    <StatusPill value={region.isActive} />
                </div>

                {/* Region actions */}
                <div className="flex items-center gap-1.5">
                    <StatusBtn value={region.isActive} onClick={() => onToggleRegionStatus(region)} />
                    <GhostBtn onClick={() => onEditRegion(region)}>
                        <EditIcon size={11} /> Edit Region
                    </GhostBtn>
                    <AddBtn onClick={() => onAddCluster(region.regionUid)}>
                        <PlusIcon size={10} /> Add Cluster
                    </AddBtn>
                    <button
                        type="button"
                        onClick={() => setShowUserModal(true)}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                    >
                        <UsersIcon size={11} /> Show User
                    </button>
                    <AssignBtn onClick={() => onAssignUser("region", region.regionUid, region.regionDesc)} />
                    <ApiKeyInline
                        uid={region.regionUid}
                        type="region"
                        apiKeyLazy={apiKeyLazy}
                        onRefresh={onRefreshApiKey}
                    />
                </div>
            </div>

            {/* Table */}
            {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <p className="text-sm text-slate-400">No data available for this region</p>
                    <AddBtn onClick={() => onAddCluster(region.regionUid)}>
                        <PlusIcon size={10} /> Add Cluster
                    </AddBtn>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white">
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Cluster
                                </th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Site
                                </th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Sub Merchant
                                </th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Device Info
                                </th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Serial Number
                                </th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                                    Coordinate
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr
                                    key={`${row.subMerchant?.subMerchantUid ?? "no-sm"}-${row.device?.deviceUid ?? idx}`}
                                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0"
                                >
                                    {/* Cluster — rowspan + edit/add site */}
                                    {row.isFirstInCluster && (
                                        <td
                                            rowSpan={row.clusterRowSpan}
                                            className="border-r border-slate-100 px-4 py-3 align-top"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">
                                                    Cl
                                                </div>
                                                <span className="font-medium text-slate-700 text-sm">
                                                    {row.cluster.clusterDesc}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                <GhostBtn onClick={() => onEditCluster(row.cluster, region.regionUid)}>
                                                    <EditIcon size={9} /> Edit
                                                </GhostBtn>
                                                <AddBtn onClick={() => onAddSite(row.cluster.clusterUid)}>
                                                    <PlusIcon size={9} /> Add Site
                                                </AddBtn>
                                            </div>
                                        </td>
                                    )}

                                    {/* Site — rowspan + edit/add sub merchant */}
                                    {row.isFirstInSite && (
                                        <td
                                            rowSpan={row.siteRowSpan}
                                            className="border-r border-slate-100 px-4 py-3 align-top"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">
                                                    Si
                                                </div>
                                                <span className="font-medium text-slate-700 text-sm">
                                                    {row.site.siteDesc}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                <GhostBtn onClick={() => onEditSite(row.site, row.cluster.clusterUid)}>
                                                    <EditIcon size={9} /> Edit
                                                </GhostBtn>
                                                <AddBtn onClick={() => onAddSubMerchant(row.site.siteUid, region.regionUid)}>
                                                    <PlusIcon size={9} /> Add Sub Merchant
                                                </AddBtn>
                                            </div>
                                        </td>
                                    )}

                                    {/* Sub Merchant — rowspan + edit/add device/assign */}
                                    {row.isFirstInSm && (
                                        <td
                                            rowSpan={row.smRowSpan}
                                            className="border-r border-slate-100 px-4 py-3 align-top"
                                        >
                                            {row.subMerchant ? (
                                                <>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-100 text-[9px] font-bold text-rose-600">
                                                            Sm
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-700 text-sm leading-tight">
                                                                {row.subMerchant.subMerchantDesc}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-mono">
                                                                ID :  #{row.subMerchant.subMerchantId}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-mono">
                                                                Internal ID :  #{row.subMerchant.internalSmId ?? "-"}
                                                            </div>
                                                            <div className="mt-1">
                                                                <StatusPill value={row.subMerchant.isActive} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        <StatusBtn
                                                            value={row.subMerchant.isActive}
                                                            onClick={() =>
                                                                onToggleSubMerchantStatus(row.subMerchant!, row.site.siteUid, region.regionUid)
                                                            }
                                                        />
                                                        <GhostBtn
                                                            onClick={() => onEditSubMerchant(row.subMerchant!, row.site.siteUid, region.regionUid)}
                                                        >
                                                            <EditIcon size={9} /> Edit
                                                        </GhostBtn>
                                                        <AddBtn onClick={() => onAddDevice(row.subMerchant!.subMerchantUid)}>
                                                            <PlusIcon size={9} /> Add Device
                                                        </AddBtn>
                                                        <AssignBtn
                                                            onClick={() =>
                                                                onAssignUser(
                                                                    "subMerchant",
                                                                    row.subMerchant!.subMerchantUid,
                                                                    row.subMerchant!.subMerchantDesc,
                                                                    region.regionUid,
                                                                )
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSubMerchant(row.subMerchant!)}
                                                            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-95"
                                                        >
                                                            <UsersIcon size={12} />
                                                            <span>Show User</span>
                                                        </button>
                                                        <ApiKeyInline
                                                            uid={row.subMerchant.subMerchantUid}
                                                            type="subMerchant"
                                                            regionUid={region.regionUid}
                                                            apiKeyLazy={apiKeyLazy}
                                                            onRefresh={onRefreshApiKey}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-300">No sub-merchant yet</span>
                                            )}
                                        </td>
                                    )}

                                    {/* Device columns */}
                                    {row.device ? (
                                        <>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-medium text-slate-700">
                                                        ID:{row.device.deviceId}
                                                    </span>
                                                    <StatusPill value={row.device.isActive} />
                                                    {(isSuperAdmin || row.device.isActive === "Y") && (
                                                        <StatusBtn
                                                            value={row.device.isActive}
                                                            onClick={() =>
                                                                onToggleDeviceStatus(
                                                                    row.device!,
                                                                    row.subMerchant?.subMerchantUid ?? "",
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                {/* Tambah ini */}
                                                <div className="mt-0.5 flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-500">{row.device.deviceName}</span>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                                                        {row.device.deviceType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-slate-500">
                                                    {row.device.serialNumber}
                                                </span>
                                                <div className="mt-1 flex flex-row gap-1">
                                                    <GhostBtn
                                                        onClick={() =>
                                                            onEditDevice(row.device!, row.subMerchant?.subMerchantUid ?? "")
                                                        }
                                                    >
                                                        <EditIcon size={9} /> Edit
                                                    </GhostBtn>
                                                    <GhostBtn
                                                        onClick={() =>
                                                            onEditCredential(row.device?.deviceUid ?? "")
                                                        }
                                                    >
                                                        <KeyIcon size={9} /> Credential
                                                    </GhostBtn>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.device.latitude && row.device.longitude ? (
                                                    <span className="font-mono text-xs text-slate-400">
                                                        {parseFloat(row.device.latitude).toFixed(4)},{" "}
                                                        {parseFloat(row.device.longitude).toFixed(4)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-slate-300">—</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-slate-300">—</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-slate-300">—</span>
                                            </td>
                                        </>
                                    )}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Show User Modal */}
            {showUserModal && (
                <TargetUserModal
                    title="Regional Users"
                    targetLabel={region.regionDesc}
                    targetUid={region.regionUid}
                    searchBy="regionUid"
                    onClose={() => setShowUserModal(false)}
                />
            )}

            {/* Show Sub Merchant User Modal */}
            {selectedSubMerchant && (
                <TargetUserModal
                    title="Sub Merchant Users"
                    targetLabel={selectedSubMerchant.subMerchantDesc}
                    targetUid={selectedSubMerchant.subMerchantUid}
                    searchBy="subMerchantUid"
                    onClose={() => setSelectedSubMerchant(null)}
                />
            )}
        </div>
    );
}

// ─── LevelTable ───────────────────────────────────────────────────────────────
type EntityRow = {
    region: RegionDetailedModel;
    cluster: ClusterDetailedModel | null;
    site: SiteDetailedModel | null;
    subMerchant: SubMerchantDetailedModel | null;
};

function buildEntityRows(regions: RegionDetailedModel[]): EntityRow[] {
    const rows: EntityRow[] = [];

    for (const region of regions) {
        const clusters = region.cluster ?? [];

        if (clusters.length === 0) {
            rows.push({ region, cluster: null, site: null, subMerchant: null });
            continue;
        }

        for (const cluster of clusters) {
            const sites = cluster.site ?? [];

            if (sites.length === 0) {
                rows.push({ region, cluster, site: null, subMerchant: null });
                continue;
            }

            for (const site of sites) {
                const subMerchants = site.subMerchant ?? [];

                if (subMerchants.length === 0) {
                    rows.push({ region, cluster, site, subMerchant: null });
                    continue;
                }

                for (const subMerchant of subMerchants) {
                    rows.push({ region, cluster, site, subMerchant });
                }
            }
        }
    }

    return rows;
}

function LevelTable({
    merchant,
    level,
    onEditRegion,
    onAddCluster,
    onEditCluster,
    onAddSite,
    onEditSite,
    onAddDevice,
    onEditDevice,
    onEditCredential,
    onAddSubMerchant,
    onEditSubMerchant,
    onToggleRegionStatus,
    onToggleSubMerchantStatus,
    onToggleDeviceStatus,
    onAssignUser,
    apiKeyLazy,
    onRefreshApiKey,
}: {
    merchant: MerchantDetailedModel;
    level: Exclude<HierarchyLevel, "all">;
    onEditRegion: (r: RegionDetailedModel) => void;
    onAddCluster: (regionUid: string) => void;
    onEditCluster: (c: ClusterDetailedModel, regionUid: string) => void;
    onAddSite: (clusterUid: string) => void;
    onEditSite: (s: SiteDetailedModel, clusterUid: string) => void;
    onAddDevice: (subMerchantUid: string) => void;
    onEditDevice: (t: DeviceModel, subMerchantUid: string) => void;
    onEditCredential: (deviceUid: string) => void;
    onAddSubMerchant: (siteUid: string, regionUid: string) => void;
    onEditSubMerchant: (sm: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleRegionStatus: (region: RegionDetailedModel) => void;
    onToggleSubMerchantStatus: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
    onToggleDeviceStatus: (device: DeviceModel, subMerchantUid: string) => void;
    onAssignUser: (targetType: "merchant" | "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => void;
    apiKeyLazy: {
        fetchKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => void;
        getKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
        isLoading: (uid: string, type: "region" | "subMerchant", regionUid?: string) => boolean;
        getError: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
    };
    onRefreshApiKey: (uid: string, type: "region" | "subMerchant") => void;
}) {
    const regions = merchant.region ?? [];
    const entityRows = useMemo(() => buildEntityRows(regions), [regions]);
    const isSuperAdmin = ["super admin", "dev"].includes(getLoggedInRole()?.roleDesc?.toLowerCase() ?? "");

    const regionRows = useMemo(
        () => regions.map((r) => ({ region: r, cluster: null as ClusterDetailedModel | null, site: null as SiteDetailedModel | null, subMerchant: null as SubMerchantDetailedModel | null })),
        [regions],
    );

    const clusterRows = useMemo(() => {
        const seen = new Set<string>();
        return entityRows.filter((r) => {
            if (!r.cluster || seen.has(r.cluster.clusterUid)) return false;
            seen.add(r.cluster.clusterUid);
            return true;
        });
    }, [entityRows]);

    const siteRows = useMemo(() => {
        const seen = new Set<string>();
        return entityRows.filter((r) => {
            if (!r.site || seen.has(r.site.siteUid)) return false;
            seen.add(r.site.siteUid);
            return true;
        });
    }, [entityRows]);

    const subMerchantRows = useMemo(() => {
        const seen = new Set<string>();
        return entityRows.filter((r) => {
            if (!r.subMerchant || seen.has(r.subMerchant.subMerchantUid)) return false;
            seen.add(r.subMerchant.subMerchantUid);
            return true;
        });
    }, [entityRows]);

    const deviceRows = useMemo(() => {
        const seen = new Set<string>();
        const rows: (EntityRow & { device: DeviceModel })[] = [];

        for (const r of entityRows) {
            for (const device of r.subMerchant?.devices ?? []) {
                if (seen.has(device.deviceUid)) continue;
                seen.add(device.deviceUid);
                rows.push({ ...r, device });
            }
        }

        return rows;
    }, [entityRows]);

    const [userModalTarget, setUserModalTarget] = useState<
        | { type: "region"; uid: string; label: string }
        | { type: "subMerchant"; uid: string; label: string }
        | null
    >(null);

    const levelLabel: Record<Exclude<HierarchyLevel, "all">, string> = {
        region: "Region",
        cluster: "Cluster",
        site: "Site",
        subMerchant: "Sub Merchant",
        device: "Device",
    };

    const emptyView = (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-10">
            <p className="text-sm text-slate-400">No {levelLabel[level]} data available</p>
        </div>
    );

    const userModals = (
        <>
            {userModalTarget?.type === "region" && (
                <TargetUserModal
                    title="Regional Users"
                    targetLabel={userModalTarget.label}
                    targetUid={userModalTarget.uid}
                    searchBy="regionUid"
                    onClose={() => setUserModalTarget(null)}
                />
            )}
            {userModalTarget?.type === "subMerchant" && (
                <TargetUserModal
                    title="Sub Merchant Users"
                    targetLabel={userModalTarget.label}
                    targetUid={userModalTarget.uid}
                    searchBy="subMerchantUid"
                    onClose={() => setUserModalTarget(null)}
                />
            )}
        </>
    );

    const thCls = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap";

    if (level === "region") {
        const rows = regionRows;

        if (rows.length === 0) return emptyView;

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className={thCls}>Region ID</th>
                                <th className={thCls}>Region Desc</th>
                                <th className={thCls}>Bank</th>
                                <th className={thCls}>Cluster</th>
                                <th className={thCls}>Status</th>
                                <th className={thCls}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ region }) => (
                                <tr key={region.regionUid} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100">
                                            <span className="text-[8px] font-semibold uppercase leading-none tracking-widest text-violet-400">reg</span>
                                            <span className="text-[13px] font-bold leading-tight text-violet-700">{region.regionId}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{region.regionDesc}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <div>{region.bankName || "-"}</div>
                                        <div className="text-xs text-slate-400 font-mono">{region.bankNoRek || "-"}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                                            {region.cluster?.length ?? 0} cluster{(region.cluster?.length ?? 0) !== 1 ? "s" : ""}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><StatusPill value={region.isActive} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <StatusBtn value={region.isActive} onClick={() => onToggleRegionStatus(region)} />
                                            <GhostBtn onClick={() => onEditRegion(region)}><EditIcon size={9} /> Edit</GhostBtn>
                                            <AddBtn onClick={() => onAddCluster(region.regionUid)}><PlusIcon size={9} /> Add Cluster</AddBtn>
                                            <button
                                                type="button"
                                                onClick={() => setUserModalTarget({ type: "region", uid: region.regionUid, label: region.regionDesc })}
                                                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                                            >
                                                <UsersIcon size={11} /> Show User
                                            </button>
                                            <AssignBtn onClick={() => onAssignUser("region", region.regionUid, region.regionDesc)} />
                                            <ApiKeyInline
                                                uid={region.regionUid}
                                                type="region"
                                                apiKeyLazy={apiKeyLazy}
                                                onRefresh={onRefreshApiKey}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {userModals}
            </div>
        );
    }

    if (level === "cluster") {
        const rows = clusterRows;

        if (rows.length === 0) return emptyView;

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className={thCls}>Region</th>
                                <th className={thCls}>Cluster Desc</th>
                                <th className={thCls}>Site</th>
                                <th className={thCls}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ region, cluster }) => (
                                <tr key={cluster!.clusterUid} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-slate-700">{region.regionDesc}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">#{region.regionId}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Cl</div>
                                            <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                                            {cluster!.site?.length ?? 0} site{(cluster!.site?.length ?? 0) !== 1 ? "s" : ""}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <GhostBtn onClick={() => onEditCluster(cluster!, region.regionUid)}><EditIcon size={9} /> Edit</GhostBtn>
                                            <AddBtn onClick={() => onAddSite(cluster!.clusterUid)}><PlusIcon size={9} /> Add Site</AddBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (level === "site") {
        const rows = siteRows;

        if (rows.length === 0) return emptyView;

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className={thCls}>Region</th>
                                <th className={thCls}>Cluster</th>
                                <th className={thCls}>Site Desc</th>
                                <th className={thCls}>Sub Merchant</th>
                                <th className={thCls}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ region, cluster, site }) => (
                                <tr key={site!.siteUid} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-slate-700">{region.regionDesc}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">#{region.regionId}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Cl</div>
                                            <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Si</div>
                                            <span className="font-medium text-slate-700 text-sm">{site!.siteDesc}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                                            {site!.subMerchant?.length ?? 0} sub merchant{(site!.subMerchant?.length ?? 0) !== 1 ? "s" : ""}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <GhostBtn onClick={() => onEditSite(site!, cluster!.clusterUid)}><EditIcon size={9} /> Edit</GhostBtn>
                                            <AddBtn onClick={() => onAddSubMerchant(site!.siteUid, region.regionUid)}><PlusIcon size={9} /> Add Sub Merchant</AddBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {userModals}
            </div>
        );
    }

    if (level === "device") {
        const rows = deviceRows;

        if (rows.length === 0) return emptyView;

        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className={thCls}>Region</th>
                                <th className={thCls}>Cluster</th>
                                <th className={thCls}>Site</th>
                                <th className={thCls}>Sub Merchant</th>
                                <th className={thCls}>Device Info</th>
                                <th className={thCls}>Serial Number</th>
                                <th className={thCls}>Coordinate</th>
                                <th className={thCls}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ region, cluster, site, subMerchant, device }) => (
                                <tr key={device.deviceUid} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-slate-700">{region.regionDesc}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">#{region.regionId}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Cl</div>
                                            <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Si</div>
                                            <span className="font-medium text-slate-700 text-sm">{site!.siteDesc}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-700 text-sm leading-tight">{subMerchant!.subMerchantDesc}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">ID : #{subMerchant!.subMerchantId}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-medium text-slate-700">ID:{device.deviceId}</span>
                                            <StatusPill value={device.isActive} />
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-1.5">
                                            <span className="text-xs text-slate-500">{device.deviceName}</span>
                                            <span className="text-slate-300">·</span>
                                            <span className="text-xs uppercase tracking-wide text-slate-400 font-medium">{device.deviceType}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-slate-500">{device.serialNumber}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {device.latitude && device.longitude ? (
                                            <span className="font-mono text-xs text-slate-400">
                                                {parseFloat(device.latitude).toFixed(4)}, {parseFloat(device.longitude).toFixed(4)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {(isSuperAdmin || device.isActive === "Y") && (
                                                <StatusBtn
                                                    value={device.isActive}
                                                    onClick={() => onToggleDeviceStatus(device, subMerchant!.subMerchantUid)}
                                                />
                                            )}
                                            <GhostBtn onClick={() => onEditDevice(device, subMerchant!.subMerchantUid)}><EditIcon size={9} /> Edit</GhostBtn>
                                            <GhostBtn onClick={() => onEditCredential(device.deviceUid)}><KeyIcon size={9} /> Credential</GhostBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {userModals}
            </div>
        );
    }

    const rows = subMerchantRows;

    if (rows.length === 0) return emptyView;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className={thCls}>Region</th>
                            <th className={thCls}>Cluster</th>
                            <th className={thCls}>Site</th>
                            <th className={thCls}>Sub Merchant</th>
                            <th className={thCls}>Status</th>
                            <th className={thCls}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ region, cluster, site, subMerchant }) => (
                            <tr key={subMerchant!.subMerchantUid} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0">
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-slate-700">{region.regionDesc}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">#{region.regionId}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Cl</div>
                                        <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Si</div>
                                        <span className="font-medium text-slate-700 text-sm">{site!.siteDesc}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-100 text-[9px] font-bold text-rose-600">Sm</div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-700 text-sm leading-tight">{subMerchant!.subMerchantDesc}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">ID : #{subMerchant!.subMerchantId}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">Internal ID : #{subMerchant!.internalSmId ?? "-"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3"><StatusPill value={subMerchant!.isActive} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <StatusBtn
                                            value={subMerchant!.isActive}
                                            onClick={() => onToggleSubMerchantStatus(subMerchant!, site!.siteUid, region.regionUid)}
                                        />
                                        <GhostBtn onClick={() => onEditSubMerchant(subMerchant!, site!.siteUid, region.regionUid)}><EditIcon size={9} /> Edit</GhostBtn>
                                        <AddBtn onClick={() => onAddDevice(subMerchant!.subMerchantUid)}><PlusIcon size={9} /> Add Device</AddBtn>
                                        <button
                                            type="button"
                                            onClick={() => setUserModalTarget({ type: "subMerchant", uid: subMerchant!.subMerchantUid, label: subMerchant!.subMerchantDesc })}
                                            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                                        >
                                            <UsersIcon size={11} /> Show User
                                        </button>
                                        <AssignBtn onClick={() => onAssignUser("subMerchant", subMerchant!.subMerchantUid, subMerchant!.subMerchantDesc, region.regionUid)} />
                                        <ApiKeyInline
                                            uid={subMerchant!.subMerchantUid}
                                            type="subMerchant"
                                            regionUid={region.regionUid}
                                            apiKeyLazy={apiKeyLazy}
                                            onRefresh={onRefreshApiKey}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {userModals}
        </div>
    );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function HierarchyTree({
    merchant,
    level = "all",
    search = "",
    onEditRegion,
    onAddCluster,
    onEditCluster,
    onAddSite,
    onEditSite,
    onAddDevice,
    onEditDevice,
    onEditCredential,
    onAddSubMerchant,
    onEditSubMerchant,
    onToggleRegionStatus,
    onToggleSubMerchantStatus,
    onToggleDeviceStatus,
    onAssignUser,
    apiKeyLazy,
    onRefreshApiKey,
}: Props) {
    const q = search.trim().toLowerCase();

    const filteredRegions = useMemo(
        () => filterRegionsBySearch(merchant.region ?? [], q),
        [merchant.region, q],
    );

    if (!merchant.region?.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">No Region data available</p>
                <p className="text-xs text-slate-400">Use &quot;Add Region&quot; to create your first region</p>
            </div>
        );
    }

    if (filteredRegions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                        />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">No data matches your search</p>
                <p className="text-xs text-slate-400">Try a different keyword for {level === "all" ? "the hierarchy" : level}</p>
            </div>
        );
    }

    const filteredMerchant: MerchantDetailedModel = { ...merchant, region: filteredRegions };

    if (level !== "all") {
        return (
            <LevelTable
                merchant={filteredMerchant}
                level={level}
                onEditRegion={onEditRegion}
                onAddCluster={onAddCluster}
                onEditCluster={onEditCluster}
                onAddSite={onAddSite}
                onEditSite={onEditSite}
                onAddDevice={onAddDevice}
                onEditDevice={onEditDevice}
                onEditCredential={onEditCredential}
                onAddSubMerchant={onAddSubMerchant}
                onEditSubMerchant={onEditSubMerchant}
                onToggleRegionStatus={onToggleRegionStatus}
                onToggleSubMerchantStatus={onToggleSubMerchantStatus}
                onToggleDeviceStatus={onToggleDeviceStatus}
                onAssignUser={onAssignUser}
                apiKeyLazy={apiKeyLazy}
                onRefreshApiKey={onRefreshApiKey}
            />
        );
    }

    return (
        <div className="space-y-4">
            {filteredRegions.map((r) => (
                <RegionTable
                    key={r.regionUid}
                    region={r}
                    onEditRegion={onEditRegion}
                    onAddCluster={onAddCluster}
                    onEditCluster={onEditCluster}
                    onAddSite={onAddSite}
                    onEditSite={onEditSite}
                    onAddDevice={onAddDevice}
                    onEditDevice={onEditDevice}
                    onEditCredential={onEditCredential}
                    onAddSubMerchant={onAddSubMerchant}
                    onEditSubMerchant={onEditSubMerchant}
                    onToggleRegionStatus={onToggleRegionStatus}
                    onToggleSubMerchantStatus={onToggleSubMerchantStatus}
                    onToggleDeviceStatus={onToggleDeviceStatus}
                    onAssignUser={onAssignUser}
                    apiKeyLazy={apiKeyLazy}
                    onRefreshApiKey={onRefreshApiKey}
                />
            ))}
        </div>
    );
}
