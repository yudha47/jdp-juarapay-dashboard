type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown | FormData; // ✅ tambah FormData
    headers?: HeadersInit;
    signal?: AbortSignal | null;
};

function clearBrowserAuthSession() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("pga.auth.v1");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("menus");
}

export async function apiClient<T>(endpoint: string, options?: ApiOptions, storeCache?: boolean): Promise<T> {
    const isAbsolute = endpoint.startsWith("http://") || endpoint.startsWith("https://");
    const isInternal = endpoint.startsWith("/api/");
    const base = isAbsolute || isInternal ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

    const isFormData = options?.body instanceof FormData;

    const res = await fetch(`${base}${endpoint}`, {
        method: options?.method ?? "GET",
        headers: isFormData
            ? { ...options?.headers } // ⚠️ jangan set Content-Type, biar browser yang handle boundary
            : {
                  "Content-Type": "application/json",
                  ...options?.headers,
              },
        body: isFormData
            ? (options.body as FormData) // ✅ kirim langsung tanpa stringify
            : options?.body
              ? JSON.stringify(options.body)
              : undefined,
        cache: storeCache ? "default" : "no-store",
        signal: options?.signal,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;

    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!res.ok) {
        if (res.status === 401 && typeof window !== "undefined" && !endpoint.startsWith("/api/auth/login")) {
            clearBrowserAuthSession();
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        throw new Error(data?.message || `API request failed (${res.status})`);
    }

    return data as T;
}
