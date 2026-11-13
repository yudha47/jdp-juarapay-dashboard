import { useState } from "react";

interface Props {
  apiKeyLazy: {
    fetchKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => void;
    getKey: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
    isLoading: (uid: string, type: "region" | "subMerchant", regionUid?: string) => boolean;
    getError: (uid: string, type: "region" | "subMerchant", regionUid?: string) => string | null;
  };
  onRefreshApiKey: (uid: string, type: "region" | "subMerchant") => void;
}

export function ApiKeyInline({
  uid,
  type,
  regionUid,
  apiKeyLazy,
  onRefresh,
}: {
  uid: string;
  type: "region" | "subMerchant";
  regionUid?: string;
  apiKeyLazy: Props["apiKeyLazy"];
  onRefresh: Props["onRefreshApiKey"];
}) {
  const [revealed, setRevealed] = useState(false);
  const key = apiKeyLazy.getKey(uid, type, regionUid);
  const loading = apiKeyLazy.isLoading(uid, type, regionUid);
  const error = apiKeyLazy.getError(uid, type, regionUid);

  const handleReveal = () => {
    if (!key) apiKeyLazy.fetchKey(uid, type, regionUid);
    setRevealed(true);
  };

  const handleCopy = () => {
    if (key) navigator.clipboard.writeText(key);
  };

  // Belum di-reveal
  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
          />
        </svg>
        Show API Key
      </button>
    );
  }

  return (
    <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-[11px]">
      {/* Key icon */}
      <div className="flex w-7 shrink-0 items-center justify-center border-r border-slate-200 py-1.5 text-slate-400">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
          />
        </svg>
      </div>

      {/* Key value */}
      <code className="flex-1 truncate px-2 py-1.5 font-mono text-[10px] text-slate-500 min-w-0 max-w-40">
        {loading ? "Loading..." : error ? "Error" : key ?? "—"}
      </code>

      {/* Copy */}
      <button
        onClick={handleCopy}
        disabled={!key}
        className="border-l border-slate-200 px-2 py-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 transition-colors"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Refresh */}
      <button
        onClick={() => onRefresh(uid, type)}
        disabled={loading}
        className="border-l border-slate-200 px-2 py-1.5 text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
      >
        <svg
          className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  );
}