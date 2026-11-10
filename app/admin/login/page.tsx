"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="sheet" style={{ maxWidth: 460 }}>
      <div className="inner">
        <header className="masthead">
          <div className="brand">
            <div className="mark">Parah Mathematics</div>
            <h1 style={{ fontSize: 24 }}>관리자 로그인</h1>
            <div className="sub">Administrator</div>
          </div>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          <div className="field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="notice">{error}</div>}
          <div className="action" style={{ marginTop: 24 }}>
            <button type="submit" disabled={loading}>
              {loading ? "로그인 중…" : "로그인"}
            </button>
          </div>
        </form>

        <footer className="foot">
          <span className="fw">Parah Mathematics</span>
          <span>관리자 전용 · 대외비</span>
        </footer>
      </div>
    </div>
  );
}
