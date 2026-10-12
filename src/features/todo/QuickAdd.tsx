import React, { forwardRef, useState } from "react";
import { LabelPill } from "./LabelPill";
import { useTodoStore } from "./store";
import { CalendarDays, Clock, Flag, Hash, Plus, Repeat, Timer } from "lucide-react";
import { dayjs } from "@/dayjs/dayjs";
import { parseQuickAdd, type Parsed } from "./parse";
import { RECURRENCE_LABEL } from "./types";
import { fmtEstimate } from "./logic";

const CHIP_ICON: Record<Parsed["tokens"][number]["kind"], React.ReactNode> = {
    date: <CalendarDays size={12} />,
    time: <Clock size={12} />,
    priority: <Flag size={12} />,
    tag: <Hash size={12} />,
    estimate: <Timer size={12} />,
    recurrence: <Repeat size={12} />,
};

/** 인식 결과를 사람이 읽는 말로 */
function describe(p: Parsed) {
    const parts: string[] = [];
    if (p.due) {
        const d = dayjs(p.due);
        parts.push(`${d.format("M월 D일")} (${["일", "월", "화", "수", "목", "금", "토"][d.day()]})`);
    }
    if (p.time) parts.push(p.time);
    if (p.priority) parts.push(`우선순위 ${["", "낮음", "중간", "높음"][p.priority]}`);
    if (p.estimateMin) parts.push(`예상 ${fmtEstimate(p.estimateMin)}`);
    if (p.recurrence) parts.push(RECURRENCE_LABEL[p.recurrence]);
    return parts;
}

export const QuickAdd = forwardRef<HTMLInputElement, { onAdd: (p: Parsed) => void }>(function QuickAdd(
    { onAdd },
    ref
) {
    const [value, setValue] = useState("");
    const [caret, setCaret] = useState(0);
    const [active, setActive] = useState(0);
    const labels = useTodoStore((st) => st.labels);
    const parsed = value.trim() ? parseQuickAdd(value) : null;

    // 커서 바로 앞이 "#글자" 면 라벨 자동완성
    const hashMatch = value.slice(0, caret).match(/(?:^|\s)#([^\s#]*)$/);
    const partial = hashMatch ? hashMatch[1].toLowerCase() : null;
    const suggestions =
        partial === null
            ? []
            : labels
                  .filter((l) => l.name.toLowerCase().includes(partial))
                  .sort((a, b) => Number(!a.name.toLowerCase().startsWith(partial)) - Number(!b.name.toLowerCase().startsWith(partial)))
                  .slice(0, 6);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? null;

    const pick = (name: string) => {
        const before = value.slice(0, caret).replace(/#([^\s#]*)$/, `#${name} `);
        const next = before + value.slice(caret).replace(/^\S*/, "").replace(/^\s+/, "");
        setValue(next);
        setActive(0);
        const pos = before.length;
        setCaret(pos);
        requestAnimationFrame(() => {
            inputRef?.current?.setSelectionRange(pos, pos);
            inputRef?.current?.focus();
        });
    };

    const submit = () => {
        if (!parsed?.title) return;
        onAdd(parsed);
        setValue("");
    };

    return (
        <div className="rounded-2xl border border-line/10 bg-surface/70 p-3 shadow-lg shadow-black/30 backdrop-blur sm:p-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                className="flex items-center gap-2"
            >
                <div className="relative min-w-0 flex-1">
                <input
                    ref={ref}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setCaret(e.target.selectionStart ?? e.target.value.length);
                        setActive(0);
                    }}
                    onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
                    onKeyDown={(e) => {
                        if (!suggestions.length) return;
                        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length);
                        } else if (e.key === "Enter" || e.key === "Tab") {
                            e.preventDefault();
                            pick(suggestions[active].name);
                        }
                    }}
                    placeholder="할 일 추가…  예) 내일 오후 3시 회의 준비 #업무 !높음 ~30m"
                    className="w-full rounded-lg border border-line/15 bg-raised/80 px-3 py-2.5 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                {suggestions.length > 0 && (
                    <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-72 overflow-hidden rounded-xl border border-line/15 bg-surface py-1 shadow-2xl shadow-black/60">
                        <div className="px-3 pb-1 pt-1.5 text-[10px] text-faint">라벨 · ↑↓ 이동 · Enter 선택</div>
                        {suggestions.map((l, i) => (
                            <button
                                key={l.name}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    pick(l.name);
                                }}
                                onMouseEnter={() => setActive(i)}
                                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
                                    i === active ? "bg-line/[0.08]" : ""
                                }`}
                            >
                                <LabelPill name={l.name} />
                                {l.description && <span className="truncate text-xs text-faint">{l.description}</span>}
                            </button>
                        ))}
                    </div>
                )}
                </div>
                <button
                    type="submit"
                    disabled={!parsed?.title}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-accent-strong px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-accent disabled:bg-raised disabled:text-faint"
                >
                    <Plus size={16} /> 추가
                </button>
            </form>

            {parsed && (parsed.tokens.length > 0 || parsed.title) ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-content">{parsed.title || "(제목 없음)"}</span>
                    {parsed.tokens.map((t, i) =>
                        t.kind === "tag" ? (
                            <span key={i} className="flex items-center gap-1">
                                <LabelPill name={t.label.slice(1)} />
                                {!labels.some((l) => l.name === t.label.slice(1)) && (
                                    <span className="text-[10px] text-faint">새 라벨</span>
                                )}
                            </span>
                        ) : (
                            <span
                                key={i}
                                className="flex items-center gap-1 rounded-md bg-accent/15 px-1.5 py-0.5 font-medium text-accent"
                            >
                                {CHIP_ICON[t.kind]}
                                {t.label}
                            </span>
                        )
                    )}
                    {describe(parsed).length > 0 && (
                        <span className="text-faint">→ {describe(parsed).join(" · ")}</span>
                    )}
                </div>
            ) : (
                <p className="mt-2.5 text-[11px] leading-relaxed text-faint">
                    날짜 <b className="text-muted">오늘·내일·금요일·다음주 월·10/20·3일 후</b> · 시간{" "}
                    <b className="text-muted">오후 3시·15:30</b> · 라벨 <b className="text-muted">#업무</b> · 우선순위{" "}
                    <b className="text-muted">!높음 !2 !!!</b> · 예상 <b className="text-muted">~30m ~1h</b> · 반복{" "}
                    <b className="text-muted">매일·평일·매주·매달</b>
                    <span className="ml-2 hidden sm:inline">
                        단축키 <kbd className="rounded border border-line/20 px-1">N</kbd> 입력{" "}
                        <kbd className="rounded border border-line/20 px-1">/</kbd> 검색
                    </span>
                </p>
            )}
        </div>
    );
});
