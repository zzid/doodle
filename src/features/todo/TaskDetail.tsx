import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { fastTransition } from "@/config/motion";
import { DeleteButton } from "@/components/DeleteButton";
import { DraftNumberInput, TimeSelect } from "@/features/overtime/inputs";
import { todayStr } from "./logic";
import { LabelPicker } from "./LabelPicker";
import { LabelPill } from "./LabelPill";
import { useTodoStore } from "./store";
import {
    PRIORITY_LABEL,
    RECURRENCE_LABEL,
    STATUS_LABEL,
    type Priority,
    type Recurrence,
    type Status,
    type Task,
    newId,
} from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-[11px] font-medium text-muted">{label}</div>
            {children}
        </div>
    );
}

function Segmented<T extends string | number>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
            {options.map((o) => (
                <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => onChange(o.value)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                        value === o.value ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

const inputClass =
    "w-full rounded-lg border border-line/15 bg-raised/80 px-3 py-2 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30";

/** 하위 할 일. Enter 로 다음 줄 추가, 빈 줄에서 Backspace 로 지우기 */
function Subtasks({ task }: { task: Task }) {
    const update = useTodoStore((s) => s.update);
    const refs = useRef<Record<string, HTMLInputElement | null>>({});
    const [draft, setDraft] = useState("");
    const set = (subtasks: Task["subtasks"]) => update(task.id, { subtasks });
    const done = task.subtasks.filter((s) => s.done).length;

    return (
        <Field label={`하위 할 일 ${task.subtasks.length ? `${done}/${task.subtasks.length}` : ""}`}>
            {task.subtasks.length > 0 && (
                <div className="mb-2 h-1 overflow-hidden rounded-full bg-line/10">
                    <div
                        className="h-full bg-good transition-[width] duration-base"
                        style={{ width: `${(done / task.subtasks.length) * 100}%` }}
                    />
                </div>
            )}
            <div className="space-y-1">
                {task.subtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={st.done}
                            onChange={() =>
                                set(task.subtasks.map((x) => (x.id === st.id ? { ...x, done: !x.done } : x)))
                            }
                            className="h-4 w-4 shrink-0 accent-[rgb(var(--c-good))]"
                        />
                        <input
                            ref={(el) => {
                                refs.current[st.id] = el;
                            }}
                            value={st.title}
                            onChange={(e) =>
                                set(task.subtasks.map((x) => (x.id === st.id ? { ...x, title: e.target.value } : x)))
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Backspace" && st.title === "") {
                                    e.preventDefault();
                                    set(task.subtasks.filter((x) => x.id !== st.id));
                                    const prev = task.subtasks[i - 1];
                                    if (prev) setTimeout(() => refs.current[prev.id]?.focus());
                                }
                            }}
                            className={`min-w-0 flex-1 bg-transparent py-1 text-sm outline-none ${
                                st.done ? "text-faint line-through" : "text-content"
                            }`}
                        />
                    </div>
                ))}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!draft.trim()) return;
                        set([...task.subtasks, { id: newId(), title: draft.trim(), done: false }]);
                        setDraft("");
                    }}
                    className="flex items-center gap-2"
                >
                    <Plus size={16} className="shrink-0 text-faint" />
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="하위 할 일 추가 (Enter)"
                        className="min-w-0 flex-1 bg-transparent py-1 text-sm text-content outline-none placeholder:text-faint"
                    />
                </form>
            </div>
            {task.subtasks.length > 0 && (
                <p className="mt-1 text-[10px] text-faint">빈 줄에서 Backspace 를 누르면 지워져요.</p>
            )}
        </Field>
    );
}

