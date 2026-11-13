import { getLoggedInUser } from "@/lib/auth";

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("auth:changed", handler as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("auth:changed", handler as EventListener);
  };
}

function getSnapshot() {
  return getLoggedInUser();
}

function getServerSnapshot() {
  return null; // server selalu null biar SSR konsisten
}

export const authUserStore = { subscribe, getSnapshot, getServerSnapshot };