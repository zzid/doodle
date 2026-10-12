import React from "react";
import { Panel, StatTile } from "@/features/symbol/components/ui";
import {
    BLUR_CLASS,
    CATEGORIES,
    CATEGORY_ORDER,
    type CatMinutes,
    type MonthSummary as TMonthSummary,
    fmtH,
    fmtHM,
    fmtWon,
} from "./calc";

function CategoryLines({ byCat }: { byCat: CatMinutes }) {
    const rows = CATEGORY_ORDER.filter((c) => byCat[c] > 0);
    if (!rows.length) return <p className="text-xs text-faint">기록 없음</p>;
    return (
        <ul className="space-y-1 text-xs tabular-nums">
            {rows.map((c) => (
                <li key={c} className="flex justify-between gap-2 text-muted">
                    <span>{CATEGORIES[c].label}</span>
                    <span>
                        {fmtH(byCat[c])} × {CATEGORIES[c].rate * 100}% ={" "}
                        <b className="text-content">{fmtH(byCat[c] * CATEGORIES[c].rate)}</b>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function MonthSummary({
    month,
    summary,
    hourlyWage,
    leaveWeighted,
    hideWage,
}: {
    month: string; // "YYYY-MM"
    summary: TMonthSummary;
    hourlyWage: number;
    leaveWeighted: boolean;
    hideWage: boolean;
}) {
    const [y, m] = month.split("-").map(Number);
    const payDate = m === 12 ? `${y + 1}년 1월 25일` : `${y}년 ${m + 1}월 25일`;
    const { pay, leave } = summary;

    return (
        <Panel className="p-4 sm:p-5">
            <h2 className="mb-3 text-base font-bold text-content sm:text-lg">{m}월 합계</h2>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile
                    label="초과근로 (실근로)"
                    value={fmtHM(summary.totalMin)}
                    sub={`${summary.days}일 기록`}
                />
                <StatTile
                    label="가산 환산 시간"
                    value={fmtH(pay.weightedMin + leave.weightedMin)}
                    tone="accent"
                />
                <StatTile
                    label="예상 수당"
                    value={
                        hourlyWage > 0 ? (
                            <span className={hideWage ? `inline-block ${BLUR_CLASS}` : ""}>
                                {fmtWon(pay.amount)}
                            </span>
                        ) : (
                            "시급 입력 필요"
                        )
                    }
                    sub={`지급 ${payDate}`}
                    tone="good"
                />
                <StatTile
                    label="보상휴가"
                    value={fmtHM(leave.leaveMin)}
                    sub={`= ${Math.round((leave.leaveMin / 60 / 8) * 100) / 100}일 (8h 기준)`}
                    tone="warn"
                />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <section className="rounded-xl border border-line/10 bg-line/[0.03] p-3">
                    <h3 className="mb-2 text-sm font-semibold text-good">💰 수당 계산식</h3>
                    <CategoryLines byCat={pay.byCat} />
                    <div className="mt-3 border-t border-line/10 pt-2 text-xs tabular-nums text-muted">
                        환산 {fmtH(pay.weightedMin)} × 통상시급{" "}
                        <span className={hideWage ? `inline-block ${BLUR_CLASS}` : ""}>
                            {fmtWon(hourlyWage)}
                        </span>{" "}
                        ={" "}
                        <b className={`text-sm text-good ${hideWage ? `inline-block ${BLUR_CLASS}` : ""}`}>
                            {fmtWon(pay.amount)}
                        </b>
                    </div>
                </section>

                <section className="rounded-xl border border-line/10 bg-line/[0.03] p-3">
                    <h3 className="mb-2 text-sm font-semibold text-warn">🌴 보상휴가 계산식</h3>
                    {leaveWeighted ? (
                        <>
                            <CategoryLines byCat={leave.byCat} />
                            <div className="mt-3 border-t border-line/10 pt-2 text-xs tabular-nums text-muted">
                                환산 합계 ={" "}
                                <b className="text-sm text-warn">{fmtHM(leave.leaveMin)}</b>
                                {" "}÷ 8h = {Math.round((leave.leaveMin / 480) * 100) / 100}일
                            </div>
                        </>
                    ) : (
                        <div className="text-xs tabular-nums text-muted">
                            실근로 {fmtH(leave.totalMin)} × 1 ={" "}
                            <b className="text-sm text-warn">{fmtHM(leave.leaveMin)}</b>
                            {" "}÷ 8h = {Math.round((leave.leaveMin / 480) * 100) / 100}일
                        </div>
                    )}
                </section>
            </div>

            <details className="mt-3 text-xs text-muted">
                <summary className="cursor-pointer select-none text-faint hover:text-muted">
                    적용 기준 보기
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>평일 연장: 22시까지 150%, 22시 이후(~06시) 200%</li>
                    <li>토요일: 150% (22시 이후는 연장 야간과 같이 200%로 계산)</li>
                    <li>휴일(일요일·법정공휴일·약정휴일): 연장 8h 이내 150% / 초과 200%, 야간 8h 이내 200% / 초과 250%</li>
                    <li>수당 = Σ(시간 × 가산율) × 통상시급, 원 단위 반올림</li>
                    <li>지급일: 익월 25일 (전월 1일 ~ 말일분)</li>
                    <li>근로기준법: 시간외근로 주 12시간 이내 (주 52시간)</li>
                </ul>
            </details>
        </Panel>
    );
}
