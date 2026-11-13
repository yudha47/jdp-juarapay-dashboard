import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type UserItem = { userUid: string; fullName: string; email: string };

export function SearchSelectUser({
  label,
  required,
  users,
  value,
  onChange,
  placeholder = "Search user by name...",
  error,
  disabled = false,
}: {
  label: string;
  required?: boolean;
  users: UserItem[];
  value: string;
  onChange: (userUid: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const DROPDOWN_MAX_HEIGHT = 320; // max height dropdown dalam px
  const MARGIN = 8;

  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
    openUpward: boolean;
    buttonTop: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    openUpward: false,
    buttonTop: 0,
  });

  const selected = useMemo(() => users.find((u) => u.userUid === value) ?? null, [users, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 50);
    return users
      .filter((u) => {
        const name = (u.fullName ?? "").toLowerCase();
        const email = (u.email ?? "").toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .slice(0, 50);
  }, [users, query]);

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const openUpward = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

    setPos({
      left: r.left,
      top: openUpward ? r.top - MARGIN : r.bottom + MARGIN,
      width: r.width,
      openUpward,
      buttonTop: r.top,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        disabled={disabled}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-left focus:outline-none focus:ring-2 transition-all ${disabled ? "bg-muted text-foreground/50 cursor-not-allowed" : ""
          } ${error
            ? "border-primary/40 focus:ring-red-200"
            : "border-border focus:border-primary/40 focus:ring-primary/20"
          }`}
      >
        {selected ? (
          <span className="block truncate">
            {selected.fullName} ({selected.email})
          </span>
        ) : (
          <span className="text-foreground/50">{placeholder}</span>
        )}
      </button>

      {error && <p className="mt-1 text-xs text-primary">{error}</p>}

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              left: pos.left,
              width: pos.width,
              zIndex: 99999,
              // Kalau buka ke atas: anchor dari bottom, kalau ke bawah: anchor dari top
              ...(pos.openUpward
                ? { bottom: window.innerHeight - pos.buttonTop + MARGIN }
                : { top: pos.top }),
              maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
            }}
            className="rounded-lg border border-border bg-background shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-border shrink-0">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="overflow-auto flex-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-foreground/60">No data found.</div>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.userUid}
                    type="button"
                    onClick={() => {
                      onChange(u.userUid);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
                  >
                    <div className="text-sm font-medium truncate">{u.fullName}</div>
                    <div className="text-xs text-foreground/60 truncate">{u.email}</div>
                  </button>
                ))
              )}
            </div>

            {value && (
              <div className="p-2 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="text-xs text-foreground/70 hover:text-foreground"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}