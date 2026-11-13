import { RegionDetailedModel } from "@/data/models/RegionModel";
import { RegionRequest } from "@/data/request/RegionRequest";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  merchantUid: string;
  existingRegion?: RegionDetailedModel | null;
  onClose: () => void;
  onSave: (m: RegionRequest) => void;
  canSave?: boolean;
};

export function RegionModal({
  open,
  title,
  merchantUid,
  existingRegion,
  onClose,
  onSave,
  canSave = true,
}: Props) {
  const [form, setForm] = useState({
    regionDesc: existingRegion?.regionDesc ?? "",
    regionID: existingRegion?.regionId ?? "",
    merchantUid: merchantUid,
  });

  useEffect(() => {
    if (!open) return;

    flushSync(() => {
      setForm({
        regionDesc: existingRegion?.regionDesc ?? "",
        regionID: existingRegion?.regionId ?? "",
        merchantUid,
      });
    });
  }, [open, existingRegion, merchantUid]);


  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(){
    const e: Record<string, string> = {};

    if(!form.regionID.trim()) e.regionID = "Region ID is required";
    if(!form.regionDesc.trim()) e.regionDesc = "Region Name is required";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if(Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const newRegion: RegionRequest = {
      regionId: form.regionID,
      regionDesc: form.regionDesc,
      merchantUid: form.merchantUid,
      isActive: existingRegion?.isActive ?? "Y",
    }

    onSave(newRegion);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" 
        onClick={onClose}
      />

      <div className="relative w-[92vw] max-w-md rounded-xl bg-background border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-foreground/60">Region ID</p>
          <input
            value={form.regionID}
            onChange={(e) => setForm({...form, regionID: e.target.value})}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.regionID ? "border-primary/40 focus:ring-red-200" : "border-border focus:border-primary/40 focus:ring-primary/20"
            }`}
            placeholder="Region ID"
          />
          {errors.regionID && <p className="text-xs text-red-500">{errors.regionID}</p>}
        </div>

        <div className="p-4 space-y-2">
          <p className="text-xs text-foreground/60">Region Name</p>
          <input
            value={form.regionDesc}
            onChange={(e) => setForm({...form, regionDesc: e.target.value})}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.regionDesc ? "border-primary/40 focus:ring-red-200" : "border-border focus:border-primary/40 focus:ring-primary/20"
            }`}
            placeholder="Region Name"
          />
          {errors.regionDesc && <p className="text-xs text-red-500">{errors.regionDesc}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex justify-end gap-2 bg-background">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="rounded-lg px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
