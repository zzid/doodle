import { useEffect, useRef, useState } from "react";

/**
 * 매 애니메이션 프레임마다 valueAt() 을 다시 계산하고 다시 그린다.
 * 값이 그대로여도 매 프레임 그려서, Odometer 의 윗자리 감쇠가 끝까지 따라가게 한다.
 * win 을 주면 그 창의 requestAnimationFrame 을 쓴다 (미니 창은 원래 탭이 백그라운드여도 계속 돈다).
 */
export function useFrameValue(valueAt: () => number, win?: Window | null) {
    const fn = useRef(valueAt);
    fn.current = valueAt;
    const [frame, setFrame] = useState(() => ({ value: valueAt(), n: 0 }));
    useEffect(() => {
        const w = win ?? window;
        let id = 0;
        const loop = () => {
            setFrame((f) => ({ value: fn.current(), n: f.n + 1 }));
            id = w.requestAnimationFrame(loop);
        };
        id = w.requestAnimationFrame(loop);
        return () => w.cancelAnimationFrame(id);
    }, [win]);
    return frame.value;
}
