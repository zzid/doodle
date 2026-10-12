import React, { useEffect, useState } from "react";
import { NumberInput } from "@/features/symbol/components/ui";

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

/** 천 단위 콤마가 보이는 금액 입력 */
export function MoneyInput({
    value,
    onChange,
    suffix,
    hidden,
}: {
    value: number;
    onChange: (v: number) => void;
    suffix: string;
    hidden?: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={value ? value.toLocaleString("ko-KR") : ""}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                className={`${hidden ? "blur-[0.45em] transition-[filter] duration-fast focus:blur-none" : ""} w-36 rounded-lg border border-line/15 bg-raised/80 px-2.5 py-1.5 text-right text-sm font-medium tabular-nums text-content outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30`}
            />
            <span className="text-xs text-muted">{suffix}</span>
        </div>
    );
}

/**
 * 숫자 입력. 입력 중에는 문자열 그대로 두고(빈 칸 허용) 숫자로 파싱되는 값만 저장한다.
 * 제어 값을 바로 Number 로 묶으면 지웠을 때 0 이 들어가 "02" 처럼 이어 붙는 문제가 생긴다.
 */
export function DraftNumberInput({
    value,
    onChange,
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
    value: number;
    onChange: (v: number) => void;
}) {
    const [draft, setDraft] = useState(String(value));

    // 바깥에서 값이 바뀌었을 때(최댓값 보정 등)만 동기화
    useEffect(() => {
        const parsed = parseFloat(draft);
        if ((isNaN(parsed) ? 0 : parsed) !== value) setDraft(String(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <NumberInput
            {...props}
            value={draft}
            onChange={(e) => {
                setDraft(e.target.value);
                const n = parseFloat(e.target.value);
                onChange(isNaN(n) ? 0 : n);
            }}
            onBlur={() => setDraft(String(value))}
        />
    );
}

const selectClass =
    "w-[4.5rem] shrink-0 cursor-pointer rounded-lg border border-line/15 bg-raised/80 py-1.5 pl-3 pr-1 text-sm font-medium tabular-nums text-content outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";

/** 24시간 표기 시각 선택 (브라우저 time input 은 로케일에 따라 오전/오후로 보여서 직접 그린다) */
export function TimeSelect({
    value,
    onChange,
    minuteStep = 10,
}: {
    value: string;
    onChange: (v: string) => void;
    minuteStep?: number;
}) {
    const [h, m] = value.split(":");
    const steps = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) =>
        String(i * minuteStep).padStart(2, "0")
    );
    // 단위에 맞지 않는 예전 값도 보이도록 목록에 끼워 넣는다
    const minutes = steps.includes(m) ? steps : [...steps, m].sort();
    return (
        <div className="flex items-center gap-1.5">
            <select
                aria-label="시"
                value={h}
                onChange={(e) => onChange(`${e.target.value}:${m}`)}
                className={`${selectClass}`}
            >
                {HOURS_24.map((v) => (
                    <option key={v} value={v}>
                        {v}
                    </option>
                ))}
            </select>
            <span className="shrink-0 text-xs text-muted">시</span>
            <select
                aria-label="분"
                value={m}
                onChange={(e) => onChange(`${h}:${e.target.value}`)}
                className={`${selectClass}`}
            >
                {minutes.map((v) => (
                    <option key={v} value={v}>
                        {v}
                    </option>
                ))}
            </select>
            <span className="shrink-0 text-xs text-muted">분</span>
        </div>
    );
}
