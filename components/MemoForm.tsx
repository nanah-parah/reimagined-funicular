"use client";

import { useActionState } from "react";
import { saveMemo, type MemoState } from "@/app/admin/submissions/actions";

const initial: MemoState = { ok: false, message: "" };

export default function MemoForm({
  id,
  memo,
  recommendation,
}: {
  id: string;
  memo: string;
  recommendation: string;
}) {
  const [state, formAction, pending] = useActionState(saveMemo, initial);

  return (
    <form action={formAction} className="memo-form no-print">
      <input type="hidden" name="id" value={id} />
      <div className="memo-field">
        <label htmlFor="recommendation">권장 수업 방향</label>
        <textarea
          id="recommendation"
          name="recommendation"
          defaultValue={recommendation}
          rows={3}
          placeholder="예) 현행 강화 후 단계적 선행. 오답 정리 루틴부터 함께 설계."
        />
      </div>
      <div className="memo-field">
        <label htmlFor="admin_memo">원장 메모</label>
        <textarea
          id="admin_memo"
          name="admin_memo"
          defaultValue={memo}
          rows={5}
          placeholder="상담 메모, 반 배정 소견 등"
        />
      </div>
      <div className="memo-actions">
        <button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "메모 저장"}
        </button>
        {state.message && (
          <span className={state.ok ? "memo-ok" : "memo-err"}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
