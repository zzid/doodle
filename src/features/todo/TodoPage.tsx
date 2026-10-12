"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarCheck,
    CalendarClock,
    CircleAlert,
    Inbox,
    KanbanSquare,
    List,
    Search,
    Settings2,
    SquareCheckBig,
} from "lucide-react";
import { Panel } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/features/overtime/DeleteButton";
import { BoardView } from "./BoardView";
import { QuickAdd } from "./QuickAdd";
import { TaskDetail } from "./TaskDetail";
import { TaskRow } from "./TaskRow";
import { LabelManager } from "./LabelManager";
import { LabelPill } from "./LabelPill";
import { type SmartView, VIEW_LABEL, fmtEstimate, groupByDue, inView, todayStr } from "./logic";
import { useTodoStore } from "./store";

const VIEW_ICON: Record<SmartView, React.ReactNode> = {
    today: <CalendarCheck size={15} />,
    upcoming: <CalendarClock size={15} />,
    overdue: <CircleAlert size={15} />,
    all: <Inbox size={15} />,
    done: <SquareCheckBig size={15} />,
};
const VIEWS: SmartView[] = ["today", "upcoming", "overdue", "all", "done"];

type Layout = "list" | "board";

/** 입력 중이 아닐 때만 단축키 */
const isTyping = (el: EventTarget | null) =>
    el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export default function TodoPage() {
    const { tasks, labels, add, toggleDone, setStatus, clearDone } = useTodoStore();
    const [labelsOpen, setLabelsOpen] = useState(false);
    const [view, setView] = useState<SmartView>("today");
    const [layout, setLayout] = useState<Layout>("list");
    const [tag, setTag] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const addRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const today = todayStr();

    // 단축키: N 새 할 일, / 검색, Esc 상세 닫기
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isTyping(e.target)) (e.target as HTMLElement).blur();
                else setSelectedId(null);
                return;
            }
            if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === "n" || e.key === "N" || e.key === "ㅜ") {
                e.preventDefault();
                addRef.current?.focus();
            } else if (e.key === "/") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // 걸러 보던 라벨이 이름이 바뀌거나 지워지면 필터 해제
    useEffect(() => {
        if (tag && !labels.some((l) => l.name === tag)) setTag(null);
    }, [labels, tag]);

    // 라벨별 남은 할 일 수
    const labelCounts = useMemo(() => {
        const m: Record<string, number> = {};
        for (const t of tasks) if (t.status !== "done") for (const x of t.tags) m[x] = (m[x] ?? 0) + 1;
        return m;
    }, [tasks]);

    // 검색·태그 필터 (스마트 뷰와 별개로 항상 적용)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tasks.filter(
            (t) =>
                (!tag || t.tags.includes(tag)) &&
                (!q ||
                    t.title.toLowerCase().includes(q) ||
                    t.notes.toLowerCase().includes(q) ||
                    t.tags.some((x) => x.toLowerCase().includes(q)) ||
                    t.subtasks.some((s) => s.title.toLowerCase().includes(q)))
        );
    }, [tasks, tag, query]);

    const counts = useMemo(
        () => Object.fromEntries(VIEWS.map((v) => [v, tasks.filter((t) => inView(t, v, today)).length])),
        [tasks, today]
    ) as Record<SmartView, number>;

    const visible = filtered.filter((t) => inView(t, view, today));
    const groups = groupByDue(visible, today);
    const selected = tasks.find((t) => t.id === selectedId) ?? null;

    const todayOpen = tasks.filter((t) => inView(t, "today", today));
    const todayEstimate = todayOpen.reduce((s, t) => s + (t.estimateMin ?? 0), 0);
    const doneToday = tasks.filter(
        (t) => t.status === "done" && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()
    ).length;

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">할 일</h1>
                    <p className="mt-1 text-sm text-muted">
                        오늘 남은 일 <b className="text-content">{todayOpen.length}개</b>
                        {todayEstimate > 0 && <> · 예상 {fmtEstimate(todayEstimate)}</>}
                        {doneToday > 0 && <> · 오늘 {doneToday}개 완료 🎉</>}
                    </p>
                </div>
            </header>

            <QuickAdd
                ref={addRef}
                onAdd={(p) => {
                    add(p);
                    // 새 할 일이 지금 보는 뷰에 안 보이면, 보이는 뷰로 옮겨준다
                    if (view !== "all") {
                        const target: SmartView = !p.due ? "all" : p.due <= today ? "today" : "upcoming";
                        if (target !== view) setView(target);
                    }
                }}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* 사이드바: 스마트 뷰 + 태그 */}
                <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-4 lg:overflow-visible lg:pb-0">
                    <div className="flex gap-1 lg:block lg:space-y-0.5">
                        {VIEWS.map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition lg:w-full ${
                                    view === v ? "bg-accent/15 text-accent" : "text-muted hover:bg-line/[0.06] hover:text-content"
                                }`}
                            >
                                {VIEW_ICON[v]}
                                {VIEW_LABEL[v]}
                                {counts[v] > 0 && (
                                    <span
                                        className={`ml-auto pl-2 text-xs tabular-nums ${
                                            v === "overdue" ? "font-semibold text-danger" : "text-faint"
                                        }`}
                                    >
                                        {counts[v]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    {/* 라벨 목록 */}
                    <div className="flex items-center gap-1 border-l border-line/10 pl-2 lg:block lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
                        <div className="hidden items-center justify-between px-3 pb-1.5 lg:flex">
                            <span className="text-[11px] font-medium text-faint">라벨</span>
                            <button
                                onClick={() => setLabelsOpen(true)}
                                className="flex items-center gap-1 rounded px-1 text-[11px] text-faint transition hover:text-content"
                            >
                                <Settings2 size={12} /> 관리
                            </button>
                        </div>
                        <div className="flex gap-1 lg:block lg:space-y-0.5">
                            {labels.map((l) => (
                                <button
                                    key={l.name}
                                    onClick={() => setTag(tag === l.name ? null : l.name)}
                                    title={l.description || undefined}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left transition lg:w-full ${
                                        tag === l.name ? "bg-line/10" : "hover:bg-line/[0.06]"
                                    }`}
                                >
                                    <LabelPill name={l.name} />
                                    {labelCounts[l.name] ? (
                                        <span className="ml-auto pl-1 text-xs tabular-nums text-faint">
                                            {labelCounts[l.name]}
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                            {labels.length === 0 && (
                                <p className="hidden px-3 text-[11px] leading-relaxed text-faint lg:block">
                                    할 일에 <b className="text-muted">#라벨</b>을 쓰거나 관리에서 만들어요.
                                </p>
                            )}
                            <button
                                onClick={() => setLabelsOpen(true)}
                                className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted transition hover:bg-line/[0.06] hover:text-content lg:hidden"
                            >
                                라벨 관리
                            </button>
                        </div>
                    </div>
                </nav>

                {/* 본문 */}
                <Panel className="min-w-0 p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <div className="relative min-w-[160px] flex-1">
                            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="검색 (제목·메모·라벨·하위 할 일)"
                                className="w-full rounded-lg border border-line/15 bg-raised/80 py-1.5 pl-8 pr-3 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                            />
                        </div>
                        {tag && <LabelPill name={tag} size="md" onRemove={() => setTag(null)} />}
                        <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                            {(
                                [
                                    ["list", <List key="l" size={14} />, "목록"],
                                    ["board", <KanbanSquare key="b" size={14} />, "보드"],
                                ] as const
                            ).map(([v, icon, label]) => (
                                <button
                                    key={v}
                                    onClick={() => setLayout(v)}
                                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                        layout === v ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                    }`}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {layout === "board" ? (
                        <>
                            <p className="mb-2 text-[11px] text-faint">
                                보드는 스마트 뷰와 상관없이 {tag || query ? "필터에 맞는" : "모든"} 할 일을 상태별로 보여줘요.
                                카드를 끌어서 옮겨 보세요.
                            </p>
                            <BoardView
                                tasks={filtered}
                                today={today}
                                selectedId={selectedId}
                                onOpen={setSelectedId}
                                onToggle={toggleDone}
                                onMove={setStatus}
                            />
                        </>
                    ) : groups.length === 0 ? (
                        <div className="py-16 text-center text-sm text-faint">
                            {query || tag
                                ? "조건에 맞는 할 일이 없어요."
                                : view === "today"
                                  ? "오늘 할 일이 없어요. 위에 입력해서 추가해 보세요."
                                  : `${VIEW_LABEL[view]} 할 일이 없어요.`}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {groups.map((g) => (
                                <section key={g.key}>
                                    <h2
                                        className={`mb-1 flex items-center gap-2 px-3 text-xs font-semibold ${
                                            g.tone === "danger" ? "text-danger" : g.tone === "accent" ? "text-accent" : "text-faint"
                                        }`}
                                    >
                                        {g.label}
                                        <span className="font-normal text-faint">{g.tasks.length}</span>
                                    </h2>
                                    <div className="space-y-0.5">
                                        {g.tasks.map((t) => (
                                            <TaskRow
                                                key={t.id}
                                                task={t}
                                                today={today}
                                                selected={t.id === selectedId}
                                                onOpen={() => setSelectedId(t.id)}
                                                onToggle={() => toggleDone(t.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    {view === "done" && layout === "list" && counts.done > 0 && (
                        <div className="mt-4 flex justify-end border-t border-line/10 pt-3">
                            <DeleteButton
                                label="완료한 할 일 비우기"
                                title={`완료한 할 일 ${counts.done}개를 삭제할까요?`}
                                description="완료 목록이 비워져요. 진행 중이거나 남은 할 일은 그대로예요."
                                onConfirm={clearDone}
                            />
                        </div>
                    )}
                </Panel>
            </div>

            <p className="mt-3 text-[11px] text-faint">할 일은 이 브라우저에 자동 저장돼요.</p>

            <TaskDetail task={selected} onClose={() => setSelectedId(null)} onManageLabels={() => setLabelsOpen(true)} />
            <LabelManager open={labelsOpen} onClose={() => setLabelsOpen(false)} />
        </div>
    );
}
