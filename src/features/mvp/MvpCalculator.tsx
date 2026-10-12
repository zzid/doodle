"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Panel } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/features/overtime/DeleteButton";
import {
    type CreditItem,
    type Inputs,
    TOTAL,
    calculate,
    defaults,
    fmt,
    newItemId,
    pct,
    won,
} from "./calculate";

const STORAGE_KEY = "doodle-mvp";

/** 입력값은 이 브라우저에 자동 저장 */
function usePersistedInputs() {
    const [values, setValues] = useState<Inputs>(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
            if (saved && Array.isArray(saved.items)) {
                // 예전 형식(사용 크레딧 / 추가 캐시 / 판매가 합계) → 개당 가격 × 개수
                const items: CreditItem[] = saved.items.map((it: any) =>
                    "price" in it
                        ? it
                        : { id: it.id, name: it.name ?? "", price: it.credit ?? "", count: "1", meso: it.meso ?? "" }
                );
                return { ...defaults, ...saved, items };
            }
        } catch {}
        return defaults;
    });
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        } catch {}
    }, [values]);
    return [values, setValues] as const;
}

/** "123900.5" → "123,900.5" */
const withCommas = (raw: string) => {
    if (!raw) return "";
    const [int, dec] = raw.split(".");
    const intFmt = int ? Number(int).toLocaleString("ko-KR") : "0";
    return dec !== undefined ? `${intFmt}.${dec}` : intFmt;
};

/** 숫자 입력 + 단위. 천 단위 콤마로 보여주고 값은 콤마 없는 문자열로 저장 */
function NumField({
    label,
    unit,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    unit: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>
            <span className="flex items-center rounded-lg border border-line/15 bg-raised/80 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
                <input
                    type="text"
                    inputMode="decimal"
                    value={withCommas(value)}
                    placeholder={placeholder ?? "0"}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                        onChange(cleaned);
                    }}
                    className="w-full min-w-0 bg-transparent py-2 pl-3 text-right text-sm font-semibold tabular-nums text-content outline-none placeholder:text-faint"
                />
                <span className="shrink-0 px-2.5 text-xs text-muted">{unit}</span>
            </span>
        </label>
    );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-b border-line/10 py-2.5 text-sm last:border-b-0">
            <span className="text-muted">{label}</span>
            <span className={`tabular-nums ${strong ? "font-bold" : "font-semibold"} ${tone ?? "text-content"}`}>
                {value}
            </span>
        </div>
    );
}

