import React from "react";
import { motion } from "framer-motion";

/**
 * 심볼 계산기 공통 UI 조각.
 * 앱 셸이 항상 다크 배경이므로 다크 팔레트 기준으로만 색을 지정한다.
 */

export function Panel({
    className = "",
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/30 backdrop-blur ${className}`}
        >
            {children}
        </div>
    );
}

/** 단계가 아래로 쌓이는 스텝 카드 */
export function StepCard({
    index,
    title,
    description,
    done,
    right,
    children,
}: {
    index: number;
    title: string;
    description?: string;
    done?: boolean;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <motion.section
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative pl-0 sm:pl-12"
        >
            {/* 좌측 스텝 레일 (데스크톱) */}
            <span
                aria-hidden
                className={`absolute left-[14px] top-10 hidden h-[calc(100%-8px)] w-px sm:block ${
                    done ? "bg-indigo-500/40" : "bg-white/10"
                }`}
            />
            <span
                aria-hidden
                className={`absolute left-0 top-4 hidden h-7 w-7 items-center justify-center rounded-full border text-xs font-bold sm:flex ${
                    done
                        ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
                        : "border-white/15 bg-zinc-800 text-zinc-400"
                }`}
            >
                {done ? "✓" : index}
            </span>

            <Panel className="p-3 sm:p-5">
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
                    <div>
                        <h2 className="text-base font-bold text-zinc-100 sm:text-lg">
                            <span className="mr-2 text-indigo-400 sm:hidden">
                                {index}.
                            </span>
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-xs text-zinc-400">
                                {description}
                            </p>
                        )}
                    </div>
                    {right}
                </header>
                {children}
            </Panel>
        </motion.section>
    );
}

export function PrimaryButton({
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500 ${className}`}
        />
    );
}

export function GhostButton({
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-200 ${className}`}
        />
    );
}

/** 숫자/요약값 강조 타일 */
export function StatTile({
    label,
    value,
    sub,
    tone = "default",
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    tone?: "default" | "accent" | "warn" | "good";
}) {
    const toneClass = {
        default: "text-zinc-100",
        accent: "text-indigo-300",
        warn: "text-amber-300",
        good: "text-emerald-300",
    }[tone];
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 sm:px-3 sm:py-2.5">
            <div className="text-[10px] font-medium text-zinc-400 sm:text-[11px]">
                {label}
            </div>
            <div
                className={`mt-0.5 text-base font-bold tabular-nums sm:text-lg ${toneClass}`}
            >
                {value}
            </div>
            {sub && (
                <div className="mt-0.5 text-[10px] text-zinc-500 sm:text-[11px]">
                    {sub}
                </div>
            )}
        </div>
    );
}

export function NumberInput({
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            type="number"
            inputMode="numeric"
            onFocus={(e) => e.currentTarget.select()}
            {...props}
            className={`rounded-lg border border-white/15 bg-zinc-800/80 px-2.5 py-1.5 text-sm font-medium tabular-nums text-zinc-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 ${className}`}
        />
    );
}
