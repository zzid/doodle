import React, { useState } from "react";
import { sortTasks } from "./logic";
import { CheckCircle, TaskMeta } from "./TaskRow";
import { STATUS_LABEL, type Status, type Task } from "./types";

const COLUMNS: Status[] = ["todo", "doing", "done"];
const COLUMN_DOT: Record<Status, string> = { todo: "bg-muted", doing: "bg-good", done: "bg-accent" };

/** 칸반 보드. 카드를 다른 칸으로 끌어 놓으면 상태가 바뀐다 (데스크탑) */
export function BoardView({
    tasks,
    today,
    selectedId,
    onOpen,
    onToggle,
    onMove,
}: {
    tasks: Task[];
    today: string;
    selectedId: string | null;
    onOpen: (id: string) => void;
    onToggle: (id: string) => void;
    onMove: (id: string, status: Status) => void;
}) {
    const [over, setOver] = useState<Status | null>(null);

    return (
        <div className="grid gap-3 md:grid-cols-3">
            {COLUMNS.map((col) => {
                const items = tasks.filter((t) => t.status === col).sort(sortTasks);
                return (
                    <section
                        key={col}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOver(col);
                        }}
                        onDragLeave={() => setOver((o) => (o === col ? null : o))}
                        onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData("text/plain");
                            if (id) onMove(id, col);
                            setOver(null);
                        }}
                        className={`min-h-[160px] rounded-2xl border p-2.5 transition ${
                            over === col ? "border-accent/60 bg-accent/[0.06]" : "border-line/10 bg-line/[0.02]"
                        }`}
                    >
                        <header className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
                            <span className={`h-2 w-2 rounded-full ${COLUMN_DOT[col]}`} />
                            {STATUS_LABEL[col]}
                            <span className="text-faint">{items.length}</span>
                        </header>
                        <div className="space-y-2">
                            {items.map((t) => (
                                <div
                                    key={t.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("text/plain", t.id);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onClick={() => onOpen(t.id)}
                                    className={`flex cursor-grab items-start gap-2.5 rounded-xl border p-2.5 transition active:cursor-grabbing ${
                                        selectedId === t.id
                                            ? "border-accent/50 bg-accent/10"
                                            : "border-line/10 bg-surface hover:border-line/25"
                                    }`}
                                >
                                    <div className="pt-0.5">
                                        <CheckCircle task={t} onToggle={() => onToggle(t.id)} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div
                                            className={`text-sm ${
                                                t.status === "done" ? "text-faint line-through" : "text-content"
                                            }`}
                                        >
                                            {t.title}
                                        </div>
                                        <TaskMeta task={t} today={today} />
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="px-1 py-6 text-center text-xs text-faint">여기로 끌어다 놓기</p>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
