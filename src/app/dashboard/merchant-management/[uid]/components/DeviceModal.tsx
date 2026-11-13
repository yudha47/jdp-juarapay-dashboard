"use client";

import { useState } from "react";
import Modal, { Field, Input, Select } from "./Modal";
import { DeviceModel } from "@/data/models/DeviceModel";
import { DeviceRequest } from "@/data/request/DeviceRequest";


interface Props {
  subMerchantUid: string;
  data?: DeviceModel;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: DeviceRequest, uid?: string) => void;
}

export default function DeviceModal({ subMerchantUid, data, loading, onClose, onSubmit }: Props) {
  const [deviceId, setDeviceId] = useState(data?.deviceId ?? "");
  const [serialNumber, setSerialNumber] = useState(data?.serialNumber ?? "");
  const [latitude, setLatitude] = useState(data?.latitude ?? "");
  const [longitude, setLongitude] = useState(data?.longitude ?? "");
  const [deviceName, setDeviceName] = useState(data?.deviceName ?? "");
  const [deviceType, setDeviceType] = useState(data?.deviceType ?? "");

  const handleSubmit = () => {
    const body: DeviceRequest = {
      deviceId,
      serialNumber,
      latitude,
      longitude,
      deviceName,
      deviceType,
      subMerchantUid,
      isActive: data?.isActive ?? "N",
    };
    onSubmit(body, data?.deviceUid);
  };

  return (
    <Modal
      title={data ? "Edit Device" : "Add Device"}
      subtitle={
        data
          ? `Serial: ${data.serialNumber}`
          : ``
      }
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={data ? "Update Device" : "Add Device"}
    >
      <Field label="Device ID" required>
        <Input value={deviceId} onChange={setDeviceId} placeholder="e.g. TH-001" />
      </Field>
      <Field label="Device Name" required>
        <Input value={deviceName} onChange={setDeviceName} placeholder="e.g. Thermal" />
      </Field>
      <Field label="Device Type" required>
        <Select
          value={deviceType}
          onChange={setDeviceType}
          placeholder="Select device type"
          options={[
            { label: "EDC", value: "edc" },
            { label: "Reader", value: "reader" },
          ]}
        />
      </Field>
      <Field label="Serial Number" required>
        <Input value={serialNumber} onChange={setSerialNumber} placeholder="e.g. SN-XXXXXX" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude" required>
          <Input value={latitude} onChange={setLatitude} placeholder="-6.2088" type="text" />
        </Field>
        <Field label="Longitude" required>
          <Input value={longitude} onChange={setLongitude} placeholder="106.8456" type="text" />
        </Field>
      </div>
    </Modal>
  );
}
