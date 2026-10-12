"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Flame, LogOut } from "lucide-react";
import { GhostButton, Panel, PrimaryButton, StatTile } from "@/features/symbol/components/ui";
import { MoneyInput, TimeSelect } from "@/features/overtime/inputs";
import { useOvertimeStore } from "@/features/overtime/store";
import {
    type DayStatus,
    type OvertimeStatus,
    type Phase,
    MONTHLY_BASE_HOURS,
    PAID_SEC,
    dayStatus,
    fmtClock,
    fmtDuration,
    fmtWon,
    overtimeStatus,
} from "./calc";
import { Odometer } from "./Odometer";
import { useNow } from "./useNow";
import { MiniWindowButton, MiniWindowPortal, useMiniWindow } from "./MiniWindow";
import { useEarningStore } from "./store";

// 흐림 반경은 글자 크기에 비례(em) — 큰 숫자도 읽히지 않게
const BLUR = "blur-[0.45em] select-none";

type ViewPhase = Phase | "overtime";

const PHASE: Record<ViewPhase, { label: string; className: string }> = {
    before: { label: "출근 전 😴", className: "bg-line/10 text-muted" },
    working: { label: "근무 중 💼", className: "bg-good/15 text-good" },
    lunch: { label: "점심시간 🍚 잠시 멈춤", className: "bg-warn/15 text-warn" },
    done: { label: "퇴근 🎉", className: "bg-accent/20 text-accent" },
    overtime: { label: "초과 근무 중 🔥", className: "bg-danger/15 text-danger" },
};

/** 로컬 날짜 "YYYY-MM-DD" */
const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface View {
    st: DayStatus;
    ot: OvertimeStatus | null;
    phase: ViewPhase;
    total: number;
    /** 화면이 보여주는 근무일 (자정을 넘긴 초과근무면 어제) */
    workDate: string;
}

function useView(now: Date): View {
    const { start, lunch, overtime } = useEarningStore();
    const hourly = useHourly();
    const today = ymd(now);
    const yesterday = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    // 자정을 넘겨 계속 초과근무 중이면 어제 근무일을 이어서 보여준다
    const carry = !!overtime && !overtime.endedAt && overtime.date === yesterday;
    const workDate = carry ? yesterday : today;
    const st = dayStatus(carry ? new Date(`${yesterday}T23:59:59`) : now, start, lunch || undefined, hourly);
    const ot = overtime && overtime.date === workDate ? overtimeStatus(now, overtime, st.endMin, hourly) : null;
    return {
        st,
        ot,
        phase: ot?.active ? "overtime" : st.phase,
        total: st.earned + (ot?.earned ?? 0),
        workDate,
    };
}

function useHourly() {
    const { wageMode, hourlyWage, salary } = useEarningStore();
    return wageMode === "salary" ? salary / 12 / MONTHLY_BASE_HOURS : hourlyWage;
}

/** 출근 ~ 퇴근 막대. 점심 구간은 빗금, 지금 위치는 채움 */
function DayBar({ st, compact }: { st: DayStatus; compact?: boolean }) {
    const span = st.endMin - st.startMin;
    const l0 = ((st.lunchStartMin - st.startMin) / span) * 100;
    const lw = ((st.lunchEndMin - st.lunchStartMin) / span) * 100;
    return (
        <div>
            <div className={`relative overflow-hidden rounded-full bg-line/10 ${compact ? "h-1.5" : "h-3"}`}>
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-strong to-good transition-[width] duration-1000 ease-linear"
                    style={{ width: `${st.stayProgress * 100}%` }}
                />
                <div
                    className="absolute inset-y-0 bg-[repeating-linear-gradient(45deg,rgb(var(--c-warn)/0.35)_0_4px,transparent_4px_8px)]"
                    style={{ left: `${l0}%`, width: `${lw}%` }}
                    title="점심시간"
                />
            </div>
            {!compact && (
                <div className="relative mt-1.5 h-4 text-[11px] tabular-nums text-faint">
                    <span className="absolute left-0">{fmtClock(st.startMin)} 출근</span>
                    <span className="absolute -translate-x-1/2 text-warn/80" style={{ left: `${l0 + lw / 2}%` }}>
                        🍚 {fmtClock(st.lunchStartMin)}
                    </span>
                    <span className="absolute right-0">{fmtClock(st.endMin)} 퇴근</span>
                </div>
            )}
        </div>
    );
}

