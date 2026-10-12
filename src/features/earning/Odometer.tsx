import React, { useEffect, useState } from "react";

/**
 * 숫자가 바뀔 때 자리마다 위로 굴러가는 카운터.
 *
 * framer-motion 대신 CSS 애니메이션을 쓴다. 미니 창(Picture-in-Picture)은 별도 document 라
 * 원래 탭이 백그라운드로 가면 JS 애니메이션 프레임이 멈추는데, CSS 애니메이션은 창마다 따로 돈다.
 */
function Digit({ d }: { d: string }) {
    const [state, setState] = useState({ cur: d, prev: "", n: 0 });

    useEffect(() => {
        setState((s) => (s.cur === d ? s : { cur: d, prev: s.cur, n: s.n + 1 }));
    }, [d]);

    const animate = state.n > 0;
    return (
        <span className="relative inline-block overflow-hidden align-bottom">
            {/* 자리 폭·높이 고정용 (tabular-nums 라 0 폭 = 모든 숫자 폭) */}
            <span className="invisible">0</span>
            {animate && (
                <span key={`o${state.n}`} aria-hidden className="absolute inset-0 animate-odo-out text-center">
                    {state.prev}
                </span>
            )}
            <span
                key={`i${state.n}`}
                className={`absolute inset-0 text-center ${animate ? "animate-odo-in" : ""}`}
            >
                {state.cur}
            </span>
        </span>
    );
}

export function Odometer({ value, className = "" }: { value: number; className?: string }) {
    const chars = Math.max(0, Math.floor(value)).toLocaleString("ko-KR").split("");
    return (
        <span className={`inline-flex tabular-nums leading-none ${className}`} aria-label={`${value}`}>
            {chars.map((c, i) => {
                // 오른쪽 자리 기준 key → 자릿수가 늘어나도 기존 자리가 다시 마운트되지 않는다
                const pos = chars.length - 1 - i;
                return /\d/.test(c) ? <Digit key={pos} d={c} /> : <span key={`s${pos}`}>{c}</span>;
            })}
        </span>
    );
}
