"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Home, Sparkles } from "lucide-react";
import { SITE_SECTIONS, findPageByPath } from "@/config/site";
import { popover } from "@/config/motion";

/**
 * 모든 페이지에 공통으로 붙는 상단 바.
 * 어느 페이지에 있든 메뉴 하나로 다른 페이지로 바로 이동할 수 있게 한다.
 */
export function SiteHeader() {
    const pathname = usePathname() || "/";
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isHome = pathname === "/";
    const current = findPageByPath(pathname);

    // 라우트가 바뀌면 메뉴를 닫는다
    useEffect(() => setOpen(false), [pathname]);

    // 바깥 클릭 / ESC 로 닫기
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <header className="sticky top-0 z-50 border-b border-line/10 bg-bg/85 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 sm:px-6">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-extrabold tracking-tight text-content transition hover:bg-line/5"
                >
                    <Sparkles aria-hidden size={16} className="text-accent" />
                    <span>zzid&apos;s Doodle</span>
                </Link>

                {/* 현재 위치 */}
                {current && (
                    <>
                        <span aria-hidden className="text-faint">
                            /
                        </span>
                        <span className="min-w-0 truncate text-sm font-semibold text-accent">
                            {current.title}
                        </span>
                    </>
                )}

                <div className="flex-1" />

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-haspopup="menu"
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                            open
                                ? "border-accent/60 bg-accent/20 text-accent"
                                : "border-line/15 bg-line/5 text-content hover:border-accent/50 hover:bg-accent/10"
                        }`}
                    >
                        페이지
                        <ChevronDown
                            aria-hidden
                            size={14}
                            className={`transition-transform duration-fast ease-out ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <AnimatePresence>
                        {open && (
                            <motion.div
                                role="menu"
                                variants={popover}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute right-0 top-[calc(100%+8px)] max-h-[70vh] w-[min(88vw,320px)] overflow-y-auto rounded-xl border border-line/10 bg-surface/95 p-2 shadow-2xl shadow-black/50 backdrop-blur"
                            >
                                <Link
                                    href="/"
                                    role="menuitem"
                                    className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
                                        isHome
                                            ? "bg-accent/20 text-accent"
                                            : "text-muted hover:bg-line/5"
                                    }`}
                                >
                                    <Home aria-hidden size={15} /> 홈
                                </Link>

                                {SITE_SECTIONS.map((section) => (
                                    <div key={section.id} className="mt-1.5">
                                        <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                                            {section.label}
                                        </div>
                                        {section.pages.map((page) => {
                                            const active =
                                                current?.path === page.path;
                                            return (
                                                <Link
                                                    key={page.path}
                                                    href={page.path}
                                                    role="menuitem"
                                                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                                                        active
                                                            ? "bg-accent/20 font-semibold text-accent"
                                                            : "text-muted hover:bg-line/5"
                                                    }`}
                                                >
                                                    <span aria-hidden>
                                                        {page.emoji}
                                                    </span>
                                                    <span className="min-w-0 truncate">
                                                        {page.title}
                                                    </span>
                                                    {active && (
                                                        <span className="ml-auto text-[10px] text-accent">
                                                            현재
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