function CardHeader({ title, desc, rate, tone }: { title: string; desc: string; rate: string; tone: string }) {
    return (
        <header className="mb-4 flex items-start justify-between gap-3">
            <div>
                <h2 className="text-base font-bold text-content sm:text-lg">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>
            </div>
            <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold tabular-nums ${tone}`}>{rate}</span>
        </header>
    );
}

export default function MvpCalculator() {
    const [values, setValues] = usePersistedInputs();
    const r = calculate(values);
    const set = (patch: Partial<Inputs>) => setValues((v) => ({ ...v, ...patch }));
    const setItem = (id: string, patch: Partial<CreditItem>) =>
        setValues((v) => ({ ...v, items: v.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));

    const mainShare = Math.max(0, r.main.rate);
    const creditShare = Math.max(0, r.credit.rate);
    const barScale = Math.max(1, mainShare + creditShare);
    const negative = (n: number) => (n < 0 ? "text-danger" : undefined);

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">MVP 회수율 계산기</h1>
                <p className="mt-1 text-sm text-muted">
                    3개월 충전 {won(TOTAL)}으로 산 메인 아이템과, 충전 크레딧으로 산 아이템을 팔아 돌려받는 금액을
                    계산해요.
                </p>
            </header>

            {/* 총 회수율 */}
            <Panel className="mb-4 grid gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
                <div aria-live="polite">
                    <div className="text-xs font-semibold text-good">총 회수율 · 메인 + 크레딧</div>
                    <div
                        className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl ${
                            r.totalRate < 0 ? "text-danger" : "text-good"
                        }`}
                    >
                        {pct(r.totalRate)}
                    </div>
                    <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-line/10" aria-hidden>
                        <span
                            className="h-full bg-good transition-[width] duration-base ease-out"
                            style={{ width: `${(mainShare / barScale) * 100}%` }}
                        />
                        <span
                            className="h-full bg-accent transition-[width] duration-base ease-out"
                            style={{ width: `${(creditShare / barScale) * 100}%` }}
                        />
                    </div>
                    <div className="mt-2 flex gap-4 text-xs tabular-nums text-muted">
                        <span className="flex items-center gap-1.5">
                            <i className="h-2 w-2 rounded-full bg-good" /> 메인 {pct(r.main.rate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="h-2 w-2 rounded-full bg-accent" /> 크레딧 {pct(r.credit.rate)}
                        </span>
                    </div>
                </div>
                <div className="rounded-xl border border-line/10 bg-line/[0.03] px-4 py-1">
                    <Row label="총 회수액" value={won(r.totalRecovered)} strong />
                    <Row label="3개월 실질비용" value={won(r.cost)} />
                    <Row label="월 실질비용" value={won(r.monthly)} />
                </div>
            </Panel>

            <div className="grid items-start gap-4 lg:grid-cols-2">
                {/* 메인 아이템 */}
                <Panel className="p-4 sm:p-5">
                    <CardHeader
                        title="메인 아이템"
                        desc="250만원 충전 캐시로 산 아이템을 메소로 팔아 현금으로 회수해요."
                        rate={pct(r.main.rate)}
                        tone="bg-good/15 text-good"
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <NumField label="아이템 캐시 가격" unit="캐시" value={values.cash} onChange={(cash) => set({ cash })} />
                        <NumField label="아이템 판매가격" unit="억 메소" value={values.meso} onChange={(meso) => set({ meso })} />
                        <NumField label="억당 현금 시세" unit="원" value={values.sell} onChange={(sell) => set({ sell })} />
                    </div>
                    <p className="mt-2 text-[11px] text-faint">메소 판매 수수료 3% (× 0.97) 고정 · 억당 시세는 크레딧 아이템에도 같이 써요.</p>
                    {r.errors.main ? (
                        <p className="mt-3 text-xs text-danger">{r.errors.main}</p>
                    ) : (
                        <div className="mt-3 rounded-xl border border-line/10 bg-line/[0.03] px-4 py-1">
                            <Row label="수수료 후 실제 획득 메소" value={`${fmt(r.main.netMeso, 2)}억 메소`} />
                            <Row label="게임재화 구매시세" value={`${fmt(r.main.buyPrice, 2)}원 / 억`} />
                            <Row label="메인 회수액" value={won(r.main.recovered)} strong tone="text-good" />
                        </div>
                    )}
                </Panel>

                {/* 크레딧 아이템 */}
                <Panel className="p-4 sm:p-5">
                    <CardHeader
                        title="크레딧 아이템"
                        desc="충전 크레딧으로 산 아이템을 메소로 팔아 회수해요. 보유 크레딧보다 많이 쓰면 모자란 만큼은 캐시로 낸 것으로 보고 회수액에서 빼요."
                        rate={pct(r.credit.rate)}
                        tone="bg-accent/15 text-accent"
                    />

                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-end gap-3">
                        <NumField
                            label="크레딧 적립률"
                            unit="%"
                            value={values.creditRate}
                            onChange={(creditRate) => set({ creditRate })}
                        />
                        <div className="grid grid-cols-3 rounded-lg border border-line/10 bg-line/[0.03] px-3 py-1.5 text-[11px] text-muted">
                            {[
                                ["보유", r.credit.total, "text-content"],
                                ["사용", r.credit.used, "text-content"],
                                [r.credit.over ? "초과" : "남음", Math.abs(r.credit.left), r.credit.over ? "text-danger" : "text-content"],
                            ].map(([label, n, tone]) => (
                                <div key={label as string}>
                                    {label}
                                    <div className={`text-sm font-semibold tabular-nums ${tone}`}>{fmt(n as number)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {r.credit.over && (
                        <p className="mt-2 text-xs text-danger">
                            보유 크레딧보다 {fmt(r.credit.shortfall)} 더 썼어요. 이만큼은 캐시로 낸 것으로 계산해요.
                        </p>
                    )}

                    <div className="mt-4 space-y-3">
                        {values.items.map((it, i) => {
                            const ir = r.credit.items[i];
                            return (
                                <div key={it.id} className="rounded-xl border border-line/10 bg-line/[0.02] p-3">
                                    <div className="mb-3 flex items-center gap-2">
                                        <input
                                            aria-label="아이템 이름"
                                            placeholder="아이템 이름 (예: 플가)"
                                            value={it.name}
                                            onChange={(e) => setItem(it.id, { name: e.target.value })}
                                            className="min-w-0 flex-1 rounded-lg border border-line/15 bg-raised/80 px-3 py-1.5 text-sm font-bold text-content outline-none transition placeholder:font-normal placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                                        />
                                        <DeleteButton
                                            label="삭제"
                                            title={`"${it.name || "이름 없는 아이템"}"을 삭제할까요?`}
                                            description="이 크레딧 아이템 줄이 계산에서 빠져요."
                                            onConfirm={() =>
                                                setValues((v) => ({ ...v, items: v.items.filter((x) => x.id !== it.id) }))
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <NumField label="개당 가격" unit="크레딧" value={it.price} onChange={(price) => setItem(it.id, { price })} />
                                        <NumField label="개수" unit="개" value={it.count} onChange={(count) => setItem(it.id, { count })} />
                                        <NumField label="개당 판매가" unit="억 메소" value={it.meso} onChange={(meso) => setItem(it.id, { meso })} />
                                    </div>
                                    {ir?.valid && !ir.empty && (
                                        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line/10 pt-2.5 text-xs tabular-nums text-muted">
                                            <span>
                                                {fmt(ir.credit)} 크레딧 사용 · {fmt(ir.netMeso, 2)}억 × {fmt(Number(values.sell) || 0)}원
                                                {ir.credit > 0 && <> · 크레딧 1당 {fmt(ir.perCredit, 2)}원</>}
                                            </span>
                                            <span className="text-sm font-bold text-accent">회수 {won(ir.recovered)}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            set({ items: [...values.items, { id: newItemId(), name: "", price: "", count: "", meso: "" }] })
                        }
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line/20 py-2.5 text-sm font-semibold text-muted transition hover:border-accent/60 hover:text-accent"
                    >
                        <Plus size={15} /> 아이템 추가
                    </button>
                    {r.errors.credit && <p className="mt-2 text-xs text-danger">{r.errors.credit}</p>}

                    <div className="mt-3 rounded-xl border border-line/10 bg-line/[0.03] px-4 py-1">
                        {r.credit.shortfall > 0 && (
                            <>
                                <Row label="판매 회수 합계" value={won(r.credit.gross)} />
                                <Row
                                    label="크레딧 부족분 (캐시 결제)"
                                    value={`−${won(r.credit.shortfall)}`}
                                    tone="text-danger"
                                />
                            </>
                        )}
                        <Row
                            label="크레딧 아이템 순회수 합계"
                            value={won(r.credit.net)}
                            strong
                            tone={negative(r.credit.net) ?? "text-accent"}
                        />
                    </div>
                </Panel>
            </div>

            <details className="mt-4 text-xs leading-relaxed text-muted">
                <summary className="cursor-pointer select-none text-faint hover:text-muted">계산식 보기</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 tabular-nums">
                    <li>메인 실제 획득 메소 = 아이템 판매가격 × 0.97</li>
                    <li>구매시세 = 아이템 캐시 가격 ÷ 실제 획득 메소</li>
                    <li>메인 회수액 = 2,500,000 × (억당 현금 시세 ÷ 구매시세)</li>
                    <li>보유 크레딧 = 2,500,000 × 적립률 · 사용 크레딧 = 개당 가격 × 개수</li>
                    <li>크레딧 아이템 회수 = 개당 판매가 × 개수 × 0.97 × 억당 현금 시세</li>
                    <li>크레딧 순회수 합계 = 회수 합계 − 크레딧 부족분(사용 − 보유, 캐시로 결제)</li>
                    <li>총 회수율 = (메인 회수액 + 크레딧 순회수 합계) ÷ 2,500,000</li>
                    <li>3개월 실질비용 = 2,500,000 − 총 회수액 · 월 실질비용 = 3개월 실질비용 ÷ 3</li>
                </ul>
            </details>
            <p className="mt-2 text-[11px] text-faint">
                1캐시 = 1원 기준. 입력하면 바로 계산되고 이 브라우저에 자동 저장돼요. 메인 계산은 구매 수량을 정수로 제한하지
                않은 비례 추정치예요.
            </p>
        </div>
    );
}
