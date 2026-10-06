/**
 * 디자인 토큰 JS 접근자.
 *
 * 실제 값은 src/styles/index.css 의 CSS 변수가 단일 소스다.
 * 여기서는 `rgb(var(--c-x) / a)` 문자열만 만들어 주므로 값이 중복되지 않고,
 * CSS 쪽을 고치면 JS 쪽도 자동으로 따라온다.
 *
 * Tailwind 클래스로 표현 가능한 곳은 Tailwind 를 쓰고(bg-surface, text-accent …),
 * 이 모듈은 런타임에 색을 조립해야 하는 곳(캘린더 colors 객체 등)에만 쓴다.
 */

export type TokenName =
    | "bg"
    | "surface"
    | "raised"
    | "text"
    | "muted"
    | "faint"
    | "accent"
    | "accent-strong"
    | "warn"
    | "good"
    | "danger"
    | "line";

/** 토큰 색을 CSS 색상 문자열로. alpha 를 주면 반투명으로. */
export function token(name: TokenName, alpha?: number): string {
    return alpha === undefined
        ? `rgb(var(--c-${name}))`
        : `rgb(var(--c-${name}) / ${alpha})`;
}

/** 자주 쓰는 조합 */
export const surfaceBg = token("surface", 0.7);
export const subtleBg = token("line", 0.03);
export const hoverBg = token("line", 0.06);
export const borderColor = token("line", 0.1);
export const borderStrong = token("line", 0.15);
