"use client";

import { useState } from "react";
import Modal, { Field, Input } from "./Modal";
import { ClusterDetailedModel } from "@/data/models/ClusterModel";
import { ClusterRequest } from "@/data/request/ClusterRequest";
import { SiteRequest } from "@/data/request/SiteRequest";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";

interface Props {
  regionUid: string;
  data?: ClusterDetailedModel;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
  body: ClusterRequest,
  uid?: string,
  extra?: {
    siteBody: SiteRequest;
    subMerchantBody: SubMerchantRequest;
  }
) => void;
}

export default function ClusterModal({ regionUid, data, loading, onClose, onSubmit }: Props) {
  const [clusterDesc, setClusterDesc] = useState(data?.clusterDesc ?? "");
  const [siteName, setSiteName] = useState("");
  const [subMerchantName, setSubMerchantName] = useState("");
  // const [subMerchantId, setSubMerchantId] = useState("");

  const handleSubmit = () => {
    const clusterBody: ClusterRequest = {
      clusterDesc,
      regionUid,
    };

    const siteBody: SiteRequest = {
      siteDesc: siteName,
      clusterUid: "",
    };

    const subMerchantBody: SubMerchantRequest = {
      subMerchantDesc: subMerchantName,
      siteUid: "",
      regionUid,
      isActive: "N",
    };

    onSubmit(clusterBody, data?.clusterUid, {
      siteBody,
      subMerchantBody,
    });
  };

  return (
    <Modal
      title={data ? "Edit Cluster" : "Add Cluster"}
      subtitle={data ? `Editing: ${data.clusterDesc}` : ``}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={data ? "Update Cluster" : "Add Cluster"}
    >
      <Field label="Cluster Description" required>
        <Input
          value={clusterDesc}
          onChange={setClusterDesc}
          placeholder="e.g. Cluster A - Sudirman"
        />
      </Field>

      {!data && (
        <>
          <Field label="Site Name" required>
            <Input
              value={siteName}
              onChange={setSiteName}
              placeholder="e.g. Site Sudirman"
            />
          </Field>

          <Field label="Sub Merchant Name" required>
            <Input
              value={subMerchantName}
              onChange={setSubMerchantName}
              placeholder="e.g. Merchant A"
            />
          </Field>

          {/* <Field label="Sub Merchant ID" required>
            <Input
              value={subMerchantId}
              onChange={setSubMerchantId}
              placeholder="e.g. SUB-T00"
            />
          </Field> */}
        </>
      )}
    </Modal>
  );
}