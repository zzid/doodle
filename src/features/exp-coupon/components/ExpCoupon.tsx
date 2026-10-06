"use client";

import React, { useState } from "react";
import { NORMAL_EXP_COUPON, ADVANCED_EXP_COUPON } from "../data";

/**
 * 경험치 쿠폰 구간 비교.
 * 막대 높이는 데이터에 따라 달라지므로 height 만 인라인 스타일로 두고,
 * 나머지 표현은 전부 Tailwind 토큰 클래스로 처리한다.
 */

const barClass = (isActive: boolean) =>
    `relative cursor-pointer transition-colors duration-fast ease-out hover:bg-accent ${
        isActive ? "bg-accent-strong" : "bg-faint"
    }`;

export const ExpCoupon = () => {
    const [from, setFrom] = useState<number>(0);
    const [to, setTo] = useState<number>(0);
    const [sum, setSum] = useState<number>(0);

    const onClick = (idx: number) => {
        if (!!to) {
            setFrom(0);
            setTo(0);
            setSum(0);
            return setFrom(idx + 200);
        }
        if (!from) {
            return setFrom(idx + 200);
        }

        if (idx + 200 <= from) {
            setTo(from);
            setFrom(idx + 200);
            setSum(
                NORMAL_EXP_COUPON.slice(idx, from - 200).reduce(
                    (acc, v) => acc + v,
                    0
                )
            );
            return;
        }

        setSum(
            NORMAL_EXP_COUPON.slice(from - 200, idx).reduce(
                (acc, v) => acc + v,
                0
            )
        );
        return setTo(idx + 200);
    };

    const isActiveAt = (idx: number) =>
        (!!to && idx >= from - 200 && idx <= to - 200) ||
        idx === from - 200 ||
        idx === to - 200;

    return (
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <header className="mb-6">
                <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">
                    경험치 쿠폰 계산기
                </h1>
                <p className="mt-1 text-sm text-muted">
                    막대를 두 번 눌러 구간을 선택하면 필요 경험치 합계를
                    보여줘요.
                </p>
            </header>

            {/* 선택 결과 */}
            <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-line/10 bg-surface/60 px-4 py-3">
                <span className="text-sm text-muted">
                    구간{" "}
                    <b className="tabular-nums text-content">
                        {!!from && !!to ? `${from} ~ ${to + 1}` : "—"}
                    </b>
                </span>
                <span className="text-sm text-muted">
                    합계{" "}
                    <b className="tabular-nums text-accent">
                        {sum.toLocaleString()}
                    </b>
                </span>
            </div>

            {/* 일반 쿠폰 (200~249) */}
            <section className="mb-12">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">
                    일반 경험치 쿠폰
                </h2>
                <div className="flex flex-row items-end gap-[5px] overflow-x-auto pb-10">
                    {NORMAL_EXP_COUPON.slice(0, 50).map((v, idx) => (
                        <div
                            key={idx}
                            role="button"
                            tabIndex={0}
                            aria-label={`${200 + idx} → ${201 + idx} 구간`}
                            onClick={() => onClick(idx)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onClick(idx);
                                }
                            }}
                            style={{ height: v * 0.05 }}
                            className={`${barClass(
                                isActiveAt(idx)
                            )} w-2.5 shrink-0 text-[5px]`}
                        >
                            {v}
                            <span className="absolute -bottom-[30px] -left-0.5 text-[6px] font-bold text-content">
                                {`${200 + idx} -> ${201 + idx}`}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 상급 쿠폰 */}
            <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">
                    상급 경험치 쿠폰
                </h2>
                <div className="flex flex-row items-end gap-[5px] overflow-x-auto pb-10">
                    {ADVANCED_EXP_COUPON.map(({ level, required: v }, idx) => (
                        <div
                            key={level}
                            className="group relative inline-block shrink-0"
                        >
                            <div
                                style={{ height: v * 0.001 }}
                                className={`${barClass(
                                    isActiveAt(idx)
                                )} w-5 text-[5px]`}
                            >
                                <span className="absolute -bottom-[30px] -left-0.5 text-[10px] font-bold text-content">
                                    {`${level} -> ${level + 1}`}
                                </span>
                            </div>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute bottom-[125%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-fast group-hover:opacity-100"
                            >
                                {`필요 경험치: ${v.toLocaleString()}`}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
