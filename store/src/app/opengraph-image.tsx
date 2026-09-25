import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const alt = "Premium men's bags";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const s = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 40%, #23211e, #0b0b0a 70%)",
          color: "#f2eee8",
        }}
      >
        <div style={{ fontSize: 96, letterSpacing: 24, fontFamily: "serif" }}>{s.storeName}</div>
        <div style={{ width: 120, height: 1, background: "#b89b6a", margin: "36px 0" }} />
        <div style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#a39e96" }}>{s.tagline}</div>
      </div>
    ),
    size,
  );
}
