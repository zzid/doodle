import type React from "react";

/**
 * GitHub 라벨처럼: 이름 + 색(HEX) + 설명.
 * 할 일에는 라벨 이름만 저장하고, 이름을 바꾸면 할 일 쪽도 같이 바꾼다.
 */
export interface Label {
    name: string;
    /** "#rrggbb" */
    color: string;
    description: string;
}

/** GitHub 기본 라벨 색들. 자동으로 붙일 때 앞에서부터 쓰므로 이웃한 색끼리 확실히 다르게 둔다 */
export const LABEL_PRESETS = [
    "#0075ca",
    "#d73a4a",
    "#0e8a16",
    "#fbca04",
    "#7057ff",
    "#d93f0b",
    "#008672",
    "#d876e3",
    "#1d76db",
    "#e4e669",
    "#5319e7",
    "#a2eeef",
    "#b60205",
    "#c2e0c6",
    "#f9d0c4",
    "#cfd3d7",
];

export const isHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s);

export const randomColor = () =>
    `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;

/** 덜 쓴 프리셋부터 */
export function nextPreset(used: string[]) {
    const count = (c: string) => used.filter((u) => u.toLowerCase() === c).length;
    return [...LABEL_PRESETS].sort((a, b) => count(a) - count(b))[0];
}

const rgb = (hex: string) => {
    const n = parseInt((isHex(hex) ? hex : "#8b949e").slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** GitHub 다크 테마 라벨 모양: 옅은 배경 + 테두리 + 밝게 끌어올린 글자색 */
export function labelStyle(hex: string): React.CSSProperties {
    const [r, g, b] = rgb(hex);
    const mix = (c: number) => Math.round(c + (255 - c) * 0.45);
    return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.18)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
        color: `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`,
    };
}

/** 라벨 이름 정리: # 과 공백·쉼표 제거 */
export const cleanLabel = (s: string) => s.replace(/[#\s,]/g, "");
