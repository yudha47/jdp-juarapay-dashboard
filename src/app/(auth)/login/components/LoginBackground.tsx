import { PARTICLES, THEME } from "./loginTheme";

export function LoginBackground() {
    return (
        <>
            {/* Particle blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {PARTICLES.map((p, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full opacity-[0.12] animate-pulse"
                        style={{
                            width: p.w,
                            height: p.h,
                            left: `${p.l}%`,
                            top: `${p.t}%`,
                            background: p.c,
                            animationDuration: `${p.dur}s`,
                            animationDelay: `${p.del}s`,
                        }}
                    />
                ))}
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Glow orbs */}
            <div
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-[glowPulse_4s_ease-in-out_infinite]"
                style={{ background: THEME.orb1 }}
            />
            <div
                className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none animate-[glowPulse_4s_ease-in-out_infinite_2s]"
                style={{ background: THEME.orb2 }}
            />
        </>
    );
}