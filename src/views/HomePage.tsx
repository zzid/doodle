"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SITE_SECTIONS } from "@/config/site";
import { fadeUp, staggerContainer, staggerItem } from "@/config/motion";

export default function HomePage() {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <motion.header
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-10 sm:mb-14"
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
                    Doodle
                </h1>
                <p className="mt-2 text-sm text-muted sm:text-base">
                    메이플스토리 계산기와 실험용 컴포넌트를 모아둔 개인 작업
                    공간이에요.
                </p>
            </motion.header>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-10"
            >
                {SITE_SECTIONS.map((section) => (
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
        </div>
    );
}
