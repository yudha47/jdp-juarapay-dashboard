import { TransactionFilterPayload } from "@/data/models/TransactionMode";

interface Props {
  filters: TransactionFilterPayload;
}

export default function ExportButton({ filters }: Props) {
  const handleExport = async () => {
    const res = await fetch("/api/transactions/export", {
      method: "POST",
      body: JSON.stringify(filters),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Export PDF
    </button>
  );
}
