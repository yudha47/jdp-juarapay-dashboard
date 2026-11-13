"use client";

import { useEffect, useMemo, useState } from "react";
import { getLoggedInRole, getLoggedInUser } from "@/lib/auth";

import { RegionDetailedModel } from "@/data/models/RegionModel";
import { ClusterDetailedModel } from "@/data/models/ClusterModel";
import { SiteDetailedModel } from "@/data/models/SiteModel";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { DeviceModel } from "@/data/models/DeviceModel";
import { useUser } from "@/hooks/useUsers";
import { useMerchant } from "@/hooks/useMerchant";
import CreateAssignedUserModal from "./components/CreateAssignedUserModal";
import { TargetUserModal, HierarchyLevel, filterRegionsBySearch } from "./[uid]/components/HierarchyTree";
import { MerchantInfoCard } from "./components/MerchantInfoCard";
import { usePaymentMethodByMerchant } from "@/hooks/usePaymentMethod";
import { useApiKeyInfo, useApiKeyRefresh } from "@/hooks/useApiKeyInfo";
import { useApiKeyLazy } from "@/hooks/useApiKeyLazy";
import { ApiKeyInline } from "./[uid]/components/ApiKeyInLine";
import { useCreateCluster, useUpdateCluster } from "@/hooks/useCluster";
import { useCreateDevice, useUpdateCredential, useUpdateDevice } from "@/hooks/useDevice";
import { useCreateRegion, useUpdateRegion } from "@/hooks/useRegion";
import { useCreateSite, useUpdateSite } from "@/hooks/useSite";
import { useCreateSubMerchant, useUpdateSubMerchant } from "@/hooks/useSubMerchant";
import { ClusterRequest } from "@/data/request/ClusterRequest";
import { DeviceRequest } from "@/data/request/DeviceRequest";
import { RegionRequest } from "@/data/request/RegionRequest";
import { SiteRequest } from "@/data/request/SiteRequest";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";
import { useToast } from "@/components/ui/ToastProvider";
import ClusterModal from "./[uid]/components/ClusterModal";
import SiteModal from "./[uid]/components/SiteModal";
import SubMerchantModal from "./[uid]/components/SubMerchantModal";
import RegionModal from "./[uid]/components/RegionModal";
import DeviceModal from "./[uid]/components/DeviceModal";
import { usePrices } from "../../../hooks/usePrice";
import { DeviceCredentialRequest } from "../../../data/request/DeviceCredentialRequest";
import DeviceCredentialModal from "./[uid]/components/DeviceCredentialModal";

// ─── Icons ──────────────────────────────────────────────────────────────────
// function UserPlusIcon() {
//   return (
//     <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
//       />
//     </svg>
//   );
// }
// function AssignButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
//   return (
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         onClick(e);
//       }}
//       className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
//     >
//       <UserPlusIcon />
//       <span>Assign User</span>
//     </button>
//   );
// }

// ─── Flattened row type ───────────────────────────────────────────────────────
type FlatRow = {
  cluster: ClusterDetailedModel;
  site: SiteDetailedModel;
  subMerchant: SubMerchantDetailedModel | null;
  device: DeviceModel | null;
  // span helpers
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
        const smEntries = devices.length > 0 ? devices : [null];

        smEntries.forEach((device, ti) => {
          siteRows.push({
            cluster,
            site,
            subMerchant: sm,
            device,
            clusterRowSpan: 0, // filled later
            siteRowSpan: 0,
            smRowSpan: smEntries.length,
            isFirstInCluster: false,
            isFirstInSite: false,
            isFirstInSm: ti === 0,
          });
        });
      }

      // mark isFirstInSite
      if (siteRows.length > 0) {
        siteRows[0].isFirstInSite = true;
        siteRows.forEach((r) => (r.siteRowSpan = siteRows.length));
      }

      clusterRows.push(...siteRows);
    }

    // mark isFirstInCluster
    if (clusterRows.length > 0) {
      clusterRows[0].isFirstInCluster = true;
      clusterRows.forEach((r) => (r.clusterRowSpan = clusterRows.length));
    }

    rows.push(...clusterRows);
  }

  return rows;
}

