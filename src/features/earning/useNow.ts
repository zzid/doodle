import { useEffect, useState } from "react";

// 타이머가 정각보다 몇 ms 일찍 깨면 같은 초를 두 번 읽고 다음 초를 건너뛰므로 약간 늦게 깨운다
const msToNextSecond = (d: Date) => 1000 - d.getMilliseconds() + 20;

/**
 * 매 초 정각마다 갱신되는 현재 시각.
 * win 을 넘기면 그 창의 타이머를 쓴다 — 미니 창은 원래 탭이 백그라운드여도 타이머가 늦춰지지 않는다.
 */
export function useNow(win?: Window | null) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const w = win ?? window;
        let id: number;
        const tick = () => {
            const d = new Date();
            setNow(d);
            id = w.setTimeout(tick, msToNextSecond(d));
        };
        id = w.setTimeout(tick, msToNextSecond(new Date()));
        return () => w.clearTimeout(id);
    }, [win]);

    return now;
}
