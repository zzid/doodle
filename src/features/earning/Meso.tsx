import React from "react";
import { LiveOdometer } from "./Odometer";

/** 버섯 아이콘 (직접 그린 일반 버섯 — 게임 로고·리소스는 쓰지 않는다) */
export function MushroomIcon({ size = 16, muted }: { size?: number; muted?: boolean }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={`transition duration-base ${muted ? "opacity-35 grayscale" : ""}`}>
            {/* 갓 */}
            <path d="M2.5 12.5C2.5 6.8 6.8 3 12 3s9.5 3.8 9.5 9.5c0 .8-.6 1.3-1.4 1.3H3.9c-.8 0-1.4-.5-1.4-1.3Z" fill="#f2862a" />
            <circle cx="8" cy="8" r="1.8" fill="#fff4e0" />
            <circle cx="14.5" cy="6.3" r="1.3" fill="#fff4e0" />
            <circle cx="17" cy="10.4" r="1.5" fill="#fff4e0" />
            {/* 기둥 */}
            <path d="M7.5 13.8h9l-.7 5.6c-.2 1.2-1.2 2.1-2.4 2.1h-2.8c-1.2 0-2.2-.9-2.4-2.1l-.7-5.6Z" fill="#f6e3c3" />
            <circle cx="10.4" cy="17" r=".8" fill="#5b3a1e" />
            <circle cx="13.6" cy="17" r=".8" fill="#5b3a1e" />
        </svg>
    );
}

/** 원 → 메소 (1억 메소당 rate 원) */
export const wonToMeso = (won: number, rate: number) => (rate > 0 ? (won / rate) * 1e8 : 0);

/**
 * 연속으로 굴러가는 메소 표시: "31.70억".
 * 만 단위로 보여주면 끝자리가 초당 수십 바퀴 돌아 흐려지므로, 억 단위 소수 둘째 자리까지 굴린다.
 */
export function LiveMeso({ meso }: { meso: number }) {
    return (
        <span className="inline-flex items-baseline gap-0.5 tabular-nums">
            <LiveOdometer value={Math.max(0, meso) / 1e8} decimals={2} />
            <span>억</span>
        </span>
    );
}

/** 메소 → 재획 몇 분어치 (재획 30분당 farmEok30 억) */
export const farmMinutes = (meso: number, farmEok30: number) =>
    farmEok30 > 0 ? meso / ((farmEok30 * 1e8) / 30) : 0;

/** 분 → "26시간 40분" */
export function fmtFarmTime(min: number) {
    const m = Math.floor(min);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h && r) return `${h}시간 ${r}분`;
    if (h) return `${h}시간`;
    return `${r}분`;
}
