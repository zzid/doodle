"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Home, Sparkles } from "lucide-react";
import { SITE_GROUPS, findGroupByPath, findPageByPath, visibleSections } from "@/config/site";
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
    const currentGroup = findGroupByPath(pathname);

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
                        {currentGroup && (
                            <>
                                <span className="hidden shrink-0 text-sm text-muted sm:inline">
                                    {currentGroup.label}
                                </span>
                                <span aria-hidden className="hidden text-faint sm:inline">
                                    /
                                </span>
                            </>
                        )}
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
                                className="absolute right-0 top-[calc(100%+8px)] max-h-[70vh] w-[min(88vw,320px)] overflow-y-auto rounded-xl border border-line/15 bg-surface p-2 shadow-2xl shadow-black/60"
                            >
                                <MenuLink href="/" active={isHome} icon={<Home aria-hidden size={15} />}>
                                    홈
                                </MenuLink>

                                {SITE_GROUPS.map((group) => (
                                    <div key={group.id} className="mt-2 border-t border-line/10 pt-2">
                                        {/* 그룹 제목: 클릭 불가 — 작고 흐린 라벨로만 */}
                                        <div className="px-2.5 pb-1 pt-0.5 text-[11px] font-medium text-faint">
                                            {group.label}
                                        </div>
                                        {visibleSections(group)
                                            .flatMap((section) => section.pages)
                                            .map((page) => (
                                                <MenuLink
                                                    key={page.path}
                                                    href={page.path}
                                                    active={current?.path === page.path}
                                                    icon={<span aria-hidden>{page.emoji}</span>}
                                                >
                                                    {page.title}
                                                </MenuLink>
                                            ))}
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

/** 메뉴의 클릭 가능한 행: 아이콘 타일 + 밝은 글씨 + 오른쪽 화살표 + hover 배경 */
function MenuLink({
    href,
    active,
    icon,
    children,
}: {
    href: string;
    active: boolean;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                active ? "bg-accent/15 text-accent" : "text-content hover:bg-line/[0.07]"
            }`}
        >
            <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[15px] ${
                    active ? "bg-accent/20" : "bg-line/[0.06] group-hover:bg-line/10"
                }`}
            >
                {icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{children}</span>
            {active ? (
                <span className="text-[10px] font-semibold">현재</span>
            ) : (
                <ChevronRight
                    aria-hidden
                    size={15}
                    className="shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-content"
                />
            )}
        </Link>
    );
}
