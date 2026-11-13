"use client";

import { useState } from "react";
import Modal, { Field, Input } from "./Modal";
import { SubMerchantDetailedModel } from "@/data/models/SubMerchantModel";
import { SubMerchantRequest } from "@/data/request/SubMerchantRequest";

interface Props {
  siteUid: string;
  regionUid: string;
  data?: SubMerchantDetailedModel;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: SubMerchantRequest, uid?: string) => void;
}

export default function SubMerchantModal({ siteUid, regionUid, data, loading, onClose, onSubmit }: Props) {
  const [subMerchantDesc, setSubMerchantDesc] = useState(data?.subMerchantDesc ?? "");
  const [internalSmId, setinternalSmId] = useState(data?.internalSmId ?? "");
  // const [subMerchantId, setSubMerchantId] = useState(data?.subMerchantId ?? "");

  const handleSubmit = () => {
    const body: SubMerchantRequest = { siteUid, regionUid, subMerchantDesc, internalSmId, isActive: data?.isActive ?? "N" };
    onSubmit(body, data?.subMerchantUid);
  };

  return (
    <Modal
      title={data ? "Edit Sub-Merchant" : "Add Sub-Merchant"}
      subtitle={data ? `Editing: ${data.subMerchantDesc}` : ``}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={data ? "Update Sub-Merchant" : "Add Sub-Merchant"}
    >
      <Field label="Sub-Merchant Description" required>
        <Input value={subMerchantDesc} onChange={setSubMerchantDesc} placeholder="e.g. Jakarta Selatan" />
      </Field>
      <Field label="Internal Sub-Merchant ID" required>
        <Input value={internalSmId} onChange={setinternalSmId} placeholder="e.g. SUB-001" />
      </Field>
    </Modal>
  );
}
