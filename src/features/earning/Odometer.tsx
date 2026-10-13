import React, { useEffect, useRef, useState } from "react";

/**
 * 기계식 계수기처럼 연속으로 굴러가는 숫자.
 *
 * - 일의 자리는 값의 소수부까지 반영해 쉬지 않고 돈다.
 * - 윗자리는 아랫자리가 0 으로 넘어간 직후 짧은 구간 동안 스르륵 다음 숫자로 따라간다.
 * 각 자리는 0~9,0 숫자 띠를 세로로 쌓아 두고 translateY 로 위치만 옮긴다.
 */
function DigitWheel({ pos }: { pos: number }) {
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
 * 윗자리가 굴러가는 구간: 아랫자리가 0 으로 넘어간 "직후"부터
 * 그 자리 범위의 15% 동안 (단, 아무리 길어도 20원어치를 넘지 않게).
 * 예) 십의 자리는 x0원 → x1.5원, 백의 자리는 x00원 → x15원 동안 굴러간다.
 */
const ROLL_FRACTION = 0.15;
const ROLL_MAX = 20;
/** 처음과 끝이 부드러운 곡선 */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** 자리 k(10^k)의 바퀴 위치 0~10 */
function wheelPos(value: number, k: number, smooth: boolean) {
    const unit = 10 ** k;
    const digit = Math.floor(value / unit) % 10;
    // 정수(멈춰 있는 값)는 굴리지 않는다 — 넘김 직후 구간(x0~x1.5)에 걸려 숫자 사이에 멈추는 걸 막는다
    if (!smooth || Number.isInteger(value)) return digit;
    if (k === 0) return value % 10;
    const below = value % unit;
    const span = Math.min(unit * ROLL_FRACTION, ROLL_MAX);
    if (below >= span) return digit;
    // 직전 숫자(0 이면 9)에서 지금 숫자로 굴러가는 중. 9 → 0 은 띠 끝의 0(위치 10)으로 이어진다
    const prev = (digit + 9) % 10;
    return prev + smoothstep(below / span);
}

export function LiveOdometer({
    value,
    decimals = 0,
    className = "",
}: {
    value: number;
    /** 소수 자리 수 (예: 2 → "31.70") */
    decimals?: number;
    className?: string;
}) {
    const [smooth, setSmooth] = useState(true);
    useEffect(() => {
        // OS 의 "동작 줄이기" 를 켜 두면 정수로 끊어서 보여준다
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setSmooth(!mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // 소수 자리는 정수로 끌어올려 같은 바퀴 계산을 쓴다
    const v = Math.max(0, value) * 10 ** decimals;
    const digits = Math.max(decimals + 1, Math.floor(v).toString().length);
    const parts: React.ReactNode[] = [];
    for (let k = digits - 1; k >= 0; k--) {
        parts.push(<DigitWheel key={`d${k}`} pos={wheelPos(v, k, smooth)} />);
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

/**
 * 매 애니메이션 프레임마다 valueAt() 을 다시 계산한다.
 * win 을 주면 그 창의 requestAnimationFrame 을 쓴다 (미니 창은 원래 탭이 백그라운드여도 계속 돈다).
 */
export function useFrameValue(valueAt: () => number, win?: Window | null) {
    const fn = useRef(valueAt);
    fn.current = valueAt;
    const [value, setValue] = useState(() => valueAt());
    useEffect(() => {
        const w = win ?? window;
        let id = 0;
        const loop = () => {
            setValue(fn.current());
            id = w.requestAnimationFrame(loop);
        };
        id = w.requestAnimationFrame(loop);
        return () => w.cancelAnimationFrame(id);
    }, [win]);
    return value;
}
