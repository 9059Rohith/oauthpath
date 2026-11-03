import { ImageResponse } from "next/og";
export const alt = "OAuthPath — Every app. A clear path to launch.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#090e13",
        color: "#f1f5f7",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "70px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 30,
          display: "flex",
          color: "#77e7cf",
          marginBottom: 70,
        }}
      >
        OAuthPath.
      </div>
      <div style={{ fontSize: 76, letterSpacing: -4, display: "flex" }}>
        Every app.
      </div>
      <div
        style={{
          fontSize: 76,
          letterSpacing: -4,
          color: "#77e7cf",
          display: "flex",
        }}
      >
        A clear path to launch.
      </div>
      <div
        style={{
          fontSize: 25,
          color: "#9aa9b6",
          marginTop: 40,
          display: "flex",
        }}
      >
        OAuth setup. Approval requirements. Evidence you can inspect.
      </div>
    </div>,
    size,
  );
}
