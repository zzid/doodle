import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { dayjs, Dayjs } from "@/dayjs/dayjs";
import { Calendar, CalendarHighlightProvider } from "@/features/calendar";
import { CalendarConfig, CellRenderer } from "@/features/calendar/types";
import { getCalendarColors } from "@/features/calendar/constants/theme";
import {
    ARCANE_LEVEL_TABLE,
    ARCANE_SYMBOLS,
    ARCANE_WEEKLY_BONUS,
} from "../data";
import { getAllArcaneLevelMilestones } from "../utils";
import { AssetIcon, GhostButton, NumberInput, Panel, StatTile } from "./ui";

type ArcaneInput = { level: number; count: number; daily: number };
type ArcaneInputs = Record<string, ArcaneInput>;

/** 심볼 달력은 아케인 느낌의 인디고 팔레트를 쓴다 */
function getSymbolCalendarColors() {
    return {
        ...getCalendarColors(true),
        effectTitle: "#818cf8",
        effectBoxBorderAchieved: "#6366f1",
        effectBoxBorderNormal: "#818cf8",
        effectBoxBgHighlight: "#1e1b4b",
        effectBoxBgAchieved: "#312e81",
        effectBoxBgNormal: "#1e293b",
        effectBoxText: "#c7d2fe",
        effectBoxBoxShadowHighlight:
            "0 0 8px 1px #312e81, 0 3px 14px 0 #6366f1a1",
        effectBoxOutline: "#818cf8",
        effectBoxHoverShadow: "0 0 10px 2px #312e8186",
        effectCount: "#818cf8",
        effectCountShadow: "0 0 3px #6366f1ad",
        weekdayThu: "#818cf8",
        weekdayWed: "#a78bfa",
        cellBorderEffect: "#818cf8",
        cellBgEffect: "#1e1b4b",
        cellShadowEffect: "0 0 0 2px #6366f180",
        cellHoverBgEffect: "#312e81",
        badgeCountUp: "#818cf8",
        badgeBgCountUp: "#1e3a8a",
    };
}

/** 레벨 구간 누적 필요 심볼 수 */
function neededSymbols(fromLevel: number, toLevel: number) {
    return ARCANE_LEVEL_TABLE.filter(
        (row) => row.from >= fromLevel && row.to <= toLevel
    ).reduce((acc, row) => acc + row.need, 0);
}

