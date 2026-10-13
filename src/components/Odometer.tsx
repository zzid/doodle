import React, { useEffect, useRef, useState } from "react";

/**
 * 공통 오도미터 — 사이트의 모든 굴러가는 숫자는 이 컴포넌트 하나를 쓴다.
 *
 * 규칙은 하나뿐이고, 값의 크기·단위·소수 자리와 상관없이 똑같이 동작한다.
 *
 * 1) 기계식 자리 넘김
 *    맨 끝자리는 값의 소수부까지 반영해 연속으로 돈다.
 *    윗자리는 "바로 아랫자리가 9 → 0 으로 넘어가는 동안"에만, 아랫자리와 똑같은 비율로 같이 움직인다.
 *    이걸 위로 연쇄해서 계산하므로 1.99 → 2.00 처럼 여러 자리가 넘어갈 때 모두 정확히 같은 순간에 함께 굴러간다.
 *
 * 2) 부드럽게 따라가기
 *    끝자리가 빨리 도는 값은 넘김이 순식간에 끝나 뚝 끊겨 보이므로,
 *    윗자리는 1) 의 위치를 목표로 시간 기반 감쇠(SMOOTH_TAU)로 따라간다.
 *    넘어가는 자리들이 같은 목표를 같은 감쇠로 따라가니 동기화는 그대로이고, 스르륵 감속하며 멈춘다.
 *
 * 매 프레임 다시 그려야 하므로 useFrameValue 와 함께 쓴다.
 * OS 의 "동작 줄이기" 를 켜 두면 정수로 끊어서 보여준다.
 */

/** 윗자리가 목표 위치를 따라가는 시간 상수(초). 클수록 느긋하게 따라온다 */
const SMOOTH_TAU = 0.12;

/** 0~9,0 숫자 띠를 세로로 쌓아 두고 translateY 로 위치(0~10)만 옮긴다 */
function DigitStrip({ pos }: { pos: number }) {
    return (
        <span className="relative inline-block overflow-hidden align-bottom">
            {/* 자리 폭·높이 고정용 (tabular-nums 라 0 폭 = 모든 숫자 폭) */}
            <span className="invisible">0</span>
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 flex flex-col text-center will-change-transform"
                style={{ transform: `translateY(${-pos}em)` }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
                    <span key={i} className="block h-[1em] leading-none">
                        {d}
                    </span>
                ))}
            </span>
        </span>
    );
}

/**
 * 자리별 "펼친" 목표 위치 (계속 커지는 값. 화면 위치는 % 10).
 * k=0 은 값 그대로, k≥1 은 floor(v/10^k) + 아랫자리가 9→0 넘어가는 비율.
 */
function mechanicalTargets(v: number, digits: number) {
    const targets: number[] = [v];
    let lowerPos = v % 10; // 바로 아랫자리 바퀴 위치 0~10
    for (let k = 1; k < digits; k++) {
        const whole = Math.floor(v / 10 ** k);
        const carry = Math.max(0, lowerPos - 9); // 아랫자리가 9 를 지나 0 으로 가는 중인 만큼
        targets[k] = whole + carry;
        lowerPos = (whole % 10) + carry;
    }
    return targets;
}

function useReducedMotion() {
    const [reduce, setReduce] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduce(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return reduce;
}

export function Odometer({
    value,
    decimals = 0,
    className = "",
}: {
    value: number;
    /** 소수 자리 수 (예: 2 → "31.70") */
    decimals?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();

    // 소수 자리는 정수로 끌어올려 같은 계산을 쓴다
    const raw = Math.max(0, value) * 10 ** decimals;
    const v = reduce ? Math.floor(raw) : raw;
    const digits = Math.max(decimals + 1, Math.floor(v).toString().length);
    const targets = mechanicalTargets(v, digits);

    // 윗자리 감쇠 상태 (렌더마다 경과 시간만큼 목표로 다가간다)
    const state = useRef<{ t: number; s: number[] }>({ t: 0, s: [] });
    const now = performance.now();
    const dt = state.current.t ? Math.min(0.25, (now - state.current.t) / 1000) : 0;
    state.current.t = now;
    const alpha = 1 - Math.exp(-dt / SMOOTH_TAU);

    const positions = targets.map((target, k) => {
        if (k === 0) return target % 10;
        const prev = state.current.s[k];
        let s: number;
        // 처음이거나, 동작 줄이기거나, 값이 크게 바뀌면(설정 변경 등) 바로 맞춘다
        if (prev === undefined || reduce || Math.abs(target - prev) > 2) s = target;
        else {
            s = prev + (target - prev) * alpha;
            if (Math.abs(target - s) < 0.001) s = target;
        }
        state.current.s[k] = s;
        return ((s % 10) + 10) % 10;
    });

    const parts: React.ReactNode[] = [];
    for (let k = digits - 1; k >= 0; k--) {
        parts.push(<DigitStrip key={`d${k}`} pos={positions[k]} />);
        const intPos = k - decimals; // 정수부 기준 자리
        if (decimals && k === decimals) parts.push(<span key="dot">.</span>);
        else if (intPos > 0 && intPos % 3 === 0) parts.push(<span key={`c${k}`}>,</span>);
    }
    const label = Math.max(0, value).toLocaleString("ko-KR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return (
        <span className={`inline-flex tabular-nums leading-none ${className}`} aria-label={label}>
            {parts}
        </span>
    );
}
