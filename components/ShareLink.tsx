"use client";

import { useEffect, useState } from "react";

// 공용 작성 링크(사이트 루트 /)를 보여주고 복사하는 도구.
export default function ShareLink() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + "/");
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드 차단 시 무시 — 사용자가 직접 선택 복사 */
    }
  }

  return (
    <div className="sharelink">
      <span className="sharelink-label">공용 작성 링크</span>
      <code className="sharelink-url">{url || "…"}</code>
      <button type="button" className="ghost-btn" onClick={copy}>
        {copied ? "복사됨" : "링크 복사"}
      </button>
    </div>
  );
}
