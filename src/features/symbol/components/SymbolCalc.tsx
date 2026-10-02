import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BossForceCalc } from "./BossForceCalc";
import { ArcaneGrowth } from "./ArcaneGrowth";

type TTab = "bossforce" | "arcane";

const TABS: { key: TTab; label: string; hint: string }[] = [
    {
        key: "bossforce",
        label: "보스 어드밴티지 Force",
        hint: "어센틱 심볼 최소 비용",
    },
    { key: "arcane", label: "아케인 심볼 성장", hint: "만렙까지 며칠?" },
];

export const SymbolCalc = () => {
    const [tab, setTab] = useState<TTab>("bossforce");

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-50 sm:text-2xl">
                    심볼 계산기
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                    내 심볼 상태를 입력하면 목표까지 필요한 비용과 기간을
                    계산해요.
                </p>
            </header>

            <div
                role="tablist"
                aria-label="심볼 계산기 탭"
                className="mb-4 flex gap-1.5 rounded-xl border border-white/10 bg-zinc-900/60 p-1.5 sm:mb-5 sm:gap-2"
            >
                {TABS.map(({ key, label, hint }) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            className={`relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:px-3 sm:py-2.5 sm:text-sm ${
                                active
                                    ? "text-white"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId="symbol-tab-pill"
                                    className="absolute inset-0 rounded-lg bg-indigo-500/90 shadow-lg shadow-indigo-900/40"
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <span className="relative block">{label}</span>
                            <span
                                className={`relative mt-0.5 block text-[11px] font-normal ${
                                    active ? "text-indigo-100" : "text-zinc-500"
                                }`}
                            >
                                {hint}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {tab === "bossforce" ? <BossForceCalc /> : <ArcaneGrowth />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
