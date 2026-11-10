"use client";

import Link from "next/link";
import { deleteSubmission } from "@/app/admin/submissions/actions";

export default function DetailActions({ id }: { id: string }) {
  return (
    <div className="detail-bar no-print">
      <Link href="/admin" className="back-link">
        ← 목록으로
      </Link>
      <div className="detail-bar-right">
        <button type="button" className="ghost-btn" onClick={() => window.print()}>
          인쇄 / PDF 저장
        </button>
        <form
          action={deleteSubmission}
          onSubmit={(e) => {
            if (!confirm("이 응답을 삭제할까요? 되돌릴 수 없습니다.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="danger-btn">
            삭제
          </button>
        </form>
      </div>
    </div>
  );
}
