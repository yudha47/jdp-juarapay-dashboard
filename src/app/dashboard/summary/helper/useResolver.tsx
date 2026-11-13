"use client";

import { useEffect, useMemo, useState } from "react";
import { ReportTrxPerMonthModel } from "@/data/models/ReportTrxPerMonthModel";
import { useMerchant } from "@/hooks/useMerchant";
import { useRegionByUid } from "@/hooks/useRegion";
import { useSubMerchant } from "@/hooks/useSubMerchant";
import { useUser } from "@/hooks/useUsers";
import { getLoggedInUser } from "@/lib/auth";

type RoleView = "admin" | "region" | "merchant";

type ResolvedUids = {
  merchantUid?: string;
  regionUid?: string;
  subMerchantUid?: string;
};

export function useSummaryIdentityResolver({
  role,
  activeReportItem,
}: {
  role: RoleView;
  activeReportItem?: ReportTrxPerMonthModel | null;
}) {
  const [loggedInUserUid, setLoggedInUserUid] = useState<string | undefined>(undefined);
  const [loggedInUserUidLoading, setLoggedInUserUidLoading] = useState(false);
  const [loggedInUserUidError, setLoggedInUserUidError] = useState<string | null>(null);

  const [reportResolvedUids, setReportResolvedUids] = useState<ResolvedUids>({});
  const [needUserFallback, setNeedUserFallback] = useState(false);

  useEffect(() => {
    const next: ResolvedUids = {};

    if (role === "admin") {
      if (activeReportItem?.merchantId) next.merchantUid = activeReportItem.merchantId;
    }

    if (role === "region") {
      if (activeReportItem?.merchantId) next.merchantUid = activeReportItem.merchantId;
      if (activeReportItem?.regionId) next.regionUid = activeReportItem.regionId;
    }

    if (role === "merchant") {
      if (activeReportItem?.merchantId) next.merchantUid = activeReportItem.merchantId;
      if (activeReportItem?.regionId) next.regionUid = activeReportItem.regionId;
      // subMerchantUid selalu diambil dari user detail (report hanya punya subMerchantId, bukan UID)
    }

    setReportResolvedUids(next);

    const fallbackNeeded =
      (role === "admin" && !next.merchantUid) ||
      (role === "region" && (!next.merchantUid || !next.regionUid)) ||
      role === "merchant";

    setNeedUserFallback(fallbackNeeded);
  }, [role, activeReportItem]);

  useEffect(() => {
    if (!needUserFallback) {
      setLoggedInUserUid(undefined);
      setLoggedInUserUidError(null);
      setLoggedInUserUidLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setLoggedInUserUidLoading(true);
      setLoggedInUserUidError(null);

      try {
        const user = await getLoggedInUser();
        if (!active) return;

        setLoggedInUserUid(user?.userUid || undefined);
      } catch (e) {
        if (!active) return;
        setLoggedInUserUid(undefined);
        setLoggedInUserUidError((e as Error)?.message ?? "Failed to get logged in user");
      } finally {
        if (!active) return;
        setLoggedInUserUidLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [needUserFallback]);

  const {
    data: userDetail,
    loading: userLoading,
    error: userError,
  } = useUser(loggedInUserUid, {
    enabled: needUserFallback && !!loggedInUserUid,
  });

  const finalResolvedUids = useMemo<ResolvedUids>(() => {
    const next: ResolvedUids = { ...reportResolvedUids };

    if (role === "admin") {
      next.merchantUid = next.merchantUid || userDetail?.merchantUid || undefined;
    }

    if (role === "region") {
      next.merchantUid = next.merchantUid || userDetail?.merchantUid || undefined;
      next.regionUid = next.regionUid || userDetail?.regionUid || undefined;
    }

    if (role === "merchant") {
      next.merchantUid = next.merchantUid || userDetail?.merchantUid || undefined;
      next.regionUid = next.regionUid || userDetail?.regionUid || undefined;
      next.subMerchantUid = userDetail?.subMerchantUid || undefined;
    }

    return next;
  }, [role, reportResolvedUids, userDetail]);

  const merchant = useMerchant(finalResolvedUids.merchantUid);
  const region = useRegionByUid(finalResolvedUids.regionUid);
  const subMerchant = useSubMerchant(finalResolvedUids.subMerchantUid);

  const loading =
    loggedInUserUidLoading ||
    userLoading ||
    merchant.loading ||
    region.loading ||
    subMerchant.loading;

  const error =
    loggedInUserUidError ||
    userError ||
    merchant.error ||
    region.error ||
    subMerchant.error ||
    null;

  const identity = useMemo(
    () => ({
      merchant: merchant.data,
      region: region.data,
      subMerchant: subMerchant.data,
      userDetail,
      uids: finalResolvedUids,
    }),
    [merchant.data, region.data, subMerchant.data, userDetail, finalResolvedUids]
  );

  return {
    identity,
    loading,
    error,
  };
}