"use client";

import { useActionState } from "react";
import { saveSeminarMemo, type SeminarMemoState } from "@/app/admin/seminar/actions";

const initial: SeminarMemoState = { ok: false, message: "" };

export default function SeminarMemoForm({
  id,
  memo,
}: {
  id: string;
  memo: string;
}) {
  const [state, formAction, pending] = useActionState(saveSeminarMemo, initial);

  return (
    <form action={formAction} className="memo-form no-print">
      <input type="hidden" name="id" value={id} />
      <div className="memo-field">
        <label htmlFor="admin_memo">원장 메모</label>
        <textarea
          id="admin_memo"
          name="admin_memo"
          defaultValue={memo}
          rows={5}
          placeholder="강의 때 짚을 것, 개별 응대 메모 등"
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