function remainingLabel({ st, ot, phase }: View) {
    if (phase === "overtime" && ot) return `초과근무 ${fmtDuration(ot.sec)}째`;
    if (phase === "before") return `출근까지 ${fmtDuration(st.remainingSec)}`;
    if (phase === "done") return ot ? `초과근무 ${fmtDuration(ot.sec)}까지 하고 퇴근!` : "오늘 일 끝! 수고했어요";
    return `퇴근까지 ${fmtDuration(st.remainingSec)}`;
}

/** 퇴근 이후: 초과근무 시작 / 퇴근하기 / 초과근로 기록에 추가 */
function OvertimeControls({ view }: { view: View }) {
    const { overtime, set, hideMoney } = useEarningStore();
    const entries = useOvertimeStore((s) => s.entries);
    const setEntry = useOvertimeStore((s) => s.setEntry);
    const { st, ot, phase, workDate } = view;
    const blur = hideMoney ? BLUR : "";

    if (phase === "done" && !ot) {
        return (
            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                    onClick={() => set({ overtime: { date: workDate } })}
                    className="flex items-center gap-1.5 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/20"
                >
                    <Flame size={15} /> 아직 일하는 중이에요
                </button>
                <span className="text-xs text-faint">
                    정시 퇴근({fmtClock(st.endMin)})부터 초과근무로 계산해요. 22시까지 150%, 이후 200%.
                </span>
            </div>
        );
    }

    if (!ot || !overtime) return null;

    if (ot.active) {
        return (
            <div className="mt-5 flex flex-wrap items-center gap-2">
                <PrimaryButton onClick={() => set({ overtime: { ...overtime, endedAt: Date.now() } })}>
                    <span className="flex items-center gap-1.5">
                        <LogOut size={15} /> 퇴근하기
                    </span>
                </PrimaryButton>
                <GhostButton onClick={() => set({ overtime: null })}>잘못 눌렀어요</GhostButton>
                <span className="text-xs tabular-nums text-faint">
                    지금 {ot.rateNow * 100}% 적용 중 · 초과수당 <span className={blur}>+{fmtWon(ot.earned)}</span>
                </span>
            </div>
        );
    }

    // 퇴근 완료: 초과근로 기록 페이지로 보내기 (10분 단위 내림)
    const minutes = Math.floor(ot.sec / 600) * 10;
    const existing = entries[workDate];
    return (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-line/10 bg-line/[0.03] p-3 text-sm">
            <span className="text-muted">
                초과근무 {fmtDuration(ot.sec)} · 초과수당 <b className={`text-good ${blur}`}>+{fmtWon(ot.earned)}</b>
            </span>
            {overtime.saved ? (
                <Link href="/overtime" className="flex items-center gap-1 text-xs font-semibold text-good hover:underline">
                    <Check size={13} /> 초과근로 기록에 추가됨 → 보기
                </Link>
            ) : existing ? (
                <Link href="/overtime" className="text-xs text-faint hover:text-muted hover:underline">
                    이 날 초과근로 기록이 이미 있어요 → 확인하기
                </Link>
            ) : minutes > 0 ? (
                <GhostButton
                    onClick={() => {
                        setEntry(workDate, {
                            start: fmtClock(st.endMin),
                            hours: Math.round((minutes / 60) * 100) / 100,
                            breakMin: 0,
                            comp: "pay",
                        });
                        set({ overtime: { ...overtime, saved: true } });
                    }}
                >
                    초과근로 기록에 추가 ({fmtClock(st.endMin)}부터 {Math.floor(minutes / 60)}시간{" "}
                    {minutes % 60 ? `${minutes % 60}분` : ""})
                </GhostButton>
            ) : null}
            <button
                onClick={() => set({ overtime: { date: overtime.date, saved: overtime.saved } })}
                className="text-xs text-faint hover:text-muted"
            >
                아직 안 끝났어요
            </button>
        </div>
    );
}

/** 직전 초보다 오른 금액을 "+8원"으로 잠깐 띄운다 */
function useDelta(value: number, tick: number) {
    const prev = useRef(value);
    const [delta, setDelta] = useState({ v: 0, key: 0 });
    useEffect(() => {
        const d = value - prev.current;
        prev.current = value;
        if (d > 0) setDelta({ v: d, key: tick });
    }, [value, tick]);
    return delta;
}

