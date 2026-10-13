"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { dayjs, type Dayjs } from "@/dayjs/dayjs";
import { GhostButton, Panel, StatTile } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { type BackupAdapter, BackupMenu } from "@/components/BackupMenu";
import { BACKUP_APP, BACKUP_VERSION, type MeCalendarBackup, describeBackup, parseBackup } from "./backup";
import { EventBadge, EventManager } from "./EventManager";
import {
    KIND_META,
    type Kind,
    type Totals,
    eventsOn,
    fmtEok,
    fmtFrag,
    sumTotals,
    totalsOf,
    useMeCalendar,
} from "./store";

/** 첫 칸 요일부터 7일 순서 (목 시작: 목 금 토 일 월 화 수 / 일 시작: 일 월 … 토) */
const dowOrder = (start: number) => Array.from({ length: 7 }, (_, i) => (start + i) % 7);
const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
const fmt = (d: Dayjs) => d.format("YYYY-MM-DD");

/** 그 날이 속한 줄의 첫 날 (start 요일 기준) */
const weekStart = (d: Dayjs, start: number) => d.subtract((d.day() - start + 7) % 7, "day");

function NetText({ t, className = "" }: { t: Totals; className?: string }) {
    if (!t.income && !t.expense) return null;
    return (
        <span className={`tabular-nums ${t.net >= 0 ? "text-good" : "text-danger"} ${className}`}>{fmtEok(t.net, true)}</span>
    );
}

/** 목록 줄 왼쪽 색 띠: 번 돈 초록 / 쓴 돈 빨강 / 일정 파랑 */
const ROW_ACCENT: Record<Kind, string> = {
    income: "border-l-good/70",
    expense: "border-l-danger/70",
    fragment: "border-l-violet-400/70",
    plan: "border-l-accent/70",
};

/** 조각 표시 색 */
const FRAG_TONE = "text-violet-300";

/** 종류 이름: 이모지가 있으면 "💰 번 돈", 없으면 글자만 "조각" */
const kindName = (k: Kind) => `${KIND_META[k].emoji ? `${KIND_META[k].emoji} ` : ""}${KIND_META[k].label}`;

/**
 * 그 자리 수정 칸: 입력할 때마다 저장되고, Enter 를 누르면 입력을 마치고 빠져나온다.
 * 한글 조합 중에 누른 Enter 는 조합이 끝난 뒤에 빠져나와야 마지막 글자가 깨지지 않는다.
 */
const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const el = e.currentTarget;
    if (e.nativeEvent.isComposing) {
        el.addEventListener("compositionend", () => setTimeout(() => el.blur()), { once: true });
        return;
    }
    el.blur();
};

/** 기록의 돈(억)을 그 자리에서 고치는 입력. 0 이하나 빈 값은 저장하지 않고 원래 값으로 돌린다 */
function AmountEdit({
    value,
    sign = "",
    unit = "억",
    signed = false,
    tone,
    onChange,
}: {
    value: number;
    /** 돈은 종류에 따라 + / − 를 앞에 붙인다 */
    sign?: string;
    unit?: string;
    /** 조각처럼 값 자체에 부호가 있는 정수 */
    signed?: boolean;
    tone: string;
    onChange: (v: number) => void;
}) {
    const [draft, setDraft] = useState<string | null>(null);
    const shown = signed ? (value > 0 ? `+${value}` : String(value)) : String(Math.round(value * 100) / 100);
    const commit = () => {
        const n = Number(draft);
        if (draft !== null && (signed ? Number.isInteger(n) && n !== 0 : n > 0)) onChange(n);
        setDraft(null);
    };
    const clean = (v: string) =>
        signed
            ? v.replace(/[^0-9+-]/g, "").replace(/(?!^)[+-]/g, "")
            : v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    return (
        <span
            className={`flex shrink-0 items-center rounded-full px-2 text-sm font-bold tabular-nums transition hover:brightness-125 focus-within:ring-1 focus-within:ring-accent/50 ${tone}`}
        >
            {sign}
            <input
                value={draft ?? shown}
                onChange={(e) => setDraft(clean(e.target.value))}
                onFocus={(e) => {
                    setDraft(shown);
                    e.currentTarget.select();
                }}
                onBlur={commit}
                onKeyDown={(e) => {
                    // Enter 는 blur 이벤트에 기대지 않고 바로 저장한다
                    if (e.key === "Enter") {
                        commit();
                        e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                        setDraft(null);
                        e.currentTarget.blur();
                    }
                }}
                inputMode={signed ? "numeric" : "decimal"}
                aria-label={signed ? "조각 개수 수정" : "돈 수정(억)"}
                style={{ width: `${Math.max(2, (draft ?? shown).length) + 0.5}ch` }}
                className="bg-transparent py-0.5 text-right outline-none"
            />
            {unit}
        </span>
    );
}