function ArcaneSymbolCalendar({
    milestonesBySymbol,
}: {
    milestonesBySymbol: Record<
        string,
        ReturnType<typeof getAllArcaneLevelMilestones>
    >;
}) {
    const symbolColors = useMemo(() => getSymbolCalendarColors(), []);

    const milestonesFlat = useMemo(
        () =>
            Object.entries(milestonesBySymbol).flatMap(
                ([symbol, milestones]) =>
                    milestones?.map((m) => ({ ...m, symbol })) || []
            ),
        [milestonesBySymbol]
    );

    const dateMap = useMemo(() => {
        const map: Record<
            string,
            { symbol: string; level: number; isMax: boolean }[]
        > = {};
        milestonesFlat.forEach((m) => {
            const dateStr = dayjs(m.dateReached).format("YYYY-MM-DD");
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push({
                symbol: m.symbol,
                level: m.level,
                isMax: m.isMax,
            });
        });
        return map;
    }, [milestonesFlat]);

    const maxDate = useMemo(() => {
        const dates = milestonesFlat.map((m) =>
            dayjs(m.dateReached).startOf("day")
        );
        if (dates.length === 0) return dayjs().startOf("day");
        return dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]);
    }, [milestonesFlat]);

    const renderCell: CellRenderer = useMemo(
        () =>
            ({ date }) => {
                const dayEvents = dateMap[date.format("YYYY-MM-DD")] || [];
                return (
                    <div className="flex h-full flex-col">
                        <div className="mb-1 text-sm font-semibold text-content">
                            {date.date()}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                            {dayEvents.map((e, idx) => (
                                <span
                                    key={`${e.symbol}-${e.level}-${idx}`}
                                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                        e.isMax
                                            ? "bg-amber-400 text-bg"
                                            : "bg-accent/25 text-accent"
                                    }`}
                                >
                                    {e.symbol.slice(0, 2)} Lv.{e.level}
                                    {e.isMax && " MAX"}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            },
        [dateMap]
    );

    const calendarConfig: CalendarConfig = useMemo(
        () => ({
            eventStartDate: dayjs(),
            eventEndDate: maxDate,
            weekStartDay: 0,
            weekdays: ["일", "월", "화", "수", "목", "금", "토"],
            getEventsForDate: (date: Dayjs) =>
                dateMap[date.format("YYYY-MM-DD")] || [],
            isSpecialDate: (_date: Dayjs, events: any[]) => events.length > 0,
        }),
        [maxDate, dateMap]
    );

    if (milestonesFlat.length === 0) return null;

    return (
        <CalendarHighlightProvider>
            <Calendar
                config={calendarConfig}
                colors={symbolColors}
                today={dayjs()}
                renderCell={renderCell}
                showEffectsBar={false}
                pageTitle={undefined}
            />
        </CalendarHighlightProvider>
    );
}

function ArcaneSymbolCard({
    symbol,
    value,
    extraDaily,
    targetLevel,
    milestones,
    onChange,
}: {
    symbol: { name: string; defaultDaily: number; image?: string };
    value: ArcaneInput;
    extraDaily: number;
    targetLevel: number;
    milestones: ReturnType<typeof getAllArcaneLevelMilestones>;
    onChange: (key: keyof ArcaneInput, v: number) => void;
}) {
    const { level, count, daily } = value;
    const effectiveDaily = daily + extraDaily;
    const target = milestones?.find((m) => m.level === targetLevel) ?? null;
    const remaining = Math.max(
        0,
        neededSymbols(level, targetLevel) - count
    );

    const row = (
        label: string,
        input: React.ReactNode,
        hint?: React.ReactNode
    ) => (
        <div className="flex items-center gap-2">
            <span className="w-[42px] shrink-0 text-[11px] font-medium text-muted sm:w-[52px] sm:text-xs">
                {label}
            </span>
            {input}
            {hint && <span className="text-[11px] text-faint">{hint}</span>}
        </div>
    );

    return (
        <div className="rounded-xl border border-line/10 bg-line/[0.03] p-2.5 transition hover:border-accent/40 sm:p-3.5">
            <div className="mb-2.5 flex items-center gap-1.5">
                <AssetIcon src={symbol.image} name={symbol.name} size={24} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-accent">
                    {symbol.name}
                </span>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-accent">
                    Lv.{level}
                </span>
            </div>
            <div className="flex flex-col gap-2">
                {row(
                    "레벨",
                    <NumberInput
                        min={1}
                        max={20}
                        step={1}
                        value={level}
                        className="w-full"
                        aria-label={`${symbol.name} 현재 레벨`}
                        onChange={(e) => {
                            const v = parseInt(e.target.value);
                            onChange(
                                "level",
                                Number.isNaN(v) ? 1 : Math.max(1, Math.min(20, v))
                            );
                        }}
                    />
                )}
                {row(
                    "보유량",
                    <NumberInput
                        min={0}
                        value={count === 0 ? "" : count}
                        placeholder="0"
                        className="w-full"
                        aria-label={`${symbol.name} 보유 심볼 개수`}
                        onChange={(e) => {
                            const v =
                                e.target.value === ""
                                    ? 0
                                    : parseInt(e.target.value);
                            onChange("count", Number.isNaN(v) ? 0 : Math.max(0, v));
                        }}
                    />
                )}
                {row(
                    "일일",
                    <NumberInput
                        min={0}
                        value={daily}
                        className="w-full"
                        aria-label={`${symbol.name} 일일 획득량`}
                        onChange={(e) => {
                            const v = parseInt(e.target.value);
                            onChange("daily", Number.isNaN(v) ? 0 : Math.max(0, v));
                        }}
                    />,
                    extraDaily > 0 ? `+${extraDaily}` : undefined
                )}
            </div>
            <div className="mt-3 space-y-1 border-t border-line/5 pt-2.5 text-[11px] text-muted">
                <div className="flex justify-between">
                    <span>Lv.{targetLevel}까지 남은 심볼</span>
                    <b className="tabular-nums text-warn">
                        {remaining.toLocaleString()}개
                    </b>
                </div>
                <div className="flex justify-between">
                    <span>예상 도달일</span>
                    <b className="tabular-nums text-accent">
                        {level >= targetLevel
                            ? "달성"
                            : target
                            ? dayjs(target.dateReached).format("YY.MM.DD")
                            : "-"}
                    </b>
                </div>
                <div className="flex justify-between text-faint">
                    <span>실 일일 획득</span>
                    <span className="tabular-nums">{effectiveDaily}개</span>
                </div>
            </div>
        </div>
    );
}

function ArcaneLevelTableCompact() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-xs">
                <thead>
                    <tr className="border-b border-line/10 text-[11px] uppercase tracking-wide text-faint">
                        <th className="px-2 py-1.5 text-center font-semibold">
                            Lv
                        </th>
                        <th className="px-2 py-1.5 text-right font-semibold">
                            필요
                        </th>
                        <th className="px-2 py-1.5 text-right font-semibold">
                            누적
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {ARCANE_LEVEL_TABLE.map((row, idx) => (
                        <tr
                            key={row.from}
                            className="border-b border-line/5 text-muted"
                        >
                            <td className="px-2 py-1.5 text-center tabular-nums">
                                {row.from} → {row.to}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                                {row.need}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted">
                                {ARCANE_LEVEL_TABLE.slice(0, idx + 1).reduce(
                                    (acc, cur) => acc + cur.need,
                                    0
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export const ArcaneGrowth = () => {
    const [extraDaily, setExtraDaily] = useState(0);
    const [targetLevel, setTargetLevel] = useState(20);
    const [showTable, setShowTable] = useState(false);
    const [inputs, setInputs] = useState<ArcaneInputs>(() =>
        Object.fromEntries(
            ARCANE_SYMBOLS.map((sym) => [
                sym.name,
                { level: 17, count: 0, daily: sym.defaultDaily },
            ])
        )
    );

    const handleChange = (
        symbol: string,
        key: keyof ArcaneInput,
        v: number
    ) =>
        setInputs((prev) => ({
            ...prev,
            [symbol]: { ...prev[symbol], [key]: v },
        }));

    const milestonesBySymbol = useMemo(() => {
        const result: Record<
            string,
            ReturnType<typeof getAllArcaneLevelMilestones>
        > = {};
        ARCANE_SYMBOLS.forEach(({ name }) => {
            const input = inputs[name];
            result[name] = getAllArcaneLevelMilestones(
                input.level,
                input.count,
                input.daily + extraDaily
            );
        });
        return result;
    }, [inputs, extraDaily]);

    /** 목표 레벨까지 필요한 전체 심볼 수 / 가장 늦게 끝나는 심볼 */
    const summary = useMemo(() => {
        let totalRemaining = 0;
        let lastDate: Dayjs | null = null;
        let lastSymbol = "";
        ARCANE_SYMBOLS.forEach(({ name }) => {
            const input = inputs[name];
            totalRemaining += Math.max(
                0,
                neededSymbols(input.level, targetLevel) - input.count
            );
            const target = milestonesBySymbol[name]?.find(
                (m) => m.level === targetLevel
            );
            if (target) {
                const d = dayjs(target.dateReached);
                if (!lastDate || d.isAfter(lastDate)) {
                    lastDate = d;
                    lastSymbol = name;
                }
            }
        });
        return { totalRemaining, lastDate, lastSymbol };
    }, [inputs, targetLevel, milestonesBySymbol]);

    const lastDate = summary.lastDate as Dayjs | null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <Panel className="p-3 sm:p-5">
                <div className="mb-4 flex flex-wrap items-end gap-3 sm:gap-4">
                    <div>
                        <label
                            htmlFor="target-level"
                            className="mb-1 block text-xs font-medium text-muted"
                        >
                            목표 레벨
                        </label>
                        <select
                            id="target-level"
                            value={targetLevel}
                            onChange={(e) =>
                                setTargetLevel(parseInt(e.target.value))
                            }
                            className="rounded-lg border border-line/15 bg-raised/80 px-3 py-1.5 text-sm text-content outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                        >
                            {Array.from({ length: 19 }, (_, i) => i + 2).map(
                                (lv) => (
                                    <option key={lv} value={lv}>
                                        Lv.{lv}
                                        {lv === 20 ? " (만렙)" : ""}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="extra-daily"
                            className="mb-1 block text-xs font-medium text-muted"
                        >
                            일일 추가 획득 (이벤트/링크 등)
                        </label>
                        <NumberInput
                            id="extra-daily"
                            min={0}
                            value={extraDaily}
                            className="w-28"
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                setExtraDaily(
                                    Number.isNaN(v) ? 0 : Math.max(0, v)
                                );
                            }}
                        />
                    </div>
                    <p className="text-[11px] text-faint">
                        목요일마다 주간 보너스 +{ARCANE_WEEKLY_BONUS}개가 자동
                        반영돼요.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3">
                    {ARCANE_SYMBOLS.map((symbol) => (
                        <ArcaneSymbolCard
                            key={symbol.name}
                            symbol={symbol}
                            value={inputs[symbol.name]}
                            extraDaily={extraDaily}
                            targetLevel={targetLevel}
                            milestones={milestonesBySymbol[symbol.name]}
                            onChange={(key, v) =>
                                handleChange(symbol.name, key, v)
                            }
                        />
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
                    <StatTile
                        label={`Lv.${targetLevel}까지 남은 심볼 합계`}
                        value={`${summary.totalRemaining.toLocaleString()}개`}
                        tone="warn"
                    />
                    <StatTile
                        label="전체 목표 달성 예정일"
                        value={lastDate ? lastDate.format("YYYY.MM.DD") : "달성"}
                        tone="good"
                        sub={summary.lastSymbol || undefined}
                    />
                    <StatTile
                        label="남은 일수"
                        value={
                            lastDate
                                ? `${Math.max(
                                      0,
                                      lastDate.startOf("day").diff(
                                          dayjs().startOf("day"),
                                          "day"
                                      )
                                  )}일`
                                : "-"
                        }
                        tone="accent"
                    />
                </div>
            </Panel>

            <Panel className="p-3 sm:p-5">
                <h3 className="mb-3 text-sm font-bold text-content">
                    레벨 도달 달력
                </h3>
                <ArcaneSymbolCalendar milestonesBySymbol={milestonesBySymbol} />
            </Panel>

            <Panel className="p-3 sm:p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-content">
                        아케인 심볼 레벨업 필요량
                    </h3>
                    <GhostButton onClick={() => setShowTable((v) => !v)}>
                        {showTable ? "접기" : "펼치기"}
                    </GhostButton>
                </div>
                {showTable && (
                    <div className="mt-3">
                        <ArcaneLevelTableCompact />
                    </div>
                )}
            </Panel>
        </motion.div>
    );
};
