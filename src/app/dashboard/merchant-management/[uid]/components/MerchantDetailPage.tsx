"use client";

import { useState } from "react";
import { MerchantDetailedModel } from "@/data/models/MerchantModel";

import RegionModal from "./RegionModal";
import ClusterModal from "./ClusterModal";
import SiteModal from "./SiteModal";
import SubMerchantModal from "./SubMerchantModal";

import MerchantHeader from "./MerchantHeader";
import HierarchyTree, { HierarchyLevel } from "./HierarchyTree";
import { RegionDetailedModel } from "@/data/models/RegionModel";
import { ClusterDetailedModel } from "@/data/models/ClusterModel";
import { SiteDetailedModel } from "@/data/models/SiteModel";
import { RegionRequest } from "@/data/request/RegionRequest";
import { ClusterRequest } from "@/data/request/ClusterRequest";
import { SiteRequest } from "@/data/request/SiteRequest";
import { DeviceModel } from "@/data/models/DeviceModel";
import { useToast } from "@/components/ui/ToastProvider";
import { useCreateRegion, useUpdateRegion } from "@/hooks/useRegion";
import { useCreateCluster, useUpdateCluster } from "@/hooks/useCluster";
import { useCreateSite, useUpdateSite } from "@/hooks/useSite";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { useCreateSubMerchant, useUpdateSubMerchant } from "@/hooks/useSubMerchant";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";
import { useUpdateUser } from "@/hooks/useUsers";
import { UserUpdateRequest } from "@/data/request/UserUpdateRequest";
import AssignUserModal from "./AssignUserModal";
import { usePaymentMethodByMerchant } from "@/hooks/usePaymentMethod";
import { useApiKeyLazy } from "@/hooks/useApiKeyLazy";
import { DeviceRequest } from "@/data/request/DeviceRequest";
import { useCreateDevice, useUpdateCredential, useUpdateDevice } from "@/hooks/useDevice";
import DeviceModal from "./DeviceModal";
import DeviceCredentialModal from "./DeviceCredentialModal";
import { DeviceCredentialRequest } from "../../../../../data/request/DeviceCredentialRequest";

interface Props {
  merchant: MerchantDetailedModel;
  onRefresh: () => void;
  onRefreshApiKey: () => void;
  apiKeyLoading?: boolean;
  apiKeyError?: string | null;
  apiKey: string
}

export type ModalState =
  | { type: "region"; data?: RegionDetailedModel }
  | { type: "cluster"; data?: ClusterDetailedModel; parentRegionUid: string }
  | { type: "site"; data?: SiteDetailedModel; parentClusterUid: string }
  | { type: "subMerchant"; data?: SubMerchantDetailedModel; parentSiteUid: string, subMerchantRegionUid: string }
  | { type: "device"; data?: DeviceModel; parentSubMerchantUid: string }
  | { type: "deviceCredential"; deviceUid: string }
  | {
    type: "assignUser";
    targetType: "merchant" | "region" | "subMerchant";
    targetUid: string;
    targetLabel: string;
    parentRegionUid?: string;
  }
  | null;