/** 선택한 날의 기록 (번 돈 / 쓴 돈 / 일정·메모) */
function DayPanel({ date }: { date: string }) {
    const items = useMeCalendar((s) => s.days[date]) ?? [];
    const { addItem, updateItem, removeItem, eventTypes, toggleEventDay, setEventNote } = useMeCalendar();
    const eventDays = useMeCalendar((s) => s.eventDays);
    const marks = eventDays[date] ?? [];
    const activeEvents = eventsOn(date, dayjs(date).day(), eventTypes, eventDays);
    const [kind, setKind] = useState<Kind>("income");
    const [amount, setAmount] = useState("");
    const [text, setText] = useState("");
    const d = dayjs(date);
    const t = totalsOf(items);
    const isThu = d.day() === 4;
    const needsAmount = kind !== "plan";

    const isFrag = kind === "fragment";
    const submit = () => {
        const amt = Number(amount);
        const ok = isFrag ? Number.isInteger(amt) && amt !== 0 : needsAmount ? amt > 0 : !!text.trim();
        if (!ok) return;
        addItem(date, { kind, text: text.trim(), ...(needsAmount ? { amount: amt } : { done: false }) });
        setAmount("");
        setText("");
    };

    const order: Kind[] = ["plan", "income", "expense", "fragment"];
    const sorted = [...items].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

    return (
        <Panel className="bg-surface/95 p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {/* 날짜 + 합계 */}
                <header className="min-w-[150px]">
                    <div className="flex items-center gap-2 text-base font-bold text-content">
                        {d.format("M월 D일")} ({DOW_LABEL[d.day()]})
                        {isThu && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                                메요일 · 초기화
                            </span>
                        )}
                    </div>
                    <div className="mt-0.5 text-xs tabular-nums text-muted">
                        {t.income > 0 || t.expense > 0 || t.fragments !== 0 ? (
                            <>
                                {(t.income > 0 || t.expense > 0) && (
                                    <>
                                        번 {fmtEok(t.income)} · 쓴 {fmtEok(t.expense)} · 순 <NetText t={t} />
                                    </>
                                )}
                                {t.fragments !== 0 && (
                                    <span className={`${t.income > 0 || t.expense > 0 ? "ml-1.5" : ""} ${FRAG_TONE}`}>
                                        조각 {fmtFrag(t.fragments)}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-faint">기록 없음</span>
                        )}
                    </div>
                </header>

                {/* 추가: 종류 · 돈 · 내용 */}
                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-1">
                    <div className="flex w-full gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1 sm:w-auto">
                        {(Object.keys(KIND_META) as Kind[]).map((k) => (
                            <button
                                key={k}
                                onClick={() => setKind(k)}
                                className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition sm:flex-none ${
                                    kind === k ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                }`}
                            >
                                {kindName(k)}
                            </button>
                        ))}
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                        className="flex w-full gap-1.5 sm:w-auto sm:min-w-[260px] sm:flex-1"
                    >
                        {needsAmount && (
                            <span className="flex w-28 shrink-0 items-center rounded-lg border border-line/15 bg-raised/80 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
                                <input
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            isFrag
                                                ? e.target.value.replace(/[^0-9+-]/g, "").replace(/(?!^)[+-]/g, "")
                                                : e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                                        )
                                    }
                                    inputMode={isFrag ? "numeric" : "decimal"}
                                    placeholder={isFrag ? "+10 / -5" : "0"}
                                    aria-label={isFrag ? "조각 개수" : "돈(억)"}
                                    className="w-full min-w-0 bg-transparent py-2 pl-3 text-right text-sm font-semibold tabular-nums text-content outline-none placeholder:text-faint"
                                />
                                <span className="px-2 text-xs text-muted">{isFrag ? "개" : "억"}</span>
                            </span>
                        )}
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={
                                kind === "income"
                                    ? "예: 재획, 보스 결정석"
                                    : kind === "expense"
                                      ? "예: 큐브, 스타포스"
                                      : kind === "fragment"
                                        ? "예: 에픽던전, 6차 강화 (선택)"
                                        : "예: 검밑솔 파티 21시"
                            }
                            className="min-w-0 flex-1 rounded-lg border border-line/15 bg-raised/80 px-3 py-2 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                        />
                        <button
                            type="submit"
                            aria-label="추가"
                            className="shrink-0 rounded-lg bg-accent-strong px-3 text-white transition hover:bg-accent"
                        >
                            <Plus size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* 고정 이벤트: 비정기는 눌러서 켜고 끄고, 매주 반복은 자동 표시. 켜진 이벤트는 내용을 쓸 수 있다 */}
            {eventTypes.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mr-0.5 text-[11px] text-faint">이벤트</span>
                        {eventTypes.map((et) => {
                            const auto = et.repeatDow !== undefined;
                            const on = auto ? et.repeatDow === d.day() : marks.some((m) => m.id === et.id);
                            if (auto && !on) return null;
                            return (
                                <button
                                    key={et.id}
                                    type="button"
                                    disabled={auto}
                                    onClick={() => toggleEventDay(date, et.id)}
                                    title={
                                        auto ? "매주 반복 이벤트 (이벤트 관리에서 바꿀 수 있어요)" : on ? "끄기" : "이 날에 켜기"
                                    }
                                    className="transition enabled:hover:-translate-y-px disabled:cursor-default"
                                >
                                    <EventBadge t={et} active={on} />
                                </button>
                            );
                        })}
                    </div>
                    {activeEvents.map(({ type, note }) => (
                        <div key={type.id} className="flex items-center gap-2">
                            <span className="w-20 shrink-0">
                                <EventBadge t={type} />
                            </span>
                            <input
                                // 입력할 때마다 저장되므로 키는 이벤트+날짜로 고정해 커서가 튀지 않게
                                key={`${date}-${type.id}`}
                                defaultValue={note ?? ""}
                                onChange={(e) => setEventNote(date, type.id, e.target.value)}
                                onKeyDown={blurOnEnter}
                                placeholder={`${type.name} 내용 (예: ${
                                    type.id === "sunday"
                                        ? "스타포스 30% 할인"
                                        : type.id === "patch"
                                          ? "신규 보스 추가"
                                          : type.id === "live"
                                            ? "겨울 쇼케이스 예고"
                                            : "간단한 내용"
                                })`}
                                aria-label={`${type.name} 내용`}
                                className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm text-content outline-none transition placeholder:text-faint hover:bg-line/[0.06] focus:bg-line/[0.08] focus:ring-1 focus:ring-accent/40"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* 목록 */}
            {sorted.length > 0 && (
                <ul className="mt-3 grid gap-2 border-t border-line/10 pt-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sorted.map((i) => (
                        <li
                            key={i.id}
                            className={`group flex h-10 items-center gap-2 rounded-lg border border-l-[3px] border-line/10 bg-line/[0.03] pl-2 pr-1.5 transition hover:bg-line/[0.06] ${ROW_ACCENT[i.kind]}`}
                        >
                            {i.kind === "plan" ? (
                                <input
                                    type="checkbox"
                                    checked={!!i.done}
                                    onChange={() => updateItem(date, i.id, { done: !i.done })}
                                    aria-label="완료"
                                    className="ml-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--c-accent-strong))]"
                                />
                            ) : i.kind === "fragment" ? (
                                <span className={`shrink-0 rounded-md bg-violet-400/15 px-1.5 py-0.5 text-[11px] font-bold ${FRAG_TONE}`}>
                                    조각
                                </span>
                            ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-line/[0.06] text-sm">
                                    {KIND_META[i.kind].emoji}
                                </span>
                            )}
                            {/* 내용·돈은 눌러서 바로 고친다 */}
                            <input
                                value={i.text}
                                onChange={(e) => updateItem(date, i.id, { text: e.target.value })}
                                onKeyDown={blurOnEnter}
                                placeholder={KIND_META[i.kind].label}
                                aria-label="내용 수정"
                                className={`min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-0.5 text-sm outline-none transition placeholder:text-faint hover:bg-line/[0.06] focus:bg-line/[0.08] focus:ring-1 focus:ring-accent/40 ${
                                    i.done ? "text-faint line-through" : "text-content"
                                }`}
                            />
                            {i.kind === "fragment" && i.amount !== undefined && (
                                <AmountEdit
                                    value={i.amount}
                                    unit="개"
                                    signed
                                    tone={`bg-violet-400/10 ${FRAG_TONE}`}
                                    onChange={(amount) => updateItem(date, i.id, { amount })}
                                />
                            )}
                            {i.kind !== "fragment" && i.amount !== undefined && (
                                <AmountEdit
                                    value={i.amount}
                                    sign={i.kind === "income" ? "+" : "−"}
                                    tone={i.kind === "income" ? "bg-good/10 text-good" : "bg-danger/10 text-danger"}
                                    onChange={(amount) => updateItem(date, i.id, { amount })}
                                />
                            )}
                            <span className="transition focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                <DeleteButton
                                    iconOnly
                                    label="삭제"
                                    title="이 기록을 삭제할까요?"
                                    description={`${d.format("M/D")} · ${KIND_META[i.kind].label}${
                                        i.amount !== undefined
                                            ? ` ${i.kind === "fragment" ? fmtFrag(i.amount) : fmtEok(i.amount)}`
                                            : ""
                                    }${i.text ? ` · ${i.text}` : ""}`}
                                    onConfirm={() => removeItem(date, i.id)}
                                />
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

/** 메-달력 내보내기/가져오기 — 공통 BackupMenu 에 이 페이지 데이터만 연결한다 */
function MeCalendarBackupMenu() {
    const { days, weekStartDow, fragPriceMan, eventTypes, eventDays, importDays } = useMeCalendar();
    const adapter: BackupAdapter<MeCalendarBackup> = {
        title: "메-달력",
        filePrefix: "me-calendar-backup",
        build: () => ({
            app: BACKUP_APP,
            v: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            days,
            weekStartDow,
            fragPriceMan,
            eventTypes,
            eventDays,
        }),
        parse: parseBackup,
        describe: describeBackup,
        currentCount: Object.values(days).reduce((n, list) => n + list.length, 0),
        mergeHint: "같은 날짜만 가져온 기록으로 바꿔요.",
        apply: (d, mode) => importDays(d, mode),
    };
    return <BackupMenu adapter={adapter} />;
}

export default function MeCalendarPage() {
    const days = useMeCalendar((s) => s.days);
    const startDow = useMeCalendar((s) => s.weekStartDow);
    const eventTypes = useMeCalendar((s) => s.eventTypes);
    const eventDays = useMeCalendar((s) => s.eventDays);
    const [eventsOpen, setEventsOpen] = useState(false);
    const setWeekStart = useMeCalendar((s) => s.setWeekStart);
    const today = dayjs().format("YYYY-MM-DD");
    const [cursor, setCursor] = useState(() => dayjs().startOf("month"));
    const [selected, setSelected] = useState(today);

    // 주 단위 그리드 (첫 칸 요일은 설정값)
    const weeks = useMemo(() => {
        const out: Dayjs[][] = [];
        let d = weekStart(cursor, startDow);
        const end = cursor.endOf("month");
        while (!d.isAfter(end, "day")) {
            out.push(Array.from({ length: 7 }, (_, i) => d.add(i, "day")));
            d = d.add(7, "day");
        }
        return out;
    }, [cursor, startDow]);

    const monthKey = cursor.format("YYYY-MM");
    const fragPriceMan = useMeCalendar((s) => s.fragPriceMan);
    const setFragPrice = useMeCalendar((s) => s.setFragPrice);
    // 이 달 말까지 누적 보유 조각 (처음부터 쌓인 증감 합)
    const monthEnd = cursor.endOf("month").format("YYYY-MM-DD");
    const fragBalance = Object.entries(days)
        .filter(([d]) => d <= monthEnd)
        .reduce((n, [, items]) => n + totalsOf(items).fragments, 0);
    const monthTotals = sumTotals(
        Object.entries(days)
            .filter(([d]) => d.startsWith(monthKey))
            .map(([, items]) => totalsOf(items))
    );

    const moveMonth = (n: number) => {
        const next = cursor.add(n, "month");
        setCursor(next);
        setSelected(fmt(next));
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">메-달력</h1>
                    <p className="mt-1 text-sm text-muted">
                        목요일(메요일)부터 시작하는 메이플 주간 달력 — 번 메소·쓴 메소·일정을 자유롭게 적어요.
                    </p>
                </div>
                <div className="flex gap-2">
                    <MeCalendarBackupMenu />
                </div>
            </header>

            {/* 데스크탑: 선택한 날 편집 바가 달력 위에 붙어 있다 / 모바일: 달력 먼저, 그 아래에 선택한 날 상세 */}
            <div className="flex flex-col">
            <div className="order-2 mt-3 sm:sticky sm:top-14 sm:z-20 sm:order-none sm:mb-3 sm:mt-0">
                <DayPanel key={selected} date={selected} />
            </div>

            <div className="order-1 sm:order-none">
                <Panel className="p-2 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                            <button
                                aria-label="이전 달"
                                onClick={() => moveMonth(-1)}
                                className="rounded-lg p-1.5 text-muted hover:bg-line/5 hover:text-content"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="min-w-[7.5rem] text-center text-base font-bold tabular-nums text-content">
                                {cursor.format("YYYY년 M월")}
                            </span>
                            <button
                                aria-label="다음 달"
                                onClick={() => moveMonth(1)}
                                className="rounded-lg p-1.5 text-muted hover:bg-line/5 hover:text-content"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <GhostButton onClick={() => setEventsOpen(true)}>
                                📺 <span className="hidden sm:inline">이벤트 관리</span>
                                <span className="sm:hidden">이벤트</span>
                            </GhostButton>
                            <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1" title="달력 첫 칸 요일">
                                {(
                                    [
                                        [4, "목"],
                                        [0, "일"],
                                    ] as const
                                ).map(([dow, label]) => (
                                    <button
                                        key={dow}
                                        onClick={() => setWeekStart(dow)}
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                            startDow === dow ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                        }`}
                                    >
                                        {label}
                                        <span className="hidden sm:inline">요일</span> 시작
                                    </button>
                                ))}
                            </div>
                            <GhostButton
                                onClick={() => {
                                    setCursor(dayjs().startOf("month"));
                                    setSelected(today);
                                }}
                            >
                                오늘
                            </GhostButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]">
                        {dowOrder(startDow).map((dow) => (
                            <div
                                key={dow}
                                className={`pb-1 text-center text-[11px] font-semibold ${
                                    dow === 4 ? "text-accent" : dow === 0 ? "text-danger" : "text-faint"
                                }`}
                            >
                                {DOW_LABEL[dow]}
                                {dow === 4 && <span className="ml-0.5 hidden font-normal sm:inline">· 초기화</span>}
                            </div>
                        ))}
                        <div className="hidden pb-1 text-center text-[11px] font-semibold text-faint sm:block">주간</div>

                        {weeks.map((week) => {
                            const weekTotals = sumTotals(week.map((d) => totalsOf(days[fmt(d)])));
                            return (
                                <React.Fragment key={fmt(week[0])}>
                                    {week.map((d) => {
                                        const key = fmt(d);
                                        const items = days[key];
                                        const inMonth = d.month() === cursor.month();
                                        const isThu = d.day() === 4;
                                        const isSel = key === selected;
                                        const order: Kind[] = ["income", "expense", "fragment", "plan"];
                                        const cellItems = [...(items ?? [])].sort(
                                            (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)
                                        );
                                        const evs = eventsOn(key, d.day(), eventTypes, eventDays);
                                        const dayT = totalsOf(items);
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSelected(key);
                                                    if (!inMonth) setCursor(d.startOf("month"));
                                                }}
                                                className={`flex min-h-[56px] flex-col rounded-lg border p-1 text-left transition sm:min-h-[100px] sm:p-2 ${
                                                    isSel
                                                        ? "border-accent bg-accent/10"
                                                        : isThu
                                                          ? "border-accent/25 bg-accent/[0.04] hover:border-accent/50"
                                                          : "border-line/10 bg-line/[0.02] hover:border-line/25"
                                                } ${inMonth ? "" : "opacity-35"}`}
                                            >
                                                <span
                                                    className={`text-xs font-semibold tabular-nums ${
                                                        key === today
                                                            ? "self-start rounded-full bg-accent-strong px-1.5 text-white"
                                                            : isThu
                                                              ? "text-accent"
                                                              : d.day() === 0
                                                                ? "text-danger"
                                                                : "text-content"
                                                    }`}
                                                >
                                                    {d.date()}
                                                </span>
                                                {/* 모바일: 칸이 좁아 글자 대신 색 점 + 그날 순이익 숫자 */}
                                                {(evs.length > 0 || cellItems.length > 0) && (
                                                    <div className="mt-1 flex flex-wrap gap-[3px] sm:hidden">
                                                        {evs.map(({ type }) => (
                                                            <i
                                                                key={type.id}
                                                                className="h-1.5 w-1.5 rounded-full"
                                                                style={{ backgroundColor: type.color }}
                                                            />
                                                        ))}
                                                        {dayT.income > 0 && <i className="h-1.5 w-1.5 rounded-full bg-good" />}
                                                        {dayT.expense > 0 && <i className="h-1.5 w-1.5 rounded-full bg-danger" />}
                                                        {dayT.fragments !== 0 && <i className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                                                        {dayT.plans > 0 && <i className="h-1.5 w-1.5 rounded-full bg-accent" />}
                                                    </div>
                                                )}
                                                {(dayT.income > 0 || dayT.expense > 0) && (
                                                    <span
                                                        className={`mt-auto w-full truncate text-[9px] font-semibold tabular-nums sm:hidden ${
                                                            dayT.net >= 0 ? "text-good" : "text-danger"
                                                        }`}
                                                    >
                                                        {dayT.net > 0 ? "+" : dayT.net < 0 ? "−" : ""}
                                                        {Math.round(Math.abs(dayT.net) * 10) / 10}
                                                    </span>
                                                )}
                                                {evs.length > 0 && (
                                                    <div className="mt-1 hidden w-full flex-wrap gap-0.5 sm:flex">
                                                        {evs.map(({ type, note }) => (
                                                            <EventBadge key={type.id} t={type} note={note} small />
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-1.5 hidden w-full space-y-0.5 text-xs leading-snug sm:block">
                                                    {/* 기록마다 한 줄: 돈은 "💰 +6.6억" / "💰 −1.1억", 일정은 "📌 내용" (4줄까지) */}
                                                    {cellItems.slice(0, 4).map((i) =>
                                                        i.kind === "fragment" ? (
                                                            <div key={i.id} className={`truncate font-semibold tabular-nums ${FRAG_TONE}`}>
                                                                조각 {fmtFrag(i.amount ?? 0)}
                                                            </div>
                                                        ) : i.kind === "plan" ? (
                                                            <div
                                                                key={i.id}
                                                                className={`truncate ${i.done ? "text-faint line-through" : "text-muted"}`}
                                                            >
                                                                📌 {i.text}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={i.id}
                                                                className={`truncate font-semibold tabular-nums ${
                                                                    i.kind === "income" ? "text-good" : "text-danger"
                                                                }`}
                                                            >
                                                                💰 {i.kind === "income" ? "+" : "−"}
                                                                {fmtEok(i.amount ?? 0)}
                                                            </div>
                                                        )
                                                    )}
                                                    {cellItems.length > 4 && (
                                                        <div className="text-faint">+{cellItems.length - 4}개 더</div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    <div className="hidden flex-col items-center justify-center rounded-lg text-xs sm:flex">
                                        {weekTotals.income || weekTotals.expense ? (
                                            <NetText t={weekTotals} className="font-semibold" />
                                        ) : null}
                                        {weekTotals.fragments !== 0 && (
                                            <span className={`mt-0.5 text-[11px] font-semibold tabular-nums ${FRAG_TONE}`}>
                                                조각 {fmtFrag(weekTotals.fragments)}
                                            </span>
                                        )}
                                        {!weekTotals.income && !weekTotals.expense && !weekTotals.fragments && (
                                            <span className="text-faint/50">–</span>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <p className="mt-3 text-[11px] text-faint">
                        {startDow === 4
                            ? "한 줄 = 목요일 초기화부터 수요일까지 메이플 한 주 · 오른쪽은 그 주 순이익"
                            : "한 줄 = 일요일~토요일 · 오른쪽은 그 줄 순이익 · 파란 칸 = 목요일(주간 초기화)"}
                    </p>
                </Panel>

            </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile label={`${cursor.month() + 1}월 번 메소`} value={fmtEok(monthTotals.income)} tone="good" />
                <StatTile label={`${cursor.month() + 1}월 쓴 메소`} value={fmtEok(monthTotals.expense)} tone="warn" />
                <StatTile
                    label="순이익"
                    value={fmtEok(monthTotals.net, true)}
                    tone={monthTotals.net >= 0 ? "accent" : "warn"}
                />
                {/* 솔 에르다 조각: 이번 달 증감 + 이 달 말까지 누적 보유 + 시세 환산 */}
                <StatTile
                    label={`${cursor.month() + 1}월 조각`}
                    value={<span className={FRAG_TONE}>{fmtFrag(monthTotals.fragments)}</span>}
                    sub={
                        <>
                            보유 {fragBalance.toLocaleString("ko-KR")}개
                            {fragPriceMan > 0 && <> · ≈ {fmtEok((fragBalance * fragPriceMan) / 10000)}</>}
                        </>
                    }
                />
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-muted">
                조각 시세 1개 =
                <span className="flex w-24 items-center rounded-lg border border-line/15 bg-raised/80 focus-within:border-accent">
                    <input
                        value={fragPriceMan || ""}
                        onChange={(e) => setFragPrice(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                        inputMode="numeric"
                        placeholder="0"
                        aria-label="조각 시세(만 메소)"
                        className="w-full min-w-0 bg-transparent py-1 pl-2 text-right font-semibold tabular-nums text-content outline-none placeholder:text-faint"
                    />
                    <span className="px-1.5">만</span>
                </span>
                메소
            </div>

            <p className="mt-3 text-[11px] text-faint">이 브라우저에 자동 저장돼요.</p>
            <EventManager open={eventsOpen} onClose={() => setEventsOpen(false)} />
        </div>
    );
}
