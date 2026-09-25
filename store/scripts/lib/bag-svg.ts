/**
 * Generates clean, editorial placeholder renders of structured men's bags as SVG.
 * They are ONLY placeholders so the store looks finished before real product
 * photography is uploaded through the admin dashboard.
 */
export type BagShape = "crossbody" | "messenger" | "shoulder" | "hand";
export type BagView = "front" | "detail" | "back" | "mood";

export type BagSpec = {
  shape: BagShape;
  body: string; // base colour
  hardware: "silver" | "gunmetal";
  pattern?: "weave" | "diagonal" | null;
};

const W = 1200;
const H = 1500;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const HW = {
  silver: { a: "#f4f4f2", b: "#a9aaa8", c: "#5d5f60" },
  gunmetal: { a: "#9a9b9c", b: "#55575a", c: "#26282a" },
};

type Geo = { w: number; h: number; r: number; flap: number; strap: "long" | "short" | "handle" };
const GEO: Record<BagShape, Geo> = {
  crossbody: { w: 700, h: 550, r: 30, flap: 0.58, strap: "long" },
  messenger: { w: 820, h: 590, r: 26, flap: 0.86, strap: "long" },
  shoulder: { w: 800, h: 410, r: 72, flap: 0.62, strap: "short" },
  hand: { w: 650, h: 520, r: 36, flap: 0.5, strap: "handle" },
};

