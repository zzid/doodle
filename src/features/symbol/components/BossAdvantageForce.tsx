import React, { useMemo, useState } from "react";
import rawData from "../data/advantage_force.json";
import { AnimatePresence, motion } from "framer-motion";

interface RawItem {
    name: string;
    min: number;
    max: number;
    difficulty: "Easy" | "Normal" | "Hard" | "Extreme" | "Chaos" | "All";
}

const DIFFICULTY_STYLE: Record<RawItem["difficulty"], string> = {
    Easy: "bg-zinc-500/25 text-zinc-200",
    Normal: "bg-sky-500/25 text-sky-200",
    Hard: "bg-rose-500/25 text-rose-200",
    Extreme: "bg-purple-500/30 text-purple-200",
    Chaos: "bg-red-500/25 text-red-200",
    All: "bg-white/10 text-zinc-300",
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
        () => [...(rawData as RawItem[])].sort((a, b) => a.min - b.min),
        []
    );

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-100"
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
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-zinc-100">
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
                                                        ? "bg-indigo-500 text-white"
                                                        : "bg-white/5 text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-100"
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
