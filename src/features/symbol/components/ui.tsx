import React, { useState } from "react";
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
            className={`rounded-2xl border border-line/10 bg-surface/70 shadow-lg shadow-black/30 backdrop-blur ${className}`}
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
                    done ? "bg-accent/40" : "bg-line/10"
                }`}
            />
            <span
                aria-hidden
                className={`absolute left-0 top-4 hidden h-7 w-7 items-center justify-center rounded-full border text-xs font-bold sm:flex ${
                    done
                        ? "border-accent/60 bg-accent/20 text-accent"
                        : "border-line/15 bg-raised text-muted"
                }`}
            >
                {done ? "✓" : index}
            </span>

            <Panel className="p-3 sm:p-5">
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
                    <div>
                        <h2 className="text-base font-bold text-content sm:text-lg">
                            <span className="mr-2 text-accent sm:hidden">
                                {index}.
                            </span>
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-xs text-muted">
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
            className={`rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-raised disabled:text-faint ${className}`}
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
            className={`rounded-lg border border-line/15 bg-line/5 px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent ${className}`}
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
        default: "text-content",
        accent: "text-accent",
        warn: "text-warn",
        good: "text-good",
    }[tone];
    return (
        <div className="rounded-xl border border-line/10 bg-line/[0.03] px-2.5 py-2 sm:px-3 sm:py-2.5">
            <div className="text-[10px] font-medium text-muted sm:text-[11px]">
                {label}
            </div>
            <div
                className={`mt-0.5 text-base font-bold tabular-nums sm:text-lg ${toneClass}`}
            >
                {value}
            </div>
            {sub && (
                <div className="mt-0.5 text-[10px] text-faint sm:text-[11px]">
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
            // no-spinner: 스피너가 차지하는 폭 때문에 두 자리가 잘리는 걸 막는다
            className={`no-spinner rounded-lg border border-line/15 bg-raised/80 px-2.5 py-1.5 text-sm font-medium tabular-nums text-content outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 ${className}`}
        />
    );
}

/**
 * 에셋 이미지 공통 컴포넌트.
 *
 * maplestory.io 에서 받아 public/ 에 넣어둔 스프라이트를 쓴다(런타임 외부 의존 없음).
 * 아직 스프라이트를 구할 수 없는 대상(그랜드 심볼, 신규 보스)은 이름 이니셜로 폴백해
 * 레이아웃이 깨지지 않게 한다.
 */
export function AssetIcon({
    src,
    name,
    size = 36,
    className = "",
    hideWhenMissing = false,
}: {
    src?: string;
    name: string;
    size?: number;
    className?: string;
    /** 이미지가 없을 때 이니셜 대신 아예 렌더하지 않는다(테두리 없는 인라인 자리) */
    hideWhenMissing?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const show = !!src && !failed;

    if (!show && hideWhenMissing) return null;

    return (
        <span
            style={{ width: size, height: size }}
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line/10 bg-line/5 ${className}`}
        >
            {show ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-0.5"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span
                    aria-hidden
                    className="text-[11px] font-bold text-faint"
                    style={{ fontSize: Math.max(10, size * 0.34) }}
                >
                    {name.replace(/\s/g, "").slice(0, 1)}
                </span>
            )}
        </span>
    );
}
