"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SITE_GROUPS, type SiteGroup, visibleSections } from "@/config/site";
import { fadeUp, staggerContainer, staggerItem } from "@/config/motion";

const TAB_KEY = "doodle-home-tab";

function readTab(): SiteGroup["id"] {
    try {
        const v = localStorage.getItem(TAB_KEY);
        if (v === "personal" || v === "game") return v;
    } catch {}
    return "personal";
}

export default function HomePage() {
    const [tab, setTab] = useState<SiteGroup["id"]>(readTab);
    useEffect(() => {
        try {
            localStorage.setItem(TAB_KEY, tab);
        } catch {}
    }, [tab]);

    const group = SITE_GROUPS.find((g) => g.id === tab)!;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <motion.header
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8 sm:mb-10"
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
                    Doodle
                </h1>
                <p className="mt-2 text-sm text-muted sm:text-base">
                    기록 도구, 실험용 컴포넌트, 게임 유틸을 모아둔 개인 작업 공간이에요.
                </p>
            </motion.header>

            {/* 그룹 탭 */}
            <div
                role="tablist"
                aria-label="페이지 그룹"
                className="mb-8 grid grid-cols-2 gap-1.5 rounded-2xl border border-line/10 bg-surface/60 p-1.5 sm:inline-grid sm:min-w-[420px]"
            >
                {SITE_GROUPS.map((g) => {
                    const active = g.id === tab;
                    const count = visibleSections(g).reduce((n, s) => n + s.pages.length, 0);
                    return (
                        <button
                            key={g.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(g.id)}
                            className={`relative rounded-xl px-4 py-2.5 text-left transition ${
                                active ? "text-white" : "text-muted hover:text-content"
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId="home-group-pill"
                                    className="absolute inset-0 rounded-xl bg-accent-strong shadow-lg shadow-black/40"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2 text-sm font-bold">
                                <span aria-hidden>{g.emoji}</span>
                                {g.label}
                                <span
                                    className={`ml-auto rounded-full px-1.5 text-[11px] tabular-nums ${
                                        active ? "bg-white/20" : "bg-line/10 text-faint"
                                    }`}
                                >
                                    {count}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={group.id}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                    className="space-y-10"
                >
                    <motion.p variants={staggerItem} className="-mt-3 text-sm text-faint">
                        {group.description}
                    </motion.p>

                    {visibleSections(group).map((section) => (
                        <section key={section.id}>
                            <motion.h2
                                variants={staggerItem}
                                className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-faint"
                            >
                                {section.label}
                                <span className="h-px flex-1 bg-line/10" />
                            </motion.h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {section.pages.map((page) => (
                                    <motion.div
                                        key={page.path}
                                        variants={staggerItem}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <Link
                                            href={page.path}
                                            className="group flex h-full flex-col rounded-2xl border border-line/10 bg-surface/60 p-4 transition-colors duration-fast ease-out hover:border-accent/40 hover:bg-accent/[0.06] sm:p-5"
                                        >
                                            <div className="mb-1.5 flex items-center gap-2">
                                                <span aria-hidden className="text-lg">
                                                    {page.emoji}
                                                </span>
                                                <h3 className="font-bold text-content">
                                                    {page.title}
                                                </h3>
                                                <ArrowUpRight
                                                    aria-hidden
                                                    size={16}
                                                    className="ml-auto shrink-0 text-faint transition-colors duration-fast group-hover:text-accent"
                                                />
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted">
                                                {page.description}
                                            </p>
                                            <code className="mt-3 text-[11px] text-faint">
                                                {page.path}
                                            </code>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
