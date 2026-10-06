import type { Transition, Variants } from "framer-motion";

/**
 * 사이트 공통 모션 프리셋.
 *
 * 원칙
 *  - 짧고 가볍게: 등장은 140~220ms, 이동 거리는 6~10px 정도만.
 *  - 바운스 금지: spring 대신 ease-out 커브로 깔끔하게 멈춘다.
 *  - stagger 는 총 지연이 길어지지 않게 0.03s 수준으로만.
 *  - 모션 축소 설정은 layout 의 MotionConfig(reducedMotion="user") 가 처리한다.
 */

/** easeOutQuint 에 가까운 커브. CSS 쪽 --ease-out 과 동일하다. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const DUR = {
    fast: 0.14,
    base: 0.22,
    slow: 0.32,
} as const;

export const transition: Transition = {
    duration: DUR.base,
    ease: EASE_OUT,
};

export const fastTransition: Transition = {
    duration: DUR.fast,
    ease: EASE_OUT,
};

/** 단순 페이드 인 */
export const fade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition },
};

/** 아래에서 살짝 올라오며 등장 — 섹션/카드 기본값 */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition },
};

/** 목록 컨테이너: 자식들을 아주 짧은 간격으로 이어서 등장시킨다 */
export const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.03, delayChildren: 0.02 },
    },
};

/** staggerContainer 의 자식 */
export const staggerItem: Variants = fadeUp;

/** 드롭다운 / 팝오버 */
export const popover: Variants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: fastTransition },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: fastTransition },
};

/** 접히고 펴지는 영역 */
export const collapse: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition },
    exit: { opacity: 0, height: 0, transition: fastTransition },
};

/** 탭 전환처럼 내용이 교체되는 영역 */
export const swap: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition },
    exit: { opacity: 0, y: -4, transition: fastTransition },
};

/** 카드 호버/탭 — 과하지 않게 */
export const interactive = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.99 },
    transition: fastTransition,
} as const;
