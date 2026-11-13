"use client";

import { useState } from "react";
import Modal, { Field, Input } from "./Modal";
import { SiteDetailedModel } from "@/data/models/SiteModel";
import { SiteRequest } from "@/data/request/SiteRequest";

interface Props {
  clusterUid: string;
  data?: SiteDetailedModel;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: SiteRequest, uid?: string) => void;
}

export default function SiteModal({ clusterUid, data, loading, onClose, onSubmit }: Props) {
  const [siteDesc, setSiteDesc] = useState(data?.siteDesc ?? "");

  const handleSubmit = () => {
    const body: SiteRequest = { clusterUid, siteDesc };
    onSubmit(body, data?.siteUid);
  };

  return (
    <Modal
      title={data ? "Edit Site" : "Add Site"}
      subtitle={data ? `Editing: ${data.siteDesc}` : ``}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={data ? "Update Site" : "Add Site"}
    >
      <Field label="Site Description" required>
        <Input value={siteDesc} onChange={setSiteDesc} placeholder="e.g. Site Blok M Plaza" />
      </Field>
    </Modal>
  );
}