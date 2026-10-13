import React from "react";
import { dayjs } from "@/dayjs/dayjs";
import { Panel, PrimaryButton } from "@/features/symbol/components/ui";
import {
    CATEGORIES,
    CATEGORY_ORDER,
    DAY_TYPE_LABEL,
    MAX_HOURS,
    type DayType,
    type Entry,
    autoDayType,
    entrySpan,
    evaluateEntry,
    fmtClock,
    fmtH,
    fmtHM,
    toMin,
} from "./calc";
import { HOLIDAYS } from "./holidays";
import { useOvertimeStore } from "./store";
import { DeleteButton } from "@/components/DeleteButton";
import { DraftNumberInput, TimeSelect } from "./inputs";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** "19:00" → "19시 00분" */
const fmtKoClock = (hhmm: string) => {
    const [h, m] = hhmm.split(":");
    return `${h}시 ${m}분`;
};

/** 평일은 19시 시작 3시간, 토요일·휴일은 10시 시작 8시간(휴게 60분) */
function defaultEntry(dayType: DayType): Entry {
    return dayType === "weekday"
        ? { start: "19:00", hours: 3, breakMin: 0, comp: "pay" }
        : { start: "10:00", hours: 8, breakMin: 60, comp: "pay" };
}

function Segmented<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    onClick={() => onChange(o.value)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                        value === o.value
                            ? "bg-accent-strong text-white"
                            : "text-muted hover:text-content"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>
            {children}
        </label>
    );
}

const inputClass =
    "w-full rounded-lg border border-line/15 bg-raised/80 px-2 py-1.5 text-sm font-medium tabular-nums text-content outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";

