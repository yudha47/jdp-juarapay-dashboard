// ─── Brand Palette ───────────────────────────────────────────────────────────
// #FF4D8D  Bright Pink
// #E84393  Rose Pink
// #9B51E0  Medium Purple
// #5B2EFF  Deep Violet
// #0F0F0F  Soft Black

export const isSandbox = process.env.NEXT_PUBLIC_SIMULATOR === "sandbox";

export const THEME = isSandbox
    ? {
          bg: "linear-gradient(135deg, #000000 0%, #1A1A1A 35%, #3D3D3D 65%, #666666 100%)",
          orb1: "#e4e4e4",
          orb2: "#d1d1d1",
          particles: [
              "#FFFFFF",
              "#AAAAAA",
              "#DDDDDD",
              "#FFFFFF",
              "#888888",
              "#CCCCCC",
              "#FFFFFF",
              "#AAAAAA",
              "#DDDDDD",
              "#FFFFFF",
              "#888888",
              "#CCCCCC",
              "#FFFFFF",
              "#AAAAAA",
              "#DDDDDD",
              "#FFFFFF",
              "#888888",
              "#CCCCCC",
          ],
          accent: "#FFFFFF",
          accentBg: "rgba(22,21,21,0.15)",
          accentBorder: "rgba(255,255,255,0.30)",
          accentBar: "#FFFFFF",
      }
    : {
          bg: "linear-gradient(135deg, #0F0518 0%, #2D0A5F 35%, #9B51E0 65%, #FF4D8D 100%)",
          orb1: "#FF4D8D",
          orb2: "#5B2EFF",
          particles: [
              "#FF4D8D",
              "#9B51E0",
              "#5B2EFF",
              "#FF4D8D",
              "#E84393",
              "#5B2EFF",
              "#FF4D8D",
              "#9B51E0",
              "#5B2EFF",
              "#FF4D8D",
              "#E84393",
              "#5B2EFF",
              "#FF4D8D",
              "#9B51E0",
              "#5B2EFF",
              "#FF4D8D",
              "#E84393",
              "#5B2EFF",
          ],
          accent: "#FF4D8D",
          accentBg: "rgba(255,77,141,0.22)",
          accentBorder: "rgba(255,77,141,0.35)",
          accentBar: "#FF4D8D",
      };

const PARTICLE_BASE = [
    { w: 87, h: 56, l: 12, t: 8, dur: 5.2, del: 0.4 },
    { w: 34, h: 72, l: 78, t: 22, dur: 6.1, del: 1.2 },
    { w: 61, h: 41, l: 45, t: 65, dur: 4.7, del: 0.8 },
    { w: 95, h: 28, l: 90, t: 10, dur: 7.0, del: 2.1 },
    { w: 22, h: 88, l: 5, t: 80, dur: 5.5, del: 0.2 },
    { w: 49, h: 49, l: 33, t: 40, dur: 6.8, del: 1.7 },
    { w: 70, h: 35, l: 60, t: 55, dur: 4.3, del: 0.6 },
    { w: 30, h: 65, l: 25, t: 30, dur: 7.2, del: 2.5 },
    { w: 55, h: 55, l: 82, t: 70, dur: 5.9, del: 1.0 },
    { w: 42, h: 80, l: 55, t: 15, dur: 6.4, del: 0.3 },
    { w: 80, h: 25, l: 15, t: 50, dur: 4.8, del: 1.9 },
    { w: 28, h: 60, l: 70, t: 85, dur: 7.5, del: 0.9 },
    { w: 65, h: 45, l: 38, t: 75, dur: 5.3, del: 2.3 },
    { w: 38, h: 70, l: 92, t: 45, dur: 6.0, del: 0.7 },
    { w: 50, h: 50, l: 8, t: 35, dur: 4.5, del: 1.5 },
    { w: 75, h: 30, l: 50, t: 90, dur: 7.1, del: 0.1 },
    { w: 20, h: 90, l: 65, t: 5, dur: 5.7, del: 2.0 },
    { w: 60, h: 60, l: 30, t: 60, dur: 6.6, del: 1.3 },
];

export const PARTICLES = PARTICLE_BASE.map((p, i) => ({ ...p, c: THEME.particles[i] }));
