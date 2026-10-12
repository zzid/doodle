import React from "react";
import { dayjs } from "@/dayjs/dayjs";
import { Panel } from "@/features/symbol/components/ui";
import { BLUR_CLASS, MONTHLY_BASE_HOURS, fmtWon } from "./calc";
import { type Payroll, calcPayroll } from "./payroll";
import { DraftNumberInput, MoneyInput } from "./inputs";
import { useOvertimeStore } from "./store";

const pct = (r: number) => `${Math.round(r * 100000) / 1000}%`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-[11px] font-medium text-muted">{label}</div>
            {children}
        </div>
    );
}

/**
 * 초과수당이 지급되는 달(익월 25일)의 월급 실수령액.
 * 수당이 없을 때와 나란히 놓고 수당이 실제로 얼마나 늘려주는지 보여준다.
 */
export function NetPayCard({
    month,
    overtimePay,
    hourlyWage,
}: {
    /** 초과근로 발생 월 "YYYY-MM" */
    month: string;
    overtimePay: number;
    hourlyWage: number;
}) {
    const s = useOvertimeStore();
    const payMonth = dayjs(`${month}-01`).add(1, "month");
    const basePay =
        s.wageMode === "salary"
            ? Math.round(s.salary / 12)
            : s.monthlyBase || Math.round(hourlyWage * MONTHLY_BASE_HOURS);

    const input = {
        month: payMonth.format("YYYY-MM"),
        basePay,
        nonTaxable: s.nonTaxable,
        family: s.family,
        children: s.children,
        withholdingRatio: s.withholdingRatio,
    };
    const without = calcPayroll({ ...input, overtimePay: 0 });
    const withOt = calcPayroll({ ...input, overtimePay });
    const gain = withOt.net - without.net;
    const r = withOt.rates;

    const blur = s.hideWage ? `inline-block ${BLUR_CLASS}` : "";
    const won = (n: number, cls = "") => <span className={`${blur} ${cls}`}>{fmtWon(n)}</span>;

    const rows: {
        label: string;
        formula: React.ReactNode;
        pick: (p: Payroll) => number;
        minus?: boolean;
        strong?: boolean;
    }[] = [
        {
            label: "국민연금",
            formula: (
                <>
                    기준소득월액 {won(withOt.pensionBase)} × {pct(r.pension)} (상한 {fmtWon(r.pensionMax)})
                </>
            ),
            pick: (p) => p.pension,
            minus: true,
        },
        {
            label: "건강보험",
            formula: <>과세 기본급 × {pct(r.health)}</>,
            pick: (p) => p.health,
            minus: true,
        },
        {
            label: "장기요양보험",
            formula: <>건강보험료 × {pct(r.careOfHealth)}</>,
            pick: (p) => p.care,
            minus: true,
        },
        {
            label: "고용보험",
            formula: <>과세 급여(수당 포함) × {pct(r.employment)}</>,
            pick: (p) => p.employment,
            minus: true,
        },
        {
            label: "소득세",
            formula: (
                <>
                    간이세액표(가족 {s.family}명{s.children ? `, 자녀 ${s.children}명 공제` : ""}) ×{" "}
                    {s.withholdingRatio * 100}%
                </>
            ),
            pick: (p) => p.incomeTax,
            minus: true,
        },
        {
            label: "지방소득세",
            formula: <>소득세 × 10%</>,
            pick: (p) => p.localTax,
            minus: true,
        },
    ];

    return (
        <Panel className="p-4 sm:p-5">
            <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-bold text-content sm:text-lg">
                    실수령액 예상
                    <span className="ml-2 text-xs font-medium text-muted">
                        {payMonth.format("YYYY년 M월")} 25일 급여 · {dayjs(`${month}-01`).format("M월")} 수당 포함
                    </span>
                </h2>
            </header>

            {/* 공제 조건 */}
            <div className="mb-4 flex flex-wrap items-start gap-x-6 gap-y-3 rounded-xl border border-line/10 bg-line/[0.03] p-3">
                {s.wageMode === "hourly" && (
                    <Field label="세전 월 기본급">
                        <MoneyInput
                            value={s.monthlyBase || Math.round(hourlyWage * MONTHLY_BASE_HOURS)}
                            onChange={(v) => s.setSettings({ monthlyBase: v })}
                            suffix="원"
                            hidden={s.hideWage}
                        />
                    </Field>
                )}
                <Field label="월 비과세 (식대 등)">
                    <MoneyInput
                        value={s.nonTaxable}
                        onChange={(v) => s.setSettings({ nonTaxable: v })}
                        suffix="원"
                    />
                </Field>
                <Field label="공제대상 가족 (본인 포함)">
                    <div className="flex items-center gap-1.5">
                        <DraftNumberInput
                            min={1}
                            max={11}
                            value={s.family}
                            onChange={(v) => s.setSettings({ family: Math.min(11, Math.max(1, Math.round(v))) })}
                            className="w-16"
                        />
                        <span className="text-xs text-muted">명</span>
                    </div>
                </Field>
                <Field label="8~20세 자녀">
                    <div className="flex items-center gap-1.5">
                        <DraftNumberInput
                            min={0}
                            max={10}
                            value={s.children}
                            onChange={(v) => s.setSettings({ children: Math.max(0, Math.round(v)) })}
                            className="w-16"
                        />
                        <span className="text-xs text-muted">명</span>
                    </div>
                </Field>
                <Field label="원천징수 비율">
                    <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                        {[0.8, 1, 1.2].map((v) => (
                            <button
                                key={v}
                                onClick={() => s.setSettings({ withholdingRatio: v })}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                    s.withholdingRatio === v
                                        ? "bg-accent-strong text-white"
                                        : "text-muted hover:text-content"
                                }`}
                            >
                                {v * 100}%
                            </button>
                        ))}
                    </div>
                </Field>
            </div>

            {basePay <= 0 ? (
                <p className="text-sm text-faint">위에서 통상시급이나 연봉을 입력하면 실수령액을 계산해요.</p>
            ) : (
                <>
                    {/* 비교 표 */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] text-sm tabular-nums">
                            <thead>
                                <tr className="border-b border-line/10 text-[11px] text-faint">
                                    <th className="py-2 text-left font-medium">항목</th>
                                    <th className="py-2 text-right font-medium">수당 없을 때</th>
                                    <th className="py-2 text-right font-medium">수당 포함</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1.5 text-muted">
                                        기본급
                                        <div className="text-[11px] text-faint">
                                            {s.wageMode === "salary" ? "연봉 ÷ 12" : "입력값"} (비과세{" "}
                                            {fmtWon(Math.min(s.nonTaxable, basePay))} 포함)
                                        </div>
                                    </td>
                                    <td className="text-right text-content">{won(basePay)}</td>
                                    <td className="text-right text-content">{won(basePay)}</td>
                                </tr>
                                <tr className="border-b border-line/10">
                                    <td className="py-1.5 text-muted">초과수당</td>
                                    <td className="text-right text-faint">—</td>
                                    <td className="text-right text-good">+{won(overtimePay)}</td>
                                </tr>
                                <tr className="border-b border-line/10">
                                    <td className="py-1.5 font-semibold text-content">세전 합계</td>
                                    <td className="text-right font-semibold text-content">{won(without.gross)}</td>
                                    <td className="text-right font-semibold text-content">{won(withOt.gross)}</td>
                                </tr>
                                {rows.map((row) => (
                                    <tr key={row.label}>
                                        <td className="py-1.5 text-muted">
                                            {row.label}
                                            <div className="text-[11px] text-faint">{row.formula}</div>
                                        </td>
                                        <td className="text-right text-danger/90">−{won(row.pick(without))}</td>
                                        <td className="text-right text-danger/90">−{won(row.pick(withOt))}</td>
                                    </tr>
                                ))}
                                <tr className="border-t border-line/10">
                                    <td className="py-1.5 text-muted">공제 합계</td>
                                    <td className="text-right text-danger">−{won(without.totalDeduction)}</td>
                                    <td className="text-right text-danger">−{won(withOt.totalDeduction)}</td>
                                </tr>
                                <tr className="border-t border-line/15">
                                    <td className="py-2.5 text-base font-bold text-content">실수령액</td>
                                    <td className="text-right text-base font-bold text-content">{won(without.net)}</td>
                                    <td className="text-right text-lg font-extrabold text-good">{won(withOt.net)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {overtimePay > 0 && (
                        <div className="mt-3 rounded-xl border border-good/20 bg-good/10 px-3 py-2.5 text-sm text-muted">
                            <div>
                                초과수당 {won(overtimePay)} 중 실제로 손에 들어오는 돈은{" "}
                                <b className="text-good">{won(gain)}</b>
                                {" "}({Math.round((gain / overtimePay) * 1000) / 10}%)이에요.
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums">
                                <span className="text-faint">수당분 공제</span>
                                {(
                                    [
                                        ["소득세", (p: Payroll) => p.incomeTax],
                                        ["지방소득세", (p: Payroll) => p.localTax],
                                        ["고용보험", (p: Payroll) => p.employment],
                                        ["국민연금", (p: Payroll) => p.pension],
                                        ["건강·장기요양", (p: Payroll) => p.health + p.care],
                                    ] as const
                                )
                                    .map(([label, pick]) => [label, pick(withOt) - pick(without)] as const)
                                    .filter(([, diff]) => diff > 0)
                                    .map(([label, diff]) => (
                                        <span key={label}>
                                            {label} <span className="text-danger/90">−{won(diff)}</span>
                                        </span>
                                    ))}
                                <span>
                                    = <b className="text-danger">−{won(overtimePay - gain)}</b>
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}

            <details className="mt-3 text-xs text-muted">
                <summary className="cursor-pointer select-none text-faint hover:text-muted">계산 기준 보기</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                        국민연금·건강보험은 신고된 월 보수(기본급) 기준이라 초과수당이 들어와도 그 달 보험료는 변하지
                        않아요. 건강보험은 다음 해 4월 연말정산으로 차액이 정산돼요.
                    </li>
                    <li>
                        초과수당도 과세 소득이라 소득세·지방소득세·고용보험이 그 달에 바로 늘어나요. 소득세는 누진이라
                        수당분에는 평소보다 높은 세율이 붙어요. (연장근로수당 비과세는 월급여 210만원 이하 생산직만 해당)
                    </li>
                    <li>
                        국민연금·건강보험은 그 달엔 그대로지만, 수당이 늘면 다음 해 4월 건강보험 정산과 7월 국민연금
                        기준소득월액 조정 때 반영돼 나중에 더 낼 수 있어요.
                    </li>
                    <li>
                        소득세: 소득세법 시행령 [별표 2] 근로소득 간이세액표(2026.2.27 개정, 2026.3.1 지급분부터)를
                        그대로 사용. 8~20세 자녀 공제 1명 20,830원 / 2명 45,830원 / 3명 이상 1명당 33,330원 추가.
                    </li>
                    <li>
                        2026년 근로자 부담 요율: 국민연금 4.75%(기준소득월액 7월부터 41만~659만원), 건강보험 3.595%,
                        장기요양 건강보험료의 13.14%, 고용보험 0.9%.
                    </li>
                    <li>공제액은 10원 미만 절사. 회사별 공제 항목(노조비, 사내대출 등)과 연말정산 결과는 반영되지 않은 추정치예요.</li>
                </ul>
            </details>
        </Panel>
    );
}
