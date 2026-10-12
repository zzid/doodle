import React from "react";
import { Check, ListChecks, NotebookText, Repeat, Timer } from "lucide-react";
import { dueLabel, fmtEstimate } from "./logic";
import { LabelPill } from "./LabelPill";
import type { Priority, Task } from "./types";

const PRIORITY_RING: Record<Priority, string> = {
    0: "border-line/30",
    1: "border-sky-400/80",
    2: "border-warn/90",
    3: "border-danger",
};
const PRIORITY_FILL: Record<Priority, string> = {
    0: "bg-line/30",
    1: "bg-sky-400",
    2: "bg-warn",
    3: "bg-danger",
};

/** 우선순위 색 테두리의 완료 체크 원 */
export function CheckCircle({ task, onToggle }: { task: Task; onToggle: () => void }) {
    const done = task.status === "done";
    return (
        <button
            type="button"
            aria-label={done ? "완료 취소" : "완료"}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={`group/check flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                done ? `${PRIORITY_FILL[task.priority]} border-transparent` : `${PRIORITY_RING[task.priority]} hover:bg-line/10`
            }`}
        >
            <Check
                size={12}
                strokeWidth={3}
                className={`text-bg transition ${done ? "opacity-100" : "text-faint opacity-0 group-hover/check:opacity-100"}`}
            />
        </button>
    );
}

/** 제목 아래 붙는 메타 정보 (마감, 하위 할 일, 예상, 반복, 태그) */
export function TaskMeta({ task, today }: { task: Task; today: string }) {
    const due = dueLabel(task, today);
    const doneSubs = task.subtasks.filter((s) => s.done).length;
    const items: React.ReactNode[] = [];
    if (due)
        items.push(
            <span
                key="due"
                className={
                    due.tone === "danger" ? "font-semibold text-danger" : due.tone === "accent" ? "text-accent" : ""
                }
            >
                {due.text}
            </span>
        );
    if (task.subtasks.length)
        items.push(
            <span key="sub" className="flex items-center gap-0.5">
                <ListChecks size={12} /> {doneSubs}/{task.subtasks.length}
            </span>
        );
    if (task.estimateMin)
        items.push(
            <span key="est" className="flex items-center gap-0.5">
                <Timer size={12} /> {fmtEstimate(task.estimateMin)}
            </span>
        );
    if (task.recurrence) items.push(<Repeat key="rec" size={12} aria-label="반복" />);
    if (task.notes) items.push(<NotebookText key="note" size={12} aria-label="메모 있음" />);
    task.tags.forEach((t) => items.push(<LabelPill key={`t-${t}`} name={t} />));
    if (!items.length) return null;
    return <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-faint">{items}</div>;
}

export function TaskRow({
    task,
    today,
    selected,
    onOpen,
    onToggle,
}: {
    task: Task;
    today: string;
    selected: boolean;
    onOpen: () => void;
    onToggle: () => void;
}) {
    const done = task.status === "done";
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => e.key === "Enter" && onOpen()}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                selected ? "border-accent/50 bg-accent/10" : "border-transparent hover:bg-line/[0.05]"
            }`}
        >
            <div className="pt-0.5">
                <CheckCircle task={task} onToggle={onToggle} />
            </div>
            <div className="min-w-0 flex-1">
                <div className={`text-sm ${done ? "text-faint line-through" : "text-content"}`}>
                    {task.status === "doing" && (
                        <span className="mr-1.5 rounded bg-good/15 px-1 py-px text-[10px] font-semibold text-good">
                            진행 중
                        </span>
                    )}
                    {task.title}
                </div>
                <TaskMeta task={task} today={today} />
            </div>
        </div>
    );
}
