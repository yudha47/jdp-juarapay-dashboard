"use client";

import { useState } from "react";

const simulators = {
  payment: "https://simulator-cring.spesandbox.com/",
  qris: "https://paytest.bayarind.id/simulator/qris/",
  bca: "https://paytest.bayarind.id/simulator/bcava/compcode",
  mandiri: "https://paytest.bayarind.id/simulator/mandiriva/",
};

export default function SandboxSimulatorPage() {
  const [active, setActive] = useState<keyof typeof simulators>("qris");

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-zinc-900">Sandbox Simulator</h1>
          <p className="text-sm text-zinc-500">
            Simulasi payment sandbox dalam layout dashboard existing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(simulators).map((key) => {
            const current = key as keyof typeof simulators;
            const isActive = active === current;

            return (
              <button
                key={key}
                onClick={() => setActive(current)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {key.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <iframe
          src={simulators[active]}
          className="h-full w-full border-0"
          title="Sandbox Simulator"
        />
      </div>
    </div>
  );
}