export default function MerchantDetailPage({ merchant, onRefresh, apiKey, onRefreshApiKey, apiKeyLoading, apiKeyError }: Props) {
  const { showToast } = useToast();

  // region
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

  // user assignment update
  const { update: updateUser, loading: loadingAssignUser } = useUpdateUser();

  // payment method available
  const { data: paymentMethods } = usePaymentMethodByMerchant({ merchantUid: merchant.merchantUid });

  // lazy api key
  const apiKeyLazy = useApiKeyLazy(merchant.merchantUid);

  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(false);
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>("all");
  const [hierarchySearch, setHierarchySearch] = useState("");

  // modal
  const handleOpenAssignModal = (targetType: "merchant" | "region" | "subMerchant", targetUid: string, targetLabel: string, parentRegionUid?: string) => {
    setModal({
      type: "assignUser",
      targetType,
      targetUid,
      targetLabel,
      parentRegionUid,
    });
  }

  const copyApiKeytoClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    showToast("API Key copied to clipboard", "success");
  }

  /* ─── Handlers ─────────────────────────────────────── */
  const handleRegionSubmit = async (body: RegionRequest, uid?: string) => {
    const isUpdate = !!uid;

    setLoading(true);
    try {
      if (isUpdate && uid) {
        await updateRegion(uid, body);
        showToast("Region updated successfully", "success");
      } else {
        await createRegion(body);
        showToast("Region added successfully", "success");
      }

      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ?? "Failed to add region",
        "error"
      );
    } finally {
      setLoading(false);
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

    setLoading(true);

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
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} cluster`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSubmit = async (body: SiteRequest, uid?: string) => {
    const isUpdate = !!uid;

    setLoading(true);
    try {
      if (isUpdate && uid) {
        await updateSite(uid, body);
        showToast("Site updated successfully", "success");
      } else {
        await createSite(body);
        showToast("Site added successfully", "success");
      }

      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} site`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubMerchantSubmit = async (body: SubMerchantRequest, uid?: string) => {
    const isUpdate = !!uid;

    setLoading(true);
    try {
      if (isUpdate && uid) {
        await updateSubMerchant(uid, body);
        showToast("Sub-merchant updated successfully", "success");
      } else {
        await createSubMerchant(body);
        showToast("Sub-merchant added successfully", "success");
      }

      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} sub-merchant`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSubmit = async (body: DeviceRequest, uid?: string) => {
    const isUpdate = !!uid;

    setLoading(true);
    try {
      if (isUpdate && uid) {
        await updateDevice(uid, body);
        showToast("Device updated successfully", "success");
      } else {
        await createDevice(body);
        showToast("Device added successfully", "success");
      }

      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ??
        `Failed to ${isUpdate ? "update" : "add"} device`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceCredentialSubmit = async (body: DeviceCredentialRequest, uid: string) => {
    setLoading(true);
    try {
      await updateDeviceCredential(uid, body);
      showToast("Device credential updated successfully", "success");
      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ?? "Failed to update device credential",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  const handleToggleRegionStatus = async (region: RegionDetailedModel) => {
    const nextStatus = region.isActive === "Y" ? "N" : "Y";

    setLoading(true);
    try {
      await updateRegion(region.regionUid, {
        merchantUid: merchant.merchantUid,
        regionDesc: region.regionDesc,
        bankName: region.bankName,
        bankNoRek: region.bankNoRek,
        isActive: nextStatus,
      });
      showToast(`Region ${nextStatus === "Y" ? "activated" : "deactivated"} successfully`, "success");
      onRefresh();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update region status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubMerchantStatus = async (subMerchant: SubMerchantDetailedModel, siteUid: string, regionUid: string) => {
    const nextStatus = subMerchant.isActive === "Y" ? "N" : "Y";

    setLoading(true);
    try {
      await updateSubMerchant(subMerchant.subMerchantUid, {
        siteUid,
        regionUid,
        subMerchantDesc: subMerchant.subMerchantDesc,
        internalSmId: subMerchant.internalSmId,
        isActive: nextStatus,
      });
      showToast(`Sub-merchant ${nextStatus === "Y" ? "activated" : "deactivated"} successfully`, "success");
      onRefresh();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update sub-merchant status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeviceStatus = async (device: DeviceModel, subMerchantUid: string) => {
    const nextStatus = device.isActive === "Y" ? "N" : "Y";

    setLoading(true);
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
      onRefresh();
    } catch (err) {
      showToast((err as Error)?.message ?? "Failed to update device status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (body: UserUpdateRequest, userUid: string) => {
    setLoading(true);
    try {
      await updateUser(userUid, body);
      showToast("User assigned successfully", "success");
      setModal(null);
      onRefresh();
    } catch (err) {
      showToast(
        (err as Error)?.message ?? "Failed to assign user",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      <div className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Header card */}
        <MerchantHeader
          handleOpenAssignModal={handleOpenAssignModal}
          merchant={merchant}
          apiKey={apiKey}
          onCopyApiKey={copyApiKeytoClipboard}
          onRefreshApiKey={onRefreshApiKey}
          apiKeyLoading={apiKeyLoading}
          apiKeyError={apiKeyError}
          paymentMethods={paymentMethods}
        />

        {/* Region hierarchy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Region Hierarchy</h2>
              <p className="text-sm text-foreground/50 mt-0.5">
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
                onClick={() =>
                  setModal({ type: "region" })
                }
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Region
              </button>
            </div>
          </div>

          <HierarchyTree
            merchant={merchant}
            level={hierarchyLevel}
            search={hierarchySearch}
            onEditRegion={(r) => setModal({ type: "region", data: r })}
            onAddCluster={(regionUid) =>
              setModal({ type: "cluster", parentRegionUid: regionUid })
            }
            onEditCluster={(c, regionUid) =>
              setModal({ type: "cluster", data: c, parentRegionUid: regionUid })
            }
            onAddSite={(clusterUid) =>
              setModal({ type: "site", parentClusterUid: clusterUid })
            }
            onEditSite={(s, clusterUid) =>
              setModal({ type: "site", data: s, parentClusterUid: clusterUid })
            }
            onAddSubMerchant={(siteUid, regionUid) =>
              setModal({ type: "subMerchant", parentSiteUid: siteUid, subMerchantRegionUid: regionUid })
            }
            onEditSubMerchant={(s, siteUid, regionUid) =>
              setModal({ type: "subMerchant", data: s, parentSiteUid: siteUid, subMerchantRegionUid: regionUid })
            }
            onAddDevice={(subMerchantUid) =>
              setModal({ type: "device", parentSubMerchantUid: subMerchantUid })
            }
            onEditCredential={(deviceUid) =>
              setModal({ type: "deviceCredential", deviceUid })
            }
            onEditDevice={(t, subMerchantUid) =>
              setModal({
                type: "device",
                data: t,
                parentSubMerchantUid: subMerchantUid,
              })
            }
            onToggleRegionStatus={handleToggleRegionStatus}
            onToggleSubMerchantStatus={handleToggleSubMerchantStatus}
            onToggleDeviceStatus={handleToggleDeviceStatus}
            onAssignUser={handleOpenAssignModal}
            apiKeyLazy={apiKeyLazy}
            onRefreshApiKey={(uid, type) => apiKeyLazy.refreshKey(uid, type)}
          />
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "region" && (
        <RegionModal
          merchantUid={merchant.merchantUid}
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
          siteUid={modal.parentSiteUid}
          regionUid={modal.subMerchantRegionUid}
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
      {modal?.type === "assignUser" && (
        <AssignUserModal
          open
          targetType={modal.targetType}
          targetUid={modal.targetUid}
          targetLabel={modal.targetLabel}
          merchantUid={merchant.merchantUid}
          regionUid={modal.parentRegionUid}
          loading={loading || loadingAssignUser}
          onClose={() => setModal(null)}
          onSubmit={handleAssignUser}
        />
      )}
    </div>
  );
}
