import React, { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { DeleteButton } from "@/components/DeleteButton";
import { type EventType, useMeCalendar } from "./store";

const COLORS = ["#e5534b", "#f2a65a", "#e4c84b", "#5bd18b", "#3ab0ff", "#7c6cff", "#d876e3", "#8b949e"];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const fieldClass =
    "rounded-lg border border-line/15 bg-raised/80 px-3 py-2 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30";

/** 이벤트 배지 (이모지 + 이름, 이벤트 색) */
export function EventBadge({
    t,
    note,
    small,
    active = true,
}: {
    t: EventType;
    /** 그 날 이벤트 내용 — 이름 뒤에 붙여 보여준다 */
    note?: string;
    small?: boolean;
    active?: boolean;
}) {
    return (
        <span
            className={`inline-flex max-w-full items-center gap-1 rounded-md border font-semibold leading-none ${
                small ? "px-1 py-[2px] text-[10px] sm:text-[11px]" : "px-2 py-1 text-xs"
            } ${active ? "" : "opacity-40 grayscale"}`}
            style={{ backgroundColor: `${t.color}26`, borderColor: `${t.color}66`, color: t.color }}
        >
            <span>{t.emoji}</span>
            <span className="truncate">
                {t.name}
                {note && <span className="font-normal opacity-90"> · {note}</span>}
            </span>
        </span>
    );
}

function EventForm({
    initial,
    submitLabel,
    onSubmit,
    onCancel,
}: {
    initial: Omit<EventType, "id">;
    submitLabel: string;
    onSubmit: (t: Omit<EventType, "id">) => void;
    onCancel: () => void;
}) {
    const [t, setT] = useState(initial);
    const valid = t.name.trim().length > 0;
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (valid) onSubmit({ ...t, name: t.name.trim(), emoji: t.emoji.trim() || "📌" });
            }}
            className="space-y-3 rounded-xl border border-line/10 bg-line/[0.03] p-3"
        >
            <div>
                <EventBadge t={{ ...t, id: "preview", name: t.name || "이벤트 이름" }} />
            </div>
            <div className="flex gap-2">
                <input
                    value={t.emoji}
                    onChange={(e) => setT((v) => ({ ...v, emoji: e.target.value }))}
                    aria-label="이모지"
                    maxLength={4}
                    className={`${fieldClass} w-14 text-center`}
                />
                <input
                    autoFocus
                    value={t.name}
                    onChange={(e) => setT((v) => ({ ...v, name: e.target.value }))}
                    placeholder="예: 쇼케이스"
                    aria-label="이름"
                    className={`${fieldClass} min-w-0 flex-1`}
                />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] text-muted">색</span>
                {COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        aria-label={c}
                        onClick={() => setT((v) => ({ ...v, color: c }))}
                        className={`h-5 w-5 rounded-md transition hover:scale-110 ${
                            t.color === c ? "ring-2 ring-content ring-offset-1 ring-offset-surface" : ""
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 text-[11px] text-muted">반복</span>
                <button
                    type="button"
                    onClick={() => setT((v) => ({ ...v, repeatDow: undefined }))}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                        t.repeatDow === undefined ? "bg-accent-strong text-white" : "bg-line/[0.06] text-muted hover:text-content"
                    }`}
                >
                    비정기
                </button>
                {DOW.map((d, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setT((v) => ({ ...v, repeatDow: i }))}
                        className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                            t.repeatDow === i ? "bg-accent-strong text-white" : "bg-line/[0.06] text-muted hover:text-content"
                        }`}
                    >
                        매주 {d}
                    </button>
                ))}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-line/15 bg-line/5 px-3 py-1.5 text-sm font-semibold text-muted hover:text-content"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={!valid}
                    className="rounded-lg bg-accent-strong px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent disabled:bg-raised disabled:text-faint"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

/** 고정 이벤트 관리 (추가·수정·삭제) */
export function EventManager({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { eventTypes, eventDays, addEventType, updateEventType, removeEventType } = useMeCalendar();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const markedDays = (id: string) => Object.values(eventDays).filter((marks) => marks.some((m) => m.id === id)).length;

    return (
        <Modal open={open} onClose={onClose} labelledBy="event-manager-title" className="max-w-lg">
            <header className="mb-1 flex items-center justify-between gap-3">
                <h2 id="event-manager-title" className="text-base font-bold text-content">
                    고정 이벤트
                </h2>
                <div className="flex items-center gap-2">
                    {!creating && (
                        <button
                            onClick={() => {
                                setCreating(true);
                                setEditing(null);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-accent-strong px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent"
                        >
                            <Plus size={15} /> 새 이벤트
                        </button>
                    )}
                    <button onClick={onClose} aria-label="닫기" className="rounded-lg p-1.5 text-muted hover:bg-line/10 hover:text-content">
                        <X size={18} />
                    </button>
                </div>
            </header>
            <p className="mb-4 text-xs text-muted">
                비정기 이벤트는 날짜를 고른 뒤 위쪽 칩으로 켜고, 매주 반복 이벤트는 그 요일에 자동으로 표시돼요.
            </p>

            {creating && (
                <div className="mb-3">
                    <EventForm
                        initial={{ name: "", emoji: "📌", color: COLORS[eventTypes.length % COLORS.length] }}
                        submitLabel="추가"
                        onCancel={() => setCreating(false)}
                        onSubmit={(t) => {
                            addEventType(t);
                            setCreating(false);
                        }}
                    />
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-line/10">
                {eventTypes.length === 0 && <p className="px-4 py-8 text-center text-sm text-faint">고정 이벤트가 없어요.</p>}
                {eventTypes.map((t) =>
                    editing === t.id ? (
                        <div key={t.id} className="border-b border-line/10 p-2 last:border-b-0">
                            <EventForm
                                initial={t}
                                submitLabel="저장"
                                onCancel={() => setEditing(null)}
                                onSubmit={(next) => {
                                    updateEventType(t.id, { ...next, repeatDow: next.repeatDow });
                                    setEditing(null);
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            key={t.id}
                            className="flex items-center gap-3 border-b border-line/10 px-4 py-2.5 last:border-b-0"
                        >
                            <EventBadge t={t} />
                            <span className="flex-1 text-xs text-muted">
                                {t.repeatDow === undefined
                                    ? `비정기 · ${markedDays(t.id)}일 표시`
                                    : `매주 ${DOW[t.repeatDow]}요일`}
                            </span>
                            <button
                                onClick={() => {
                                    setEditing(t.id);
                                    setCreating(false);
                                }}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-line/10 hover:text-content"
                            >
                                <Pencil size={12} /> 수정
                            </button>
                            <DeleteButton
                                iconOnly
                                label="이벤트 삭제"
                                title={`"${t.name}" 이벤트를 삭제할까요?`}
                                description={
                                    markedDays(t.id)
                                        ? `달력에 표시해 둔 ${markedDays(t.id)}일의 표시도 같이 지워져요.`
                                        : "고정 이벤트 목록에서 지워져요."
                                }
                                onConfirm={() => removeEventType(t.id)}
                            />
                        </div>
                    )
                )}
            </div>
        </Modal>
    );
}
