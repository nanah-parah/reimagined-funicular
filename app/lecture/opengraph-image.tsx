import { ImageResponse } from "next/og";

// 카카오톡 · 카페에 링크를 붙였을 때 보이는 공유 이미지. 빌드할 때 한 번 만든다.
export const alt = "중3 학부모 생기부 강의 · 11월 22일 (일)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const KICK = "parah maths · 중3 학부모";
const LINES = ["합격하는 생기부는", "어떻게 구성되며,", "어떻게 평가될까?"];
const META = "11월 22일 (일) · 오후 3시부터 5시까지 · 오후 6시부터 8시까지";

// 페이지와 같은 Gothic A1 을, 이미지에 쓰는 글자만 받아 온다.
async function gothic(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Gothic+A1:wght@${weight}&text=${encodeURIComponent(text)}`
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const [bold, regular] = await Promise.all([
    gothic(700, LINES.join("")),
    gothic(400, KICK + META),
  ]);
  const fonts = [
    ...(bold ? [{ name: "Gothic A1", data: bold, weight: 700 as const }] : []),
    ...(regular ? [{ name: "Gothic A1", data: regular, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#122840",
          color: "#F1EFE9",
          fontFamily: "Gothic A1",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#8FB5A9", marginBottom: 40 }}>
          {KICK}
        </div>
        {LINES.map((l) => (
          <div key={l} style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.28 }}>
            {l}
          </div>
        ))}
        <div style={{ width: 96, height: 3, background: "#2B7A6B", margin: "44px 0 28px" }} />
        <div style={{ fontSize: 28, color: "#9BA9BC" }}>{META}</div>
      </div>
    ),
    { ...size, fonts }
  );
}