/** 미니 창 내용. 타이머는 미니 창 쪽 것을 쓴다 */
function MiniView({ win }: { win: Window }) {
    const { hideMoney } = useEarningStore();
    const now = useNow(win);
    const view = useView(now);
    const phase = PHASE[view.phase];

    return (
        <div className="flex h-screen flex-col justify-center gap-2.5 px-4 py-3 font-[Pretendard,system-ui,sans-serif]">
            <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${phase.className}`}>
                    {phase.label}
                </span>
                <span className="text-[11px] tabular-nums text-faint">{fmtClock(view.st.endMin)} 퇴근</span>
            </div>
            <div className={`text-[34px] font-extrabold tracking-tight text-content ${hideMoney ? BLUR : ""}`}>
                <Odometer value={view.total} />
                <span className="ml-1 text-lg font-bold text-muted">원</span>
            </div>
            <DayBar st={view.st} compact />
            <div className="text-xs tabular-nums text-muted">{remainingLabel(view)}</div>
        </div>
    );
}

export default function EarningPage() {
    const s = useEarningStore();
    const hourly = useHourly();
    const now = useNow();
    const view = useView(now);
    const { st, ot } = view;
    const delta = useDelta(view.total, now.getTime());
    const mini = useMiniWindow("💸 오늘 번 돈");
    const phase = PHASE[view.phase];
    const ticking = view.phase === "working" || view.phase === "overtime";
    const rate = view.phase === "overtime" && ot ? ot.rateNow : 1;
    const hasWage = hourly > 0;
    const blur = s.hideMoney ? BLUR : "";
    const isWeekend = [0, 6].includes(now.getDay());

    // 탭 제목에 실시간 금액 (가림 중이면 숨김)
    useEffect(() => {
        const original = document.title;
        return () => {
            document.title = original;
        };
    }, []);
    useEffect(() => {
        document.title =
            hasWage && !s.hideMoney && view.phase !== "before"
                ? `${view.phase === "overtime" ? "🔥" : "💸"} ${fmtWon(view.total)} · 오늘 번 돈`
                : "💸 오늘 번 돈";
    }, [view.total, view.phase, hasWage, s.hideMoney]);

    return (
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">오늘 번 돈</h1>
                    <p className="mt-1 text-sm text-muted">
                        출근부터 지금까지 번 돈이 1초마다 올라가요. 하루 9시간(점심 1시간 제외 8시간 근무) 기준.
                    </p>
                </div>
                <div className="flex gap-2">
                    {mini.supported && hasWage && (
                        <MiniWindowButton
                            active={!!mini.win}
                            isPip={mini.isPip}
                            onClick={() => (mini.win ? mini.close() : mini.open())}
                        />
                    )}
                </div>
            </header>

            {/* 메인 카운터 */}
            <Panel className="relative overflow-hidden p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${phase.className}`}>
                        {phase.label}
                    </span>
                    {isWeekend && <span className="text-xs text-faint">오늘은 주말이지만 평일 기준으로 계산 중</span>}
                </div>

                {hasWage ? (
                    <>
                        <div className="mt-6 text-sm text-muted">
                            오늘 지금까지 번 돈{ot && ot.sec > 0 ? " (초과수당 포함)" : ""}
                        </div>
                        <div className="mt-1 flex items-end gap-2">
                            <div
                                className={`text-[44px] font-extrabold tracking-tight text-content sm:text-7xl ${blur}`}
                            >
                                <Odometer value={view.total} />
                            </div>
                            <span className="relative mb-1 text-xl font-bold text-muted sm:mb-2 sm:text-2xl">
                                원
                                {delta.v > 0 && ticking && !s.hideMoney && (
                                    <span
                                        key={delta.key}
                                        className={`absolute bottom-full left-full ml-1 animate-float-up whitespace-nowrap text-sm font-bold ${
                                            view.phase === "overtime" ? "text-danger" : "text-good"
                                        }`}
                                    >
                                        +{delta.v.toLocaleString("ko-KR")}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="mt-2 text-sm tabular-nums text-faint">
                            {ot && ot.sec > 0 ? (
                                <>
                                    정규 <span className={blur}>{fmtWon(st.earned)}</span> + 초과수당{" "}
                                    <span className={`text-danger/90 ${blur}`}>{fmtWon(ot.earned)}</span>
                                </>
                            ) : (
                                <>
                                    오늘 목표 <span className={blur}>{fmtWon(st.dailyTotal)}</span> 중{" "}
                                    {Math.floor((st.paidSec / PAID_SEC) * 100)}%
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="mt-6 text-sm text-faint">아래에 연봉이나 시급을 입력하면 시작돼요.</p>
                )}

                <div className="mt-8">
                    <div className="mb-3 text-lg font-bold tabular-nums text-content sm:text-xl">
                        {remainingLabel(view)}
                    </div>
                    <DayBar st={st} />
                    {hasWage && <OvertimeControls view={view} />}
                </div>
            </Panel>

            {hasWage && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatTile
                        label={rate > 1 ? `초당 (${rate * 100}%)` : "초당"}
                        value={<span className={blur}>{((hourly * rate) / 3600).toFixed(2)}원</span>}
                        tone={rate > 1 ? "warn" : "default"}
                    />
                    <StatTile label="분당" value={<span className={blur}>{fmtWon((hourly * rate) / 60)}</span>} />
                    <StatTile label="시간당" value={<span className={blur}>{fmtWon(hourly * rate)}</span>} />
                    <StatTile
                        label="지금까지 번 돈으로"
                        value={<span className={blur}>☕ {Math.floor(view.total / 4700)}잔</span>}
                        sub="아메리카노 4,700원 기준"
                    />
                </div>
            )}

            {/* 설정 */}
            <Panel className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-4 p-4">
                <div>
                    <div className="mb-1 text-[11px] font-medium text-muted">출근 시각</div>
                    <TimeSelect value={s.start} onChange={(start) => s.set({ start })} minuteStep={5} />
                </div>
                <div>
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-muted">
                        점심 시작
                        <label className="flex cursor-pointer items-center gap-1 text-faint">
                            <input
                                type="checkbox"
                                checked={!s.lunch}
                                onChange={(e) =>
                                    s.set({ lunch: e.target.checked ? "" : fmtClock(st.lunchStartMin) })
                                }
                                className="accent-[rgb(var(--c-accent-strong))]"
                            />
                            자동
                        </label>
                    </div>
                    {s.lunch ? (
                        <TimeSelect value={s.lunch} onChange={(lunch) => s.set({ lunch })} minuteStep={5} />
                    ) : (
                        <div className="py-1.5 text-sm tabular-nums text-content">
                            {fmtClock(st.lunchStartMin)} ~ {fmtClock(st.lunchEndMin)}
                        </div>
                    )}
                </div>
                <div>
                    <div className="mb-1 text-[11px] font-medium text-muted">급여</div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                            {(["salary", "hourly"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => s.set({ wageMode: m })}
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                        s.wageMode === m
                                            ? "bg-accent-strong text-white"
                                            : "text-muted hover:text-content"
                                    }`}
                                >
                                    {m === "salary" ? "연봉" : "시급"}
                                </button>
                            ))}
                        </div>
                        {s.wageMode === "salary" ? (
                            <MoneyInput
                                value={s.salary}
                                onChange={(salary) => s.set({ salary })}
                                suffix="원 / 년"
                                hidden={s.hideMoney}
                            />
                        ) : (
                            <MoneyInput
                                value={s.hourlyWage}
                                onChange={(hourlyWage) => s.set({ hourlyWage })}
                                suffix="원 / 시간"
                                hidden={s.hideMoney}
                            />
                        )}
                        <button
                            onClick={() => s.set({ hideMoney: !s.hideMoney })}
                            aria-pressed={s.hideMoney}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                                s.hideMoney
                                    ? "border-accent/50 bg-accent/15 text-accent"
                                    : "border-line/15 bg-line/5 text-muted hover:text-content"
                            }`}
                        >
                            {s.hideMoney ? <EyeOff size={13} /> : <Eye size={13} />}
                            {s.hideMoney ? "가림" : "보임"}
                        </button>
                    </div>
                    {s.wageMode === "salary" && hasWage && (
                        <p className={`mt-1.5 text-xs tabular-nums text-muted ${blur}`}>
                            {fmtWon(s.salary)} ÷ 12개월 ÷ {MONTHLY_BASE_HOURS}h = 시급 {fmtWon(hourly)}
                        </p>
                    )}
                </div>
            </Panel>
            <p className="mt-2 text-[11px] text-faint">설정은 이 브라우저에 자동 저장돼요.</p>

            {mini.win && (
                <MiniWindowPortal win={mini.win}>
                    <MiniView win={mini.win} />
                </MiniWindowPortal>
            )}
        </div>
    );
}
