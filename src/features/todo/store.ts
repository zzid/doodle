import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nextDue } from "./logic";
import type { Parsed } from "./parse";
import { type Label, nextPreset } from "./labels";
import { type Status, type Task, newId } from "./types";

interface TodoState {
    tasks: Task[];
    /** 라벨 목록. 할 일에 처음 쓰이면 자동 등록, 관리 창에서 직접 만들 수도 있다 */
    labels: Label[];
    createLabel: (label: Label) => void;
    /** 이름을 바꾸면 그 라벨이 붙은 할 일도 같이 바꾼다 */
    updateLabel: (name: string, patch: Partial<Label>) => void;
    /** 라벨 삭제 — 할 일에서도 빠진다 */
    deleteLabel: (name: string) => void;
    add: (p: Parsed) => string;
    update: (id: string, patch: Partial<Task>) => void;
    /** 상태 변경. 반복 일정을 완료하면 다음 회차를 새로 만든다 */
    setStatus: (id: string, status: Status) => void;
    toggleDone: (id: string) => void;
    remove: (id: string) => void;
    clearDone: () => void;
}

export const useTodoStore = create<TodoState>()(
    persist(
        (set, get) => {
            /** 처음 보는 라벨을 목록에 등록 */
            const registerTags = (names: string[]) => {
                const labels = [...get().labels];
                let changed = false;
                for (const n of names) {
                    if (!n || labels.some((l) => l.name === n)) continue;
                    labels.push({ name: n, color: nextPreset(labels.map((l) => l.color)), description: "" });
                    changed = true;
                }
                if (changed) set({ labels });
            };

            return {
            tasks: [],
            labels: [],
            createLabel: (label) =>
                set((s) => (s.labels.some((l) => l.name === label.name) ? s : { labels: [...s.labels, label] })),
            updateLabel: (name, patch) =>
                set((s) => {
                    const rename = patch.name && patch.name !== name ? patch.name : null;
                    if (rename && s.labels.some((l) => l.name === rename)) return s; // 이름 중복
                    return {
                        labels: s.labels.map((l) => (l.name === name ? { ...l, ...patch } : l)),
                        tasks: rename
                            ? s.tasks.map((t) =>
                                  t.tags.includes(name) ? { ...t, tags: t.tags.map((x) => (x === name ? rename : x)) } : t
                              )
                            : s.tasks,
                    };
                }),
            deleteLabel: (name) =>
                set((s) => ({
                    labels: s.labels.filter((l) => l.name !== name),
                    tasks: s.tasks.map((t) => (t.tags.includes(name) ? { ...t, tags: t.tags.filter((x) => x !== name) } : t)),
                })),
            add: (p) => {
                registerTags(p.tags);
                const id = newId();
                const order = Math.max(0, ...get().tasks.map((t) => t.order)) + 1;
                set((s) => ({
                    tasks: [
                        ...s.tasks,
                        {
                            id,
                            title: p.title,
                            notes: "",
                            status: "todo",
                            priority: p.priority,
                            due: p.due,
                            time: p.time,
                            tags: p.tags,
                            estimateMin: p.estimateMin,
                            subtasks: [],
                            recurrence: p.recurrence,
                            createdAt: Date.now(),
                            order,
                        },
                    ],
                }));
                return id;
            },
            update: (id, patch) => {
                if (patch.tags) registerTags(patch.tags);
                set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
            },
            setStatus: (id, status) =>
                set((s) => {
                    const t = s.tasks.find((x) => x.id === id);
                    if (!t || t.status === status) return s;
                    const tasks = s.tasks.map((x) =>
                        x.id === id
                            ? { ...x, status, completedAt: status === "done" ? Date.now() : undefined }
                            : x
                    );
                    // 반복: 완료하면 다음 회차 (하위 할 일은 체크 해제해서 복사)
                    if (status === "done" && t.recurrence) {
                        tasks.push({
                            ...t,
                            id: newId(),
                            status: "todo",
                            due: nextDue(t.due, t.recurrence),
                            subtasks: t.subtasks.map((st) => ({ ...st, id: newId(), done: false })),
                            createdAt: Date.now(),
                            completedAt: undefined,
                        });
                        // 완료된 회차는 더 이상 반복하지 않는다
                        const done = tasks.find((x) => x.id === id)!;
                        done.recurrence = undefined;
                    }
                    return { tasks };
                }),
            toggleDone: (id) => {
                const t = get().tasks.find((x) => x.id === id);
                if (t) get().setStatus(id, t.status === "done" ? "todo" : "done");
            },
            remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
            clearDone: () => set((s) => ({ tasks: s.tasks.filter((t) => t.status !== "done") })),
            };
        },
        { name: "doodle-todo" }
    )
);