function DetailBody({
    task,
    onClose,
    onManageLabels,
}: {
    task: Task;
    onClose: () => void;
    onManageLabels: () => void;
}) {
    const { update, setStatus, remove } = useTodoStore();
    const patch = (p: Partial<Task>) => update(task.id, p);

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-line/10 px-4 py-3">
                <span className="text-xs text-faint">
                    {new Date(task.createdAt).toLocaleDateString("ko-KR")} 만듦
                </span>
                <button
                    onClick={onClose}
                    aria-label="닫기"
                    className="rounded-lg p-1.5 text-muted transition hover:bg-line/10 hover:text-content"
                >
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <textarea
                    value={task.title}
                    onChange={(e) => patch({ title: e.target.value.replace(/\n/g, " ") })}
                    rows={2}
                    className="w-full resize-none bg-transparent text-lg font-bold text-content outline-none"
                />

                <Field label="상태">
                    <Segmented<Status>
                        value={task.status}
                        onChange={(s) => setStatus(task.id, s)}
                        options={(["todo", "doing", "done"] as Status[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                    />
                </Field>

                <Field label="우선순위">
                    <Segmented<Priority>
                        value={task.priority}
                        onChange={(priority) => patch({ priority })}
                        options={([0, 1, 2, 3] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="마감일">
                        <input
                            type="date"
                            value={task.due ?? ""}
                            onChange={(e) => patch({ due: e.target.value || undefined })}
                            className={`${inputClass} [color-scheme:dark]`}
                        />
                    </Field>
                    <Field label="반복">
                        <select
                            value={task.recurrence ?? ""}
                            onChange={(e) => patch({ recurrence: (e.target.value || undefined) as Recurrence | undefined })}
                            className={inputClass}
                        >
                            <option value="">반복 안 함</option>
                            {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                                <option key={r} value={r}>
                                    {RECURRENCE_LABEL[r]}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="시각">
                        {task.time ? (
                            <div className="flex items-center gap-1.5">
                                <TimeSelect value={task.time} onChange={(time) => patch({ time })} minuteStep={5} />
                                <button
                                    onClick={() => patch({ time: undefined })}
                                    aria-label="시각 지우기"
                                    className="text-faint hover:text-content"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => patch({ time: "09:00", due: task.due ?? todayStr() })}
                                className="rounded-lg border border-dashed border-line/20 px-3 py-2 text-xs text-muted hover:border-accent/50 hover:text-accent"
                            >
                                + 시각 정하기
                            </button>
                        )}
                    </Field>
                    <Field label="예상 시간(분)">
                        <DraftNumberInput
                            min={0}
                            step={5}
                            value={task.estimateMin ?? 0}
                            onChange={(v) => patch({ estimateMin: v > 0 ? Math.round(v) : undefined })}
                            className="w-full"
                        />
                    </Field>
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted">라벨</span>
                        <LabelPicker
                            selected={task.tags}
                            onChange={(tags) => patch({ tags })}
                            onManage={onManageLabels}
                        />
                    </div>
                    <div className="flex min-h-[28px] flex-wrap items-center gap-1.5">
                        {task.tags.length ? (
                            task.tags.map((t) => (
                                <LabelPill
                                    key={t}
                                    name={t}
                                    size="md"
                                    onRemove={() => patch({ tags: task.tags.filter((x) => x !== t) })}
                                />
                            ))
                        ) : (
                            <span className="text-xs text-faint">없음</span>
                        )}
                    </div>
                </div>

                <Subtasks task={task} />

                <Field label="메모">
                    <textarea
                        value={task.notes}
                        onChange={(e) => patch({ notes: e.target.value })}
                        rows={5}
                        placeholder="자세한 내용, 링크, 참고 사항…"
                        className={`${inputClass} resize-y`}
                    />
                </Field>
            </div>

            <footer className="border-t border-line/10 p-3">
                <DeleteButton
                    className="w-full"
                    label="할 일 삭제"
                    title={`"${task.title}"을 삭제할까요?`}
                    description={
                        task.subtasks.length ? `하위 할 일 ${task.subtasks.length}개도 같이 삭제돼요.` : "이 할 일이 삭제돼요."
                    }
                    onConfirm={() => {
                        remove(task.id);
                        onClose();
                    }}
                />
            </footer>
        </div>
    );
}

/** 오른쪽에서 열리는 상세 패널 */
export function TaskDetail({
    task,
    onClose,
    onManageLabels,
}: {
    task: Task | null;
    onClose: () => void;
    onManageLabels: () => void;
}) {
    return createPortal(
        <AnimatePresence>
            {task && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-[55] bg-black/40 lg:bg-black/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={fastTransition}
                        onClick={onClose}
                    />
                    <motion.aside
                        key="panel"
                        role="dialog"
                        aria-label="할 일 상세"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-y-0 right-0 z-[60] w-[min(420px,100vw)] border-l border-line/10 bg-surface shadow-2xl shadow-black/50"
                    >
                        <DetailBody key={task.id} task={task} onClose={onClose} onManageLabels={onManageLabels} />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
