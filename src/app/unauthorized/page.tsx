"use client";

import { clearAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoToLogin = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    });

    clearAuthSession();

    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>

        <p className="mt-2 text-zinc-500">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <button
          onClick={handleGoToLogin}
          className="mt-6 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}