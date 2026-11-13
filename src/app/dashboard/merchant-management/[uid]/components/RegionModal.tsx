"use client";

import { useState } from "react";
import Modal, { Field, Input } from "./Modal";
import { RegionDetailedModel } from "@/data/models/RegionModel";
import { RegionRequest } from "@/data/request/RegionRequest";

interface Props {
  merchantUid: string;
  data?: RegionDetailedModel;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: RegionRequest, uid?: string) => void;
}

export default function RegionModal({ merchantUid, data, loading, onClose, onSubmit }: Props) {
  const [regionDesc, setRegionDesc] = useState(data?.regionDesc ?? "");
  const [bankName, setBankName] = useState(data?.bankName ?? "");
  const [bankNoRek, setBankNoRek] = useState(data?.bankNoRek ?? "");
  // const [regionId, setRegionId] = useState(data?.regionId ?? "");

  const handleSubmit = () => {
    const body: RegionRequest = { merchantUid, regionDesc, bankName, bankNoRek, isActive: data?.isActive ?? "N" };
    onSubmit(body, data?.regionUid);
  };

  return (
    <Modal
      title={data ? "Edit Region" : "Add Region"}
      subtitle={data ? `Editing: ${data.regionDesc}` : ``}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={data ? "Update Region" : "Add Region"}
    >
      <Field label="Region Description" required>
        <Input value={regionDesc} onChange={setRegionDesc} placeholder="e.g. Jakarta Selatan" />
      </Field>
      <Field label="Region Bank Name" required>
        <Input value={bankName} onChange={setBankName} placeholder="e.g. Bank Mandiri" />
      </Field>
      <Field label="Region Bank Account Number" required>
        <Input value={bankNoRek} onChange={setBankNoRek} placeholder="e.g. 1234567890" />
      </Field>
    </Modal>
  );
}
