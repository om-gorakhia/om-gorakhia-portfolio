import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "om.sys — Operator Console";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#05060A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: "16px",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "12px",
          }}
        />

        {/* Top label */}
        <div
          style={{
            fontSize: "14px",
            color: "rgba(168,85,247,0.6)",
            letterSpacing: "6px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          sys.operator.identify
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#F0EAFF",
            letterSpacing: "-1px",
            marginBottom: "16px",
          }}
        >
          Om Gorakhia
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(240,234,255,0.6)",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          I turn messy data into systems that decide.
        </div>

        {/* Domain label */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "14px",
            color: "rgba(168,85,247,0.5)",
            letterSpacing: "3px",
          }}
        >
          om-sys.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
