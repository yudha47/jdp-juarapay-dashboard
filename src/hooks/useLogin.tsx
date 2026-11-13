import { useState } from "react";
import type { LoginRequest } from "@/data/request/auth/LoginRequest";
import { saveAuthSession } from "@/lib/auth";
import { LoginData } from "@/data/response/LoginResponse";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginRequest): Promise<LoginData | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors || "Login failed");
      }

      const json = await res.json();
      if (json.errors) throw new Error(json.errors);

      const data = json.data ?? null;
      if (data) saveAuthSession(data);

      return data;

    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
