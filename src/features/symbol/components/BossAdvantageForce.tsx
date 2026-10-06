import React, { useMemo, useState } from "react";
import { AssetIcon } from "./ui";
import rawData from "../data/advantage_force.json";
import { AnimatePresence, motion } from "framer-motion";

interface RawItem {
    name: string;
    min: number;
    max: number;
    /** 스프라이트를 구할 수 있는 보스만 존재. 없으면 이니셜 폴백. */
    image?: string;
    difficulty:
        | "Story"
        | "Easy"
        | "Normal"
        | "Hard"
        | "Extreme"
        | "Chaos"
        | "All";
}

const DIFFICULTY_STYLE: Record<RawItem["difficulty"], string> = {
    Story: "bg-teal-500/25 text-teal-200",
    Easy: "bg-zinc-500/25 text-content",
    Normal: "bg-sky-500/25 text-sky-200",
    Hard: "bg-rose-500/25 text-rose-200",
    Extreme: "bg-purple-500/30 text-purple-200",
    Chaos: "bg-red-500/25 text-red-200",
    All: "bg-line/10 text-muted",
};

export const BossAdvantageForce = ({
    selectedForce,
    setSelectedForce,
}: {
    selectedForce?: number;
    setSelectedForce: (force: number) => void;
}) => {
    const [open, setOpen] = useState(false);
    const bosses = useMemo(
        () =>
            [...(rawData as RawItem[])].sort(
                (a, b) => a.min - b.min || a.max - b.max
            ),
        []
    );

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-line/15 bg-line/5 px-3.5 py-2 text-sm font-semibold text-content transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                aria-expanded={open}
            >
                보스별 권장 Force 보기
                <span
                    className={`text-xs transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                >
                    ▼
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="boss-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
                            {bosses.map((item) => (
                                <div
                                    key={`${item.name}-${item.difficulty}`}
                                    className="rounded-xl border border-line/10 bg-line/[0.03] p-3"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <AssetIcon src={item.image} name={item.name} size={36} />
                                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-content">
                                            {item.name}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                DIFFICULTY_STYLE[
                                                    item.difficulty
                                                ]
                                            }`}
                                        >
                                            {item.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {(
                                            [
                                                ["권장", item.min],
                                                ["여유", item.max],
                                            ] as const
                                        ).map(([label, force]) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedForce(force);
                                                    setOpen(false);
                                                }}
                                                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums transition ${
                                                    selectedForce === force
                                                        ? "bg-accent-strong text-white"
                                                        : "bg-line/5 text-muted hover:bg-accent/20 hover:text-accent"
                                                }`}
                                            >
                                                <span className="mr-1 text-[11px] font-medium opacity-70">
                                                    {label}
                                                </span>
                                                {force}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