export function DayEditor({ date }: { date: string }) {
    const entries = useOvertimeStore((s) => s.entries);
    const setEntry = useOvertimeStore((s) => s.setEntry);
    const removeEntry = useOvertimeStore((s) => s.removeEntry);

    const entry = entries[date];
    const d = dayjs(date);
    const auto = autoDayType(date);
    const holidayName = HOLIDAYS[date];

    const header = (
        <header className="mb-4">
            <div className="text-lg font-bold text-content">
                {d.format("M월 D일")} ({DOW[d.day()]})
            </div>
            <div className="mt-0.5 text-xs text-muted">
                {holidayName ? `${holidayName} · ` : ""}자동 판정: {DAY_TYPE_LABEL[auto]}
            </div>
        </header>
    );

    if (!entry) {
        return (
            <Panel className="p-4 sm:p-5">
                {header}
                <p className="mb-4 text-sm text-faint">이 날은 기록이 없어요.</p>
                <PrimaryButton className="w-full" onClick={() => setEntry(date, defaultEntry(auto))}>
                    초과근로 기록 추가
                </PrimaryButton>
            </Panel>
        );
    }

    const update = (patch: Partial<Entry>) => setEntry(date, { ...entry, ...patch });
    const r = evaluateEntry(date, entry);
    const dayType = r.dayType;
    const { endMin } = entrySpan(entry);
    const end = fmtClock(endMin);

    // 익일까지 이어질 때: 익일 정보 + 익일 기록과 겹치는지
    const next = d.add(1, "day");
    const nextDate = next.format("YYYY-MM-DD");
    const nextEntry = entries[nextDate];
    const overlapsNext = end.nextDay && nextEntry && toMin(nextEntry.start) < endMin - 1440;

    return (
        <Panel className="p-4 sm:p-5">
            {header}

            <div className="space-y-4">
                <Field label="근무일 구분">
                    <Segmented<DayType>
                        value={dayType}
                        onChange={(v) => update({ dayType: v === auto ? undefined : v })}
                        options={(["weekday", "saturday", "holiday"] as DayType[]).map((t) => ({
                            value: t,
                            label: DAY_TYPE_LABEL[t] + (t === auto ? " (자동)" : ""),
                        }))}
                    />
                </Field>

                <Field label="보상 방식">
                    <Segmented
                        value={entry.comp}
                        onChange={(comp) => update({ comp })}
                        options={[
                            { value: "pay", label: "💰 수당" },
                            { value: "leave", label: "🌴 보상휴가" },
                        ]}
                    />
                </Field>

                <Field label="시작">
                    <TimeSelect value={entry.start} onChange={(start) => update({ start })} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="근로시간(h)">
                        <DraftNumberInput
                            min={0}
                            max={MAX_HOURS}
                            step={0.5}
                            inputMode="decimal"
                            value={entry.hours}
                            onChange={(v) => update({ hours: Math.min(MAX_HOURS, Math.max(0, v)) })}
                            className="w-full"
                        />
                    </Field>
                    <Field label="휴게(분)">
                        <DraftNumberInput
                            min={0}
                            step={10}
                            value={entry.breakMin}
                            onChange={(v) => update({ breakMin: Math.max(0, Math.round(v)) })}
                            className="w-full"
                        />
                    </Field>
                </div>

                <div className="-mt-2 rounded-lg bg-line/[0.03] px-3 py-2 text-xs tabular-nums text-muted">
                    {fmtKoClock(entry.start)} ~{" "}
                    {end.nextDay && (
                        <span className="mr-1 rounded bg-accent/20 px-1 font-semibold text-accent">익일</span>
                    )}
                    <b className="text-content">{fmtKoClock(end.text)}</b> 종료
                    {end.nextDay && (
                        <p className="mt-1 text-faint">
                            자정 이후 {fmtHM(r.nextDayMin)}은 {next.format("M/D")}(
                            {DAY_TYPE_LABEL[autoDayType(nextDate)]}) 기준으로 계산해요. 기록은{" "}
                            {d.format("M/D")}에 남아요.
                        </p>
                    )}
                    {overlapsNext && (
                        <p className="mt-1 text-danger">
                            {next.format("M/D")} 기록({fmtKoClock(nextEntry.start)} 시작)과 시간이 겹쳐요.
                        </p>
                    )}
                    {dayType === "holiday" && entry.hours >= 8 && (
                        <p className="mt-1 text-faint">휴일 8시간 근로 시 휴게 60분 이내.</p>
                    )}
                </div>

                <Field label="메모">
                    <input
                        type="text"
                        value={entry.memo ?? ""}
                        placeholder="예: 배포 대응"
                        onChange={(e) => update({ memo: e.target.value || undefined })}
                        className={inputClass}
                    />
                </Field>

                {/* 이 날 계산 결과 */}
                <div className="rounded-xl border border-line/10 bg-line/[0.03] p-3">
                    <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted">실근로 {fmtHM(r.totalMin)}</span>
                        <span className="text-sm font-bold tabular-nums text-accent">
                            환산 {fmtH(r.weightedMin)}
                        </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs tabular-nums">
                        {CATEGORY_ORDER.filter((c) => r.byCat[c] > 0).map((c) => (
                            <li key={c} className="flex justify-between text-muted">
                                <span>{CATEGORIES[c].label}</span>
                                <span>
                                    {fmtH(r.byCat[c])} × {CATEGORIES[c].rate} ={" "}
                                    <b className="text-content">
                                        {fmtH(r.byCat[c] * CATEGORIES[c].rate)}
                                    </b>
                                </span>
                            </li>
                        ))}
                        {r.totalMin === 0 && <li className="text-faint">근로 시간이 0이에요.</li>}
                    </ul>
                </div>

                <DeleteButton
                    className="w-full"
                    label="기록 삭제"
                    title={`${d.format("M월 D일")} 기록을 삭제할까요?`}
                    description={`${fmtKoClock(entry.start)} 시작 · ${fmtHM(r.totalMin)} 기록이 삭제돼요.`}
                    onConfirm={() => removeEntry(date)}
                />
            </div>
        </Panel>
    );
}