function GhostBtn({
  onClick,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
    >
      {children}
    </button>
  );
}
function AddBtn({
  onClick,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
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

function StatusBtn({
  value,
  onClick,
}: {
  value?: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const active = value === "Y";

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${active
        ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
    >
      {active ? "Deactivate" : "Activate"}
    </button>
  );
}

// ICON
function PlusIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ display: "block" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: "block" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}

// ─── RegionTable ──────────────────────────────────────────────────────────────
function RegionTable({
  region,
  apiKeyLazy,
  onAddCluster,
  onUpdateRegion,
  onUpdateCluster,
  onAddSite,
  onUpdateSite,
  onAddSubMerchant,
  onUpdateSubMerchant,
  onAddDevice,
  onUpdateDevice,
  // onUpdateCredential,
  onToggleRegionStatus,
  onToggleSubMerchantStatus,
  onToggleDeviceStatus,
  onCreateUser,
  onShowUser,
}: {
  region: RegionDetailedModel;
  apiKeyLazy: ReturnType<typeof useApiKeyLazy>;
  onAddCluster: (regionUid: string) => void;
  onUpdateRegion: (region: RegionDetailedModel) => void;
  onUpdateCluster: (cluster: ClusterDetailedModel, regionUid: string) => void;
  onAddSite: (clusterUid: string) => void;
  onUpdateSite: (site: SiteDetailedModel, clusterUid: string) => void;
  onAddSubMerchant: (siteUid: string) => void;
  onUpdateSubMerchant: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
  onAddDevice: (subMerchantUid: string) => void;
  onUpdateDevice: (device: DeviceModel, subMerchantUid: string) => void;
  onUpdateCredential: (deviceUid: string) => void;
  onToggleRegionStatus: (region: RegionDetailedModel) => void;
  onToggleSubMerchantStatus: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
  onToggleDeviceStatus: (device: DeviceModel, subMerchantUid: string) => void;
  onCreateUser: (targetType: "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => void;
  onShowUser: (targetType: "region" | "subMerchant", targetUid: string, targetLabel: string) => void;
}) {
  const rows = flattenRegion(region);
  const clusters = region.cluster ?? [];
  const isSuperAdmin = ["super admin", "dev"].includes(getLoggedInRole()?.roleDesc?.toLowerCase() ?? "");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Region header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div className="flex items-center gap-3">
          {/* Big avatar */}
          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100">
            <span className="text-[8px] font-700 uppercase leading-none tracking-widest text-violet-400">
              reg
            </span>
            <span className="text-[13px] font-bold leading-tight text-violet-700">
              {region.regionId}
            </span>
          </div>
          {/* Label + name */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 leading-none mb-0.5">
              Regional
            </div>
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {region.regionDesc}
            </div>
          </div>
          <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
            {clusters.length} cluster{clusters.length !== 1 ? "s" : ""}
          </span>
          <StatusPill value={region.isActive} />
        </div>


        {/* <AssignButton
          onClick={() => onAssignUser(region.regionUid, region.regionDesc, "region")}
        /> */}

        <div className="flex items-center gap-2">
          <StatusBtn value={region.isActive} onClick={() => onToggleRegionStatus(region)} />
          <GhostBtn onClick={() => onUpdateRegion(region)}>
            <EditIcon size={11} /> Edit Region
          </GhostBtn>

          <AddBtn onClick={() => onAddCluster(region.regionUid)}>
            <PlusIcon size={10} /> Add Cluster
          </AddBtn>
          <GhostBtn onClick={() => onCreateUser("region", region.regionUid, region.regionDesc)}>
            Assign User
          </GhostBtn>
          <GhostBtn onClick={() => onShowUser("region", region.regionUid, region.regionDesc)}>
            Show User
          </GhostBtn>
          {/* API Key */}
          <ApiKeyInline
            uid={region.regionUid}
            type="region"
            apiKeyLazy={apiKeyLazy}
            onRefresh={(uid, type) => apiKeyLazy.refreshKey(uid, type)}
          />
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No Region data available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Cluster
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Site
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sub Merchant
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Device Info
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Serial Number
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Coordinat
                </th>
                {/* <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Action
                </th> */}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={`${row.subMerchant?.subMerchantUid ?? "no-sm"}-${row.device?.deviceUid ?? idx}`}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 last:border-0"
                >
                  {/* Cluster cell — rowspan */}
                  {row.isFirstInCluster && (
                    <td
                      rowSpan={row.clusterRowSpan}
                      className="border-r border-slate-100 px-4 py-3 align-top"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">
                          Cl
                        </div>
                        <span className="font-medium text-slate-700">
                          {row.cluster.clusterDesc}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <GhostBtn onClick={() => onUpdateCluster(row.cluster, region.regionUid)}>
                          <EditIcon size={9} /> Edit
                        </GhostBtn>
                        <AddBtn onClick={() => onAddSite(row.cluster.clusterUid)}>
                          <PlusIcon size={9} /> Add Site
                        </AddBtn>
                      </div>
                    </td>
                  )}

                  {/* Site cell — rowspan */}
                  {row.isFirstInSite && (
                    <td
                      rowSpan={row.siteRowSpan}
                      className="border-r border-slate-100 px-4 py-3 align-top"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">
                          Si
                        </div>
                        <span className="font-medium text-slate-700">{row.site.siteDesc}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <GhostBtn onClick={() => onUpdateSite(row.site, row.cluster.clusterUid)}>
                          <EditIcon size={9} /> Edit
                        </GhostBtn>
                        <AddBtn onClick={() => onAddSubMerchant(row.site.siteUid)}>
                          <PlusIcon size={9} /> Add Sub Merchant
                        </AddBtn>
                      </div>
                    </td>
                  )}

                  {/* Sub Merchant cell — rowspan */}
                  {row.isFirstInSm && (
                    <td
                      rowSpan={row.smRowSpan}
                      className="border-r border-slate-100 px-4 py-3 align-top"
                    >
                      {row.subMerchant ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-100 text-[9px] font-bold text-rose-600">
                              Sm
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-700">
                                {row.subMerchant.subMerchantDesc}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                ID : #{row.subMerchant.subMerchantId}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Internal ID : #{row.subMerchant.internalSmId ?? "-"}
                              </div>
                              <div className="mt-1">
                                <StatusPill value={row.subMerchant.isActive} />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <StatusBtn
                              value={row.subMerchant.isActive}
                              onClick={() => onToggleSubMerchantStatus(row.subMerchant!, row.site.siteUid, region.regionUid)}
                            />
                            <GhostBtn
                              onClick={() =>
                                onUpdateSubMerchant(row.subMerchant!, row.site.siteUid, region.regionUid)
                              }
                            >
                              <EditIcon size={9} /> Edit
                            </GhostBtn>
                            <AddBtn onClick={() => onAddDevice(row.subMerchant!.subMerchantUid)}>
                              <PlusIcon size={9} /> Add Device
                            </AddBtn>
                            <GhostBtn
                              onClick={() =>
                                onCreateUser(
                                  "subMerchant",
                                  row.subMerchant!.subMerchantUid,
                                  row.subMerchant!.subMerchantDesc,
                                  region.regionUid,
                                )
                              }
                            >
                              Assign User
                            </GhostBtn>
                            <GhostBtn
                              onClick={() =>
                                onShowUser(
                                  "subMerchant",
                                  row.subMerchant!.subMerchantUid,
                                  row.subMerchant!.subMerchantDesc,
                                )
                              }
                            >
                              Show User
                            </GhostBtn>
                            <ApiKeyInline
                              uid={row.subMerchant.subMerchantUid}
                              type="subMerchant"
                              regionUid={region.regionUid}
                              apiKeyLazy={apiKeyLazy}
                              onRefresh={(uid, type) => apiKeyLazy.refreshKey(uid, type)}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-medium text-slate-700">
                            ID:{row.device.deviceId}
                          </span>
                          <StatusPill value={row.device.isActive} />
                          {(isSuperAdmin || row.device.isActive === "Y") && (
                            <StatusBtn
                              value={row.device.isActive}
                              onClick={() => onToggleDeviceStatus(row.device!, row.subMerchant?.subMerchantUid ?? "")}
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
                        <div className="mt-1 flex flex-wrap gap-1">
                          <GhostBtn
                            onClick={() =>
                              onUpdateDevice(row.device!, row.subMerchant?.subMerchantUid ?? "")
                            }
                          >
                            <EditIcon size={9} /> Edit
                          </GhostBtn>

                          {/* <GhostBtn
                            onClick={() =>
                              onUpdateCredential(
                                row.device?.deviceUid ?? "",
                              )
                            }
                          >
                            <KeyIcon size={9} /> Credential
                          </GhostBtn> */}
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

                  {/* Assign user — only on first row of each sub merchant */}
                  {/* {row.isFirstInSm && (
                    <td rowSpan={row.smRowSpan} className="px-4 py-3 text-right align-top">
                      <AssignButton
                        onClick={() =>
                          onAssignUser(
                            row.subMerchant.subMerchantUid,
                            row.subMerchant.subMerchantDesc,
                            "subMerchant"
                          )
                        }
                      />
                    </td>
                  )} */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── LevelTable (admin) ───────────────────────────────────────────────────────
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
  regions,
  level,
  apiKeyLazy,
  onAddCluster,
  onUpdateRegion,
  onUpdateCluster,
  onAddSite,
  onUpdateSite,
  onAddSubMerchant,
  onUpdateSubMerchant,
  onAddDevice,
  onUpdateDevice,
  onToggleRegionStatus,
  onToggleSubMerchantStatus,
  onToggleDeviceStatus,
  onCreateUser,
  onShowUser,
}: {
  regions: RegionDetailedModel[];
  level: Exclude<HierarchyLevel, "all">;
  apiKeyLazy: ReturnType<typeof useApiKeyLazy>;
  onAddCluster: (regionUid: string) => void;
  onUpdateRegion: (region: RegionDetailedModel) => void;
  onUpdateCluster: (cluster: ClusterDetailedModel, regionUid: string) => void;
  onAddSite: (clusterUid: string) => void;
  onUpdateSite: (site: SiteDetailedModel, clusterUid: string) => void;
  onAddSubMerchant: (siteUid: string, regionUid: string) => void;
  onUpdateSubMerchant: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
  onAddDevice: (subMerchantUid: string) => void;
  onUpdateDevice: (device: DeviceModel, subMerchantUid: string) => void;
  onToggleRegionStatus: (region: RegionDetailedModel) => void;
  onToggleSubMerchantStatus: (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => void;
  onToggleDeviceStatus: (device: DeviceModel, subMerchantUid: string) => void;
  onCreateUser: (targetType: "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => void;
  onShowUser: (targetType: "region" | "subMerchant", targetUid: string, targetLabel: string) => void;
}) {
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

  const levelLabel: Record<Exclude<HierarchyLevel, "all">, string> = {
    region: "Region",
    cluster: "Cluster",
    site: "Site",
    subMerchant: "Sub Merchant",
    device: "Device",
  };

  const emptyView = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-10">
      <p className="text-sm text-slate-400">No {levelLabel[level]} data available</p>
    </div>
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
                      <GhostBtn onClick={() => onUpdateRegion(region)}><EditIcon size={9} /> Edit</GhostBtn>
                      <AddBtn onClick={() => onAddCluster(region.regionUid)}><PlusIcon size={9} /> Add Cluster</AddBtn>
                      <GhostBtn onClick={() => onCreateUser("region", region.regionUid, region.regionDesc)}>Assign User</GhostBtn>
                      <GhostBtn onClick={() => onShowUser("region", region.regionUid, region.regionDesc)}>Show User</GhostBtn>
                      <ApiKeyInline
                        uid={region.regionUid}
                        type="region"
                        apiKeyLazy={apiKeyLazy}
                        onRefresh={(uid, type) => apiKeyLazy.refreshKey(uid, type)}
                      />
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
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Cl</div>
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
                      <GhostBtn onClick={() => onUpdateCluster(cluster!, region.regionUid)}><EditIcon size={9} /> Edit</GhostBtn>
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
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Cl</div>
                      <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Si</div>
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
                      <GhostBtn onClick={() => onUpdateSite(site!, cluster!.clusterUid)}><EditIcon size={9} /> Edit</GhostBtn>
                      <AddBtn onClick={() => onAddSubMerchant(site!.siteUid, region.regionUid)}><PlusIcon size={9} /> Add Sub Merchant</AddBtn>
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
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Cl</div>
                      <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Si</div>
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
                        <StatusBtn value={device.isActive} onClick={() => onToggleDeviceStatus(device, subMerchant!.subMerchantUid)} />
                      )}
                      <GhostBtn onClick={() => onUpdateDevice(device, subMerchant!.subMerchantUid)}><EditIcon size={9} /> Edit</GhostBtn>
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">Cl</div>
                    <span className="font-medium text-slate-700 text-sm">{cluster!.clusterDesc}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-700">Si</div>
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
                    <GhostBtn onClick={() => onUpdateSubMerchant(subMerchant!, site!.siteUid, region.regionUid)}><EditIcon size={9} /> Edit</GhostBtn>
                    <AddBtn onClick={() => onAddDevice(subMerchant!.subMerchantUid)}><PlusIcon size={9} /> Add Device</AddBtn>
                    <GhostBtn onClick={() => onCreateUser("subMerchant", subMerchant!.subMerchantUid, subMerchant!.subMerchantDesc, region.regionUid)}>Assign User</GhostBtn>
                    <GhostBtn onClick={() => onShowUser("subMerchant", subMerchant!.subMerchantUid, subMerchant!.subMerchantDesc)}>Show User</GhostBtn>
                    <ApiKeyInline
                      uid={subMerchant!.subMerchantUid}
                      type="subMerchant"
                      regionUid={region.regionUid}
                      apiKeyLazy={apiKeyLazy}
                      onRefresh={(uid, type) => apiKeyLazy.refreshKey(uid, type)}
                    />
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

// ─── Modal state types ────────────────────────────────────────────────────────
export type ModalState =
  | { type: "region"; data?: RegionDetailedModel }
  | { type: "cluster"; data?: ClusterDetailedModel; parentRegionUid: string }
  | { type: "site"; data?: SiteDetailedModel; parentClusterUid: string }
  | { type: "subMerchant"; data?: SubMerchantDetailedModel; parentSiteUid: string; parentRegionUid: string }
  | { type: "device"; data?: DeviceModel; parentSubMerchantUid: string }
  | { type: "deviceCredential"; deviceUid: string }
  | {
    type: "createUser" | "showUser";
    targetType: "region" | "subMerchant";
    targetUid: string;
    targetLabel: string;
    parentRegionUid?: string;
  }
  | null;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MerchantContent() {
  const { showToast } = useToast();
  const user = getLoggedInUser();
  const { data: userData } = useUser(user?.userUid || "");
  const { data: merchantData, loading, refetch } = useMerchant(userData?.merchantUid || "");

  const {
    items: itemsPrice,
    loading: loadingPrice,
    setMerchantUid,
  } = usePrices({
    page: 1,
    limit: 400,
    merchantUid: "",
  });

  useEffect(() => {
    if (userData?.merchantUid) {
      setMerchantUid(userData.merchantUid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.merchantUid]);

  const { data: paymentMethods } = usePaymentMethodByMerchant(
    {
      merchantUid: merchantData?.merchantUid ?? "",
      roleUid: userData?.role.roleUid ?? ""
    }
  );

  const paymentMethodMerchant = paymentMethods?.filter((d) => itemsPrice?.some((i) => i.priceUid === d.price?.priceUid));


  const { submit: createRegion, loading: loadingCRegion } = useCreateRegion();
  const { update: updateRegion, loading: loadingURegion } = useUpdateRegion();

  // cluster
  const { submit: createCluster, loading: loadingCCluster } = useCreateCluster();
  const { update: updateCluster, loading: loadingUCluster } = useUpdateCluster();

  // site
  const { submit: createSite, loading: loadingCSite } = useCreateSite();
  const { update: updateSite, loading: loadingUSite } = useUpdateSite();

  // sub-merchant
  const { submit: createSubMerchant, loading: loadingCSubMerchant } = useCreateSubMerchant();
  const { update: updateSubMerchant, loading: loadingUSubMerchant } = useUpdateSubMerchant();

  // device
  const { submit: createDevice, loading: loadingCDevice } = useCreateDevice();
  const { update: updateDevice, loading: loadingUDevice } = useUpdateDevice();

  // device credential
  const { update: updateDeviceCredential, loading: loadingDeviceCredential } = useUpdateCredential();

  const [modal, setModal] = useState<ModalState>(null);
  const [, setSubmitLoading] = useState(false);

  const closeModal = () => setModal(null);

  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>("all");
  const [hierarchySearch, setHierarchySearch] = useState("");

  const regions: RegionDetailedModel[] = merchantData?.region ?? [];

  const filteredRegions = useMemo(
    () => filterRegionsBySearch(regions, hierarchySearch.trim().toLowerCase()),
    [regions, hierarchySearch],
  );

  const { data: merchantApiKey } = useApiKeyInfo(merchantData?.merchantUid ?? "", "merchant");
  const { refreshApiKey } = useApiKeyRefresh();
  const [currentMerchantKey, setCurrentMerchantKey] = useState<string | null>(null);
  const [merchantKeyLoading, setMerchantKeyLoading] = useState(false);
  const [merchantKeyError, setMerchantKeyError] = useState<string | null>(null);

  const apiKeyLazy = useApiKeyLazy(merchantData?.merchantUid ?? "");

  const handleRefreshMerchantKey = async () => {
    setMerchantKeyLoading(true);
    setMerchantKeyError(null);
    const key = await refreshApiKey(merchantData?.merchantUid ?? "", "merchant");
    if (key) setCurrentMerchantKey(key);
    else setMerchantKeyError("Failed to refresh API Key");
    setMerchantKeyLoading(false);
  };

  const displayedMerchantKey = currentMerchantKey ?? merchantApiKey ?? "-";


  const handleRegionSubmit = async (body: RegionRequest, uid?: string) => {
    const isUpdate = !!uid;

    setSubmitLoading(true);
    try {
      if (isUpdate && uid) {
        await updateRegion(uid, body);
        showToast("Region updated successfully", "success");
      } else {
        await createRegion(body);
        showToast("Region added successfully", "success");
      }

      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ?? "Failed to add region",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClusterSubmit = async (
    body: ClusterRequest,
    uid?: string,
    extra?: {
      siteBody: SiteRequest;
      subMerchantBody: SubMerchantRequest;
    }
  ) => {
    const isUpdate = !!uid;

    setSubmitLoading(true);

    try {
      if (isUpdate && uid) {
        await updateCluster(uid, body);
        showToast("Cluster updated successfully", "success");
      } else {
        if (!extra) throw new Error("Site and SubMerchant data required");

        // 1. Create Cluster
        const cluster = await createCluster(body);
        showToast("Cluster added successfully", "success");

        // 2. Create Site
        const site = await createSite({
          ...extra.siteBody,
          clusterUid: cluster!,
        });

        showToast("Site added successfully", "success");

        // 3. Create Sub Merchant
        await createSubMerchant({
          ...extra.subMerchantBody,
          siteUid: site!,
        });

        showToast("Sub-merchant added successfully", "success");
      }

      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} cluster`,
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSiteSubmit = async (body: SiteRequest, uid?: string) => {
    const isUpdate = !!uid;

    setSubmitLoading(true);
    try {
      if (isUpdate && uid) {
        await updateSite(uid, body);
        showToast("Site updated successfully", "success");
      } else {
        await createSite(body);
        showToast("Site added successfully", "success");
      }

      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} site`,
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubMerchantSubmit = async (body: SubMerchantRequest, uid?: string) => {
    const isUpdate = !!uid;

    setSubmitLoading(true);
    try {
      if (isUpdate && uid) {
        await updateSubMerchant(uid, body);
        showToast("Sub-merchant updated successfully", "success");
      } else {
        await createSubMerchant(body);
        showToast("Sub-merchant added successfully", "success");
      }

      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} sub-merchant`,
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeviceSubmit = async (body: DeviceRequest, uid?: string) => {
    const isUpdate = !!uid;

    setSubmitLoading(true);
    try {
      if (isUpdate && uid) {
        await updateDevice(uid, body);
        showToast("Device updated successfully", "success");
      } else {
        await createDevice(body);
        showToast("Device added successfully", "success");
      }

      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} device`,
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeviceCredentialSubmit = async (body: DeviceCredentialRequest, uid: string) => {
    setSubmitLoading(true);
    try {
      await updateDeviceCredential(uid, body);
      showToast("Device credential updated successfully", "success");
      setModal(null);
      await refetch();
    } catch (err) {
      showToast(
        (err as Error)?.message ?? "Failed to update device credential",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  const handleToggleRegionStatus = async (region: RegionDetailedModel) => {
    const nextStatus = region.isActive === "Y" ? "N" : "Y";

    setSubmitLoading(true);
    try {
      await updateRegion(region.regionUid, {
        merchantUid: merchantData?.merchantUid ?? region.merchantUid,
        regionDesc: region.regionDesc,
        bankName: region.bankName,
        bankNoRek: region.bankNoRek,
        isActive: nextStatus,
      });
      showToast(`Region ${nextStatus === "Y" ? "activated" : "deactivated"} successfully`, "success");
      await refetch();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update region status", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleSubMerchantStatus = async (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => {
    const nextStatus = subMerchant.isActive === "Y" ? "N" : "Y";

    setSubmitLoading(true);
    try {
      await updateSubMerchant(subMerchant.subMerchantUid, {
        siteUid,
        regionUid,
        subMerchantDesc: subMerchant.subMerchantDesc,
        internalSmId: subMerchant.internalSmId,
        isActive: nextStatus,
      });
      showToast(`Sub-merchant ${nextStatus === "Y" ? "activated" : "deactivated"} successfully`, "success");
      await refetch();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update sub-merchant status", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleDeviceStatus = async (device: DeviceModel, subMerchantUid: string) => {
    const isSuperAdmin = ["super admin", "dev"].includes(getLoggedInRole()?.roleDesc?.toLowerCase() ?? "");
    if (!isSuperAdmin && device.isActive !== "Y") return;

    const nextStatus = device.isActive === "Y" ? "N" : "Y";

    setSubmitLoading(true);
    try {
      await updateDevice(device.deviceUid, {
        subMerchantUid,
        deviceId: device.deviceId,
        serialNumber: device.serialNumber,
        latitude: device.latitude,
        longitude: device.longitude,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isActive: nextStatus,
      });
      showToast(`Device ${nextStatus === "Y" ? "activated" : "deactivated"} successfully`, "success");
      await refetch();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update device status", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const isLoading = loading || loadingPrice || !merchantData;


  //   const handleAssignUser = (
  //     uid: string,
  //     label: string,
  //     type: "region" | "subMerchant"
  //   ) => {
  //     setModal({ type: "assignUser", targetUid: uid, targetLabel: label, targetType: type });
  //   };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Merchant Info</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your merchant details and view assigned regions, clusters, sites, and sub merchants.
          </p>
        </div>

        {/* Merchant Info */}
        <MerchantInfoCard
          merchantData={merchantData}
          paymentMethods={paymentMethodMerchant}
          apiKey={displayedMerchantKey}
          apiKeyLoading={merchantKeyLoading}
          apiKeyError={merchantKeyError}
          onRefreshApiKey={handleRefreshMerchantKey}
          onCopyApiKey={() => {
            navigator.clipboard.writeText(displayedMerchantKey);
          }}
        />

        {/* Region Tables */}
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Region Hierarchy
              </h2>
              <p className="mt-0.5 text-sm text-foreground/50">
                Manage regions, clusters, sites & devices
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                {!hierarchySearch && (
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                  </svg>
                )}
                <input
                  type="text"
                  value={hierarchySearch}
                  onChange={(e) => setHierarchySearch(e.target.value)}
                  placeholder="Search region, cluster, site, sub merchant, device..."
                  className="w-96 rounded-xl border border-border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground shadow-sm transition-colors placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {hierarchySearch && (
                  <button
                    type="button"
                    onClick={() => setHierarchySearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <select
                value={hierarchyLevel}
                onChange={(e) => setHierarchyLevel(e.target.value as HierarchyLevel)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Levels</option>
                <option value="region">Region</option>
                <option value="cluster">Cluster</option>
                <option value="site">Site</option>
                <option value="subMerchant">Sub Merchant</option>
                <option value="device">Device</option>
              </select>

              <button
                onClick={() => setModal({ type: "region" })}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Region
              </button>
            </div>
          </div>

          {hierarchySearch.trim() && filteredRegions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No data matches your search</p>
              <p className="text-xs text-slate-400">Try a different keyword for {hierarchyLevel === "all" ? "the hierarchy" : hierarchyLevel}</p>
            </div>
          ) : hierarchyLevel !== "all" ? (
            <LevelTable
              regions={filteredRegions}
              level={hierarchyLevel}
              apiKeyLazy={apiKeyLazy}
              onAddCluster={(regionUid) =>
                setModal({ type: "cluster", parentRegionUid: regionUid })
              }
              onUpdateRegion={(region) =>
                setModal({ type: "region", data: region })
              }
              onUpdateCluster={(cluster, regionUid) =>
                setModal({
                  type: "cluster",
                  data: cluster,
                  parentRegionUid: regionUid,
                })
              }
              onAddSite={(clusterUid) =>
                setModal({
                  type: "site",
                  parentClusterUid: clusterUid,
                })
              }
              onUpdateSite={(site, clusterUid) =>
                setModal({
                  type: "site",
                  data: site,
                  parentClusterUid: clusterUid,
                })
              }
              onAddSubMerchant={(siteUid, regionUid) =>
                setModal({
                  type: "subMerchant",
                  parentSiteUid: siteUid,
                  parentRegionUid: regionUid,
                })
              }
              onUpdateSubMerchant={(subMerchant, siteUid, regionUid) =>
                setModal({
                  type: "subMerchant",
                  data: subMerchant,
                  parentSiteUid: siteUid,
                  parentRegionUid: regionUid,
                })
              }
              onAddDevice={(subMerchantUid) =>
                setModal({
                  type: "device",
                  parentSubMerchantUid: subMerchantUid,
                })
              }
              onUpdateDevice={(device, subMerchantUid) =>
                setModal({
                  type: "device",
                  data: device,
                  parentSubMerchantUid: subMerchantUid,
                })
              }
              onToggleRegionStatus={handleToggleRegionStatus}
              onToggleSubMerchantStatus={handleToggleSubMerchantStatus}
              onToggleDeviceStatus={handleToggleDeviceStatus}
              onCreateUser={(targetType, targetUid, targetLabel, parentRegionUid) =>
                setModal({ type: "createUser", targetType, targetUid, targetLabel, parentRegionUid })
              }
              onShowUser={(targetType, targetUid, targetLabel) =>
                setModal({ type: "showUser", targetType, targetUid, targetLabel })
              }
            />
          ) : (regions?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-500">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No Region data available
              </p>
            </div>
          ) : (
            filteredRegions.map((region) => (
              <RegionTable
                key={region.regionUid}
                region={region}
                apiKeyLazy={apiKeyLazy}
                onAddCluster={(regionUid) =>
                  setModal({ type: "cluster", parentRegionUid: regionUid })
                }
                onUpdateRegion={(region) =>
                  setModal({ type: "region", data: region })
                }
                onUpdateCluster={(cluster, regionUid) =>
                  setModal({
                    type: "cluster",
                    data: cluster,
                    parentRegionUid: regionUid,
                  })
                }
                onAddSite={(clusterUid) =>
                  setModal({
                    type: "site",
                    parentClusterUid: clusterUid,
                  })
                }
                onUpdateSite={(site, clusterUid) =>
                  setModal({
                    type: "site",
                    data: site,
                    parentClusterUid: clusterUid,
                  })
                }
                onAddSubMerchant={(siteUid) =>
                  setModal({
                    type: "subMerchant",
                    parentSiteUid: siteUid,
                    parentRegionUid: region.regionUid,
                  })
                }
                onUpdateSubMerchant={(subMerchant, siteUid) =>
                  setModal({
                    type: "subMerchant",
                    data: subMerchant,
                    parentSiteUid: siteUid,
                    parentRegionUid: region.regionUid,
                  })
                }
                onAddDevice={(subMerchantUid) =>
                  setModal({
                    type: "device",
                    parentSubMerchantUid: subMerchantUid,
                  })
                }
                onUpdateDevice={(device, subMerchantUid) =>
                  setModal({
                    type: "device",
                    data: device,
                    parentSubMerchantUid: subMerchantUid,
                  })
                }
                onUpdateCredential={(deviceUid) =>
                  setModal({
                    type: "deviceCredential",
                    deviceUid,
                  })
                }
                onToggleRegionStatus={handleToggleRegionStatus}
                onToggleSubMerchantStatus={handleToggleSubMerchantStatus}
                onToggleDeviceStatus={handleToggleDeviceStatus}
                onCreateUser={(targetType, targetUid, targetLabel, parentRegionUid) =>
                  setModal({ type: "createUser", targetType, targetUid, targetLabel, parentRegionUid })
                }
                onShowUser={(targetType, targetUid, targetLabel) =>
                  setModal({ type: "showUser", targetType, targetUid, targetLabel })
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modal?.type === "region" && (
        <RegionModal
          merchantUid={merchantData.merchantUid}
          data={modal.data}
          loading={loading || loadingCRegion || loadingURegion}
          onClose={() => setModal(null)}
          onSubmit={handleRegionSubmit}
        />
      )}
      {modal?.type === "cluster" && (
        <ClusterModal
          regionUid={modal.parentRegionUid}
          data={modal.data}
          loading={loading || loadingCCluster || loadingUCluster}
          onClose={() => setModal(null)}
          onSubmit={handleClusterSubmit}
        />
      )}
      {modal?.type === "site" && (
        <SiteModal
          clusterUid={modal.parentClusterUid}
          data={modal.data}
          loading={loading || loadingCSite || loadingUSite}
          onClose={() => setModal(null)}
          onSubmit={handleSiteSubmit}
        />
      )}
      {modal?.type === "subMerchant" && (
        <SubMerchantModal
          regionUid={modal.parentRegionUid}
          siteUid={modal.parentSiteUid}
          data={modal.data}
          loading={loading || loadingCSubMerchant || loadingUSubMerchant}
          onClose={() => setModal(null)}
          onSubmit={handleSubMerchantSubmit}
        />
      )}
      {modal?.type === "device" && (
        <DeviceModal
          subMerchantUid={modal.parentSubMerchantUid}
          data={modal.data}
          loading={loading || loadingCDevice || loadingUDevice}
          onClose={() => setModal(null)}
          onSubmit={handleDeviceSubmit}
        />
      )}
      {modal?.type === "deviceCredential" && (
        <DeviceCredentialModal
          deviceUid={modal.deviceUid}
          loading={loading || loadingDeviceCredential}
          onClose={() => setModal(null)}
          onSubmit={handleDeviceCredentialSubmit}
        />
      )}
      {modal?.type === "createUser" && (
        <CreateAssignedUserModal
          targetType={modal.targetType}
          targetUid={modal.targetUid}
          targetLabel={modal.targetLabel}
          merchantUid={merchantData?.merchantUid}
          regionUid={modal.parentRegionUid}
          onClose={closeModal}
          onCreated={refetch}
        />
      )}
      {modal?.type === "showUser" && (
        <TargetUserModal
          title={modal.targetType === "region" ? "Regional Users" : "Sub Merchant Users"}
          targetLabel={modal.targetLabel}
          targetUid={modal.targetUid}
          searchBy={modal.targetType === "region" ? "regionUid" : "subMerchantUid"}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