export function bagSvg(spec: BagSpec, view: BagView) {
  const g = GEO[spec.shape];
  const hw = HW[spec.hardware];
  const mood = view === "mood";
  const bg1 = mood ? "#1b1a18" : "#ece8e2";
  const bg2 = mood ? "#0b0b0a" : "#d9d3ca";
  const cx = W / 2;
  const top = 880 - g.h / 2 + (g.strap === "short" ? 40 : 0);
  const left = cx - g.w / 2;
  const right = cx + g.w / 2;
  const bottom = top + g.h;
  const flapH = view === "back" ? 0 : g.h * g.flap;
  const dark = shade(spec.body, -0.45);
  const light = shade(spec.body, 0.16);
  const edge = shade(spec.body, -0.62);
  const stitch = shade(spec.body, 0.3);

  const pattern =
    spec.pattern === "weave"
      ? `<pattern id="pat" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 11h22M11 0v22" stroke="${shade(spec.body, 0.22)}" stroke-width="1.2" opacity=".35"/><rect x="3" y="3" width="5" height="5" fill="${shade(spec.body, 0.18)}" opacity=".25"/></pattern>`
      : spec.pattern === "diagonal"
        ? `<pattern id="pat" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v26M13 0v26" stroke="${shade(spec.body, 0.25)}" stroke-width="1.4" opacity=".3"/></pattern>`
        : "";

  // Strap
  let strap = "";
  const ringL = { x: left + 18, y: top + 16 };
  const ringR = { x: right - 18, y: top + 16 };
  const strapCol = shade(spec.body, -0.25);
  if (g.strap === "long") {
    strap = `<path d="M${ringL.x} ${ringL.y} C ${ringL.x - 60} ${top - 640}, ${ringR.x + 60} ${top - 640}, ${ringR.x} ${ringR.y}" fill="none" stroke="${strapCol}" stroke-width="30" stroke-linecap="round"/>
<path d="M${ringL.x} ${ringL.y} C ${ringL.x - 60} ${top - 640}, ${ringR.x + 60} ${top - 640}, ${ringR.x} ${ringR.y}" fill="none" stroke="${stitch}" stroke-width="1.5" stroke-dasharray="7 7" opacity=".45"/>
<rect x="${cx - 34}" y="${top - 497}" width="68" height="36" rx="6" fill="url(#hw)" stroke="${hw.c}" stroke-width="2"/>`;
  } else if (g.strap === "short") {
    strap = `<path d="M${left + 70} ${top + 10} C ${left + 110} ${top - 330}, ${right - 110} ${top - 330}, ${right - 70} ${top + 10}" fill="none" stroke="${strapCol}" stroke-width="34" stroke-linecap="round"/>
<path d="M${left + 70} ${top + 10} C ${left + 110} ${top - 330}, ${right - 110} ${top - 330}, ${right - 70} ${top + 10}" fill="none" stroke="${stitch}" stroke-width="1.5" stroke-dasharray="7 7" opacity=".45"/>`;
  } else {
    strap = `<path d="M${cx - 130} ${top + 6} C ${cx - 130} ${top - 230}, ${cx + 130} ${top - 230}, ${cx + 130} ${top + 6}" fill="none" stroke="${strapCol}" stroke-width="28" stroke-linecap="round"/>
<path d="M${ringL.x} ${ringL.y} C ${ringL.x - 90} ${top - 640}, ${ringR.x + 90} ${top - 640}, ${ringR.x} ${ringR.y}" fill="none" stroke="${strapCol}" stroke-width="12" opacity=".8"/>`;
  }

  const rings = [ringL, ringR]
    .map((p) => `<rect x="${p.x - 17}" y="${p.y - 30}" width="34" height="40" rx="12" fill="none" stroke="url(#hw)" stroke-width="7"/>`)
    .join("");

  const flap =
    flapH > 0
      ? `<path d="M${left} ${top + g.r} Q ${left} ${top} ${left + g.r} ${top} H ${right - g.r} Q ${right} ${top} ${right} ${top + g.r} V ${top + flapH - 18} Q ${right} ${top + flapH} ${right - 18} ${top + flapH} H ${left + 18} Q ${left} ${top + flapH} ${left} ${top + flapH - 18} Z" fill="url(#flap)"/>
${pattern ? `<path d="M${left} ${top + g.r} Q ${left} ${top} ${left + g.r} ${top} H ${right - g.r} Q ${right} ${top} ${right} ${top + g.r} V ${top + flapH - 18} Q ${right} ${top + flapH} ${right - 18} ${top + flapH} H ${left + 18} Q ${left} ${top + flapH} ${left} ${top + flapH - 18} Z" fill="url(#pat)"/>` : ""}
<path d="M${left + 16} ${top + g.r + 6} V ${top + flapH - 22} Q ${left + 16} ${top + flapH - 14} ${left + 26} ${top + flapH - 14} H ${right - 26} Q ${right - 16} ${top + flapH - 14} ${right - 16} ${top + flapH - 22} V ${top + g.r + 6}" fill="none" stroke="${stitch}" stroke-width="1.6" stroke-dasharray="8 7" opacity=".5"/>
<rect x="${left}" y="${top + flapH - 4}" width="${g.w}" height="10" fill="${edge}" opacity=".55"/>
<g>
  <rect x="${cx - 46}" y="${top + flapH - 40}" width="92" height="54" rx="10" fill="url(#hw)" stroke="${hw.c}" stroke-width="2"/>
  <rect x="${cx - 30}" y="${top + flapH - 27}" width="60" height="28" rx="5" fill="none" stroke="${hw.c}" stroke-width="2.5" opacity=".7"/>
</g>`
      : `<path d="M${left + 40} ${top + 90} H ${right - 40}" stroke="${edge}" stroke-width="4" opacity=".6"/>
<path d="M${left + 40} ${top + 96} H ${right - 40}" stroke="${stitch}" stroke-width="1.5" stroke-dasharray="8 7" opacity=".45"/>`;

  const body = `
<ellipse cx="${cx}" cy="${bottom + 26}" rx="${g.w * 0.56}" ry="34" fill="#000" opacity="${mood ? 0.6 : 0.28}" filter="url(#blur)"/>
${strap}
<rect x="${left}" y="${top}" width="${g.w}" height="${g.h}" rx="${g.r}" fill="url(#body)"/>
${pattern ? `<rect x="${left}" y="${top}" width="${g.w}" height="${g.h}" rx="${g.r}" fill="url(#pat)"/>` : ""}
<rect x="${left}" y="${top}" width="${g.w}" height="${g.h}" rx="${g.r}" fill="url(#sheen)"/>
<rect x="${left + 12}" y="${top + 12}" width="${g.w - 24}" height="${g.h - 24}" rx="${Math.max(8, g.r - 10)}" fill="none" stroke="${stitch}" stroke-width="1.6" stroke-dasharray="8 7" opacity=".45"/>
<rect x="${left}" y="${top}" width="${g.w}" height="${g.h}" rx="${g.r}" fill="none" stroke="${edge}" stroke-width="3"/>
${rings}
${flap}`;

  // Detail view crops tightly around the clasp.
  const vb =
    view === "detail"
      ? `${cx - 260} ${top + Math.max(flapH, 120) - 330} 520 650`
      : `0 0 ${W} ${H}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${vb}">
<defs>
  <radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient>
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${spec.body}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  <linearGradient id="flap" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${shade(spec.body, 0.22)}"/><stop offset=".6" stop-color="${spec.body}"/><stop offset="1" stop-color="${shade(spec.body, -0.3)}"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <linearGradient id="hw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hw.a}"/><stop offset=".5" stop-color="${hw.b}"/><stop offset="1" stop-color="${hw.c}"/></linearGradient>
  <filter id="blur" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="22"/></filter>
  ${pattern}
</defs>
<rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#bg)"/>
${mood ? `<ellipse cx="${cx}" cy="560" rx="520" ry="460" fill="#fff" opacity=".05" filter="url(#blur)"/>` : ""}
${body}
</svg>`;
}

/** Wide editorial hero composition with several bags. */
export function heroSvg(specs: BagSpec[]) {
  const inner = specs
    .slice(0, 3)
    .map((s, i) => {
      const svg = bagSvg(s, "mood").replace(/<rect x="-2000"[^>]*\/>/, "").replace(/<ellipse cx="600" cy="560"[^>]*\/>/, "");
      const scale = i === 1 ? 0.95 : 0.7;
      const x = [60, 690, 1400][i];
      const y = i === 1 ? 20 : 260;
      return `<g transform="translate(${x} ${y}) scale(${scale})">${svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/id="(\w+)"/g, `id="$1${i}"`).replace(/url\(#(\w+)\)/g, `url(#$1${i})`)}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1500" viewBox="0 0 2400 1500">
<defs><radialGradient id="hbg" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#23211e"/><stop offset=".6" stop-color="#121110"/><stop offset="1" stop-color="#080807"/></radialGradient>
<filter id="hblur"><feGaussianBlur stdDeviation="60"/></filter></defs>
<rect width="2400" height="1500" fill="url(#hbg)"/>
<ellipse cx="1250" cy="600" rx="700" ry="480" fill="#c9b48a" opacity=".06" filter="url(#hblur)"/>
${inner}
</svg>`;
}
