"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { dayjs } from "@/dayjs/dayjs";
import { GhostButton, Panel } from "@/features/symbol/components/ui";
import {
    BLUR_CLASS,
    MONTHLY_BASE_HOURS,
    entrySpan,
    evaluateEntry,
    fmtClock,
    fmtH,
    fmtWon,
    hourlyFromSalary,
    summarizeMonth,
} from "./calc";
import { HOLIDAYS } from "./holidays";
import { useOvertimeStore } from "./store";
import { DayEditor } from "./DayEditor";
import { MonthSummary } from "./MonthSummary";
import { NetPayCard } from "./NetPayCard";
import { BackupMenu } from "./BackupMenu";
import { DeleteButton } from "./DeleteButton";
import { MoneyInput } from "./inputs";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_LIMIT_MIN = 12 * 60;

export default function OvertimeTracker() {
    const {
        entries,
        wageMode,
        hourlyWage: hourlyInput,
        salary,
        leaveWeighted,
        hideWage,
        setSettings,
        clearMonth,
        clearAll,
    } = useOvertimeStore();

    const today = dayjs().format("YYYY-MM-DD");
    const [cursor, setCursor] = useState(() => dayjs().startOf("month"));
    const [selected, setSelected] = useState(today);

    const month = cursor.format("YYYY-MM");
    const hourlyWage = wageMode === "salary" ? hourlyFromSalary(salary) : hourlyInput;
    const summary = useMemo(
        () => summarizeMonth(entries, month, hourlyWage, leaveWeighted),
        [entries, month, hourlyWage, leaveWeighted]
    );
    const monthEntryCount = Object.keys(entries).filter((d) => d.startsWith(month)).length;

    // 일요일 시작 주 단위 그리드
    const weeks = useMemo(() => {
        const out: string[][] = [];
        let d = cursor.startOf("week");
        const end = cursor.endOf("month");
        while (d.isBefore(end) || d.isSame(end, "day")) {
            out.push(Array.from({ length: 7 }, (_, i) => d.add(i, "day").format("YYYY-MM-DD")));
            d = d.add(7, "day");
        }
        return out;
    }, [cursor]);

    const moveMonth = (diff: number) => {
        const next = cursor.add(diff, "month");
        setCursor(next);
        setSelected(next.format("YYYY-MM-DD"));
    };

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">
                        초과근로 기록
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        날짜를 눌러 시간을 기록하면 월별 수당과 보상휴가를 계산해요. 입력할 때마다 이 브라우저에 자동 저장돼요.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <BackupMenu />
                    <DeleteButton
                        label={`${cursor.month() + 1}월 기록 삭제`}
                        title={`${cursor.format("YYYY년 M월")} 기록을 모두 삭제할까요?`}
                        description={`이 달의 초과근로 기록 ${monthEntryCount}건이 삭제돼요. 다른 달 기록과 시급 설정은 그대로예요.`}
                        disabled={!monthEntryCount}
                        onConfirm={() => clearMonth(month)}
                    />
                    <DeleteButton
                        label="전체 초기화"
                        title="모든 기록과 설정을 초기화할까요?"
                        description={`모든 달의 초과근로 기록 ${Object.keys(entries).length}건과 시급·보상휴가 설정이 삭제돼요.`}
                        onConfirm={clearAll}
                    />
                </div>
            </header>

            {/* 설정 */}
            <Panel className="mb-4 flex flex-wrap items-start gap-x-8 gap-y-4 p-4">
                <div>
                    <div className="mb-1 text-[11px] font-medium text-muted">통상시급 기준</div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                            {(["hourly", "salary"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setSettings({ wageMode: m })}
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                        wageMode === m ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                    }`}
                                >
                                    {m === "hourly" ? "통상시급" : "연봉"}
                                </button>
                            ))}
                        </div>
                        {wageMode === "hourly" ? (
                            <MoneyInput
                                value={hourlyInput}
                                onChange={(v) => setSettings({ hourlyWage: v })}
                                suffix="원 / 시간"
                                hidden={hideWage}
                            />
                        ) : (
                            <MoneyInput
                                value={salary}
                                onChange={(v) => setSettings({ salary: v })}
                                suffix="원 / 년"
                                hidden={hideWage}
                            />
                        )}
                        <button
                            onClick={() => setSettings({ hideWage: !hideWage })}
                            aria-pressed={hideWage}
                            title={hideWage ? "금액 보이기" : "금액 가리기"}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                                hideWage
                                    ? "border-accent/50 bg-accent/15 text-accent"
                                    : "border-line/15 bg-line/5 text-muted hover:text-content"
                            }`}
                        >
                            {hideWage ? <EyeOff size={13} /> : <Eye size={13} />}
                            {hideWage ? "가림" : "보임"}
                        </button>
                    </div>
                    <p className="mt-1 text-[11px] text-faint">입력하면 이 브라우저에 자동 저장돼요.</p>
                    {wageMode === "salary" && (
                        <p className={`mt-1.5 text-xs tabular-nums text-muted ${hideWage ? BLUR_CLASS : ""}`}>
                            {fmtWon(salary)} ÷ 12개월 = 월 {fmtWon(salary / 12)} ÷ 소정근로 {MONTHLY_BASE_HOURS}h ={" "}
                            <b className="text-content">시급 {fmtWon(hourlyWage)}</b>
                        </p>
                    )}
                </div>
                <div>
                    <div className="mb-1 text-[11px] font-medium text-muted">보상휴가 환산</div>
                    <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                        {[
                            { v: true, label: "가산율 적용" },
                            { v: false, label: "1:1" },
                        ].map((o) => (
                            <button
                                key={o.label}
                                onClick={() => setSettings({ leaveWeighted: o.v })}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                    leaveWeighted === o.v ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* 달력 */}
                <Panel className="p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
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
                        <GhostButton
                            onClick={() => {
                                setCursor(dayjs().startOf("month"));
                                setSelected(today);
                            }}
                        >
                            오늘
                        </GhostButton>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]">
                        {DOW.map((d, i) => (
                            <div
                                key={d}
                                className={`pb-1 text-center text-[11px] font-semibold ${
                                    i === 0 ? "text-danger" : i === 6 ? "text-accent" : "text-faint"
                                }`}
                            >
                                {d}
                            </div>
                        ))}
                        <div className="hidden pb-1 text-center text-[11px] font-semibold text-faint sm:block">
                            주간 합계
                        </div>

                        {weeks.map((week) => {
                            const weekMin = week.reduce(
                                (s, d) => s + (entries[d] ? evaluateEntry(d, entries[d]).totalMin : 0),
                                0
                            );
                            const over = weekMin > WEEK_LIMIT_MIN;
                            return (
                                <React.Fragment key={week[0]}>
                                    {week.map((date) => {
                                        const d = dayjs(date);
                                        const inMonth = d.month() === cursor.month();
                                        const entry = entries[date];
                                        const r = entry ? evaluateEntry(date, entry) : null;
                                        const holiday = HOLIDAYS[date];
                                        const dow = d.day();
                                        const isSel = date === selected;
                                        return (
                                            <button
                                                key={date}
                                                onClick={() => {
                                                    setSelected(date);
                                                    if (!inMonth) setCursor(d.startOf("month"));
                                                }}
                                                className={`flex min-h-[64px] flex-col rounded-lg border p-1 text-left transition sm:min-h-[84px] sm:p-1.5 ${
                                                    isSel
                                                        ? "border-accent bg-accent/10"
                                                        : "border-line/10 bg-line/[0.02] hover:border-line/25"
                                                } ${inMonth ? "" : "opacity-35"}`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span
                                                        className={`text-xs font-semibold tabular-nums ${
                                                            date === today
                                                                ? "rounded-full bg-accent-strong px-1.5 text-white"
                                                                : holiday || dow === 0
                                                                  ? "text-danger"
                                                                  : dow === 6
                                                                    ? "text-accent"
                                                                    : "text-content"
                                                        }`}
                                                    >
                                                        {d.date()}
                                                    </span>
                                                    {holiday && (
                                                        <span className="hidden truncate text-[10px] text-danger/80 sm:inline">
                                                            {holiday}
                                                        </span>
                                                    )}
                                                </div>
                                                {entry && r && (
                                                    <div className="mt-1.5 space-y-1">
                                                        <div className="hidden truncate text-[10px] tabular-nums text-muted sm:block">
                                                            {(() => {
                                                                const end = fmtClock(entrySpan(entry).endMin);
                                                                return `${entry.start}–${end.text}${end.nextDay ? "⁺¹" : ""}`;
                                                            })()}
                                                        </div>
                                                        <div
                                                            className={`truncate rounded px-1 text-[10px] font-semibold tabular-nums sm:text-[11px] ${
                                                                entry.comp === "pay"
                                                                    ? "bg-good/15 text-good"
                                                                    : "bg-warn/15 text-warn"
                                                            }`}
                                                        >
                                                            {entry.comp === "pay" ? "💰" : "🌴"} {fmtH(r.totalMin)}
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <div
                                        className={`hidden flex-col items-center justify-center rounded-lg text-xs tabular-nums sm:flex ${
                                            over ? "bg-danger/10 text-danger" : weekMin ? "text-muted" : "text-faint/50"
                                        }`}
                                        title="시간외근로 주 12시간 한도"
                                    >
                                        <span className="font-semibold">{weekMin ? fmtH(weekMin) : "–"}</span>
                                        {over && <span className="text-[10px]">12h 초과</span>}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-faint">
                        <span><span className="text-good">💰</span> 수당</span>
                        <span><span className="text-warn">🌴</span> 보상휴가</span>
                        <span>⁺¹ 익일 종료</span>
                        <span>표시 시간 = 휴게 제외 실근로</span>
                    </div>
                </Panel>

                <div className="lg:sticky lg:top-4 lg:self-start">
                    <DayEditor key={selected} date={selected} />
                </div>
            </div>

            <div className="mt-4">
                <MonthSummary
                    month={month}
                    summary={summary}
                    hourlyWage={hourlyWage}
                    leaveWeighted={leaveWeighted}
                    hideWage={hideWage}
                />
            </div>

            <div className="mt-4">
                <NetPayCard month={month} overtimePay={summary.pay.amount} hourlyWage={hourlyWage} />
            </div>
        </div>
    );
}
