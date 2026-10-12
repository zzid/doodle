import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------- 장비 ---------- */

/** 5중 나생문: 장비 한 부위에서 채워 가는 다섯 가지 */
export const TRACKS = ["star", "flame", "pot", "add", "scroll"] as const;
export type Track = (typeof TRACKS)[number];
export const TRACK_LABEL: Record<Track, string> = {
    star: "별",
    flame: "추옵",
    pot: "잠재",
    add: "아랫잠재",
    scroll: "주문서작",
};
export const TRACK_PLACEHOLDER: Record<Track, string> = {
    star: "예: 22성",
    flame: "예: 160 이상",
    pot: "예: 보공 3줄",
    add: "예: 공 2줄",
    scroll: "예: 놀장 / 주흔 15%",
};

/**
 * 장비창 배치 (5열 × 6행, 게임 장비창과 비슷하게). null 은 빈 칸.
 */
export const SLOT_GRID: (string | null)[][] = [
    ["반지1", null, "모자", null, "엠블렘"],
    ["반지2", "펜던트1", "얼굴장식", null, "뱃지"],
    ["반지3", "펜던트2", "눈장식", "귀고리", "훈장"],
    ["반지4", "무기", "상의", "어깨장식", "보조무기"],
    ["포켓", "벨트", "하의", "장갑", "망토"],
    [null, null, "신발", "안드로이드", "기계심장"],
];

/** 잠재 등급 (게임 색) */
export const GRADES = ["레어", "에픽", "유니크", "레전드리"] as const;
export type Grade = (typeof GRADES)[number];
export const GRADE_COLOR: Record<Grade, string> = {
    레어: "#3ab0ff",
    에픽: "#a463f2",
    유니크: "#ffb400",
    레전드리: "#7ce316",
};

export interface TrackGoal {
    goal: string;
    done: boolean;
}

export interface GearSlot {
    /** 아이템 이름 (선택) */
    item: string;
    /** 잠재 목표 등급 → 슬롯 테두리 색 */
    potGrade?: Grade;
    /** 아랫잠재 목표 등급 */
    addGrade?: Grade;
    tracks: Partial<Record<Track, TrackGoal>>;
}

/* ---------- 내실 ---------- */

export interface Ability {
    /** 목표 등급 */
    grade?: Grade;
    /** 목표 옵션 3줄 */
    lines: [string, string, string];
    done: boolean;
}

export const INNER_CATEGORIES = ["레벨", "심볼", "스킬·코어", "유니온", "링크", "하이퍼스탯", "기타"];

export interface InnerItem {
    id: string;
    category: string;
    text: string;
    done: boolean;
}

export interface Character {
    id: string;
    name: string;
    /** 카드 접힘 */
    collapsed?: boolean;
    gear: Record<string, GearSlot>;
    ability: Ability;
    inner: InnerItem[];
}

const newId = () => Math.random().toString(36).slice(2, 10);

export const emptySlot = (): GearSlot => ({ item: "", tracks: {} });

/** 슬롯 진행: 목표를 정한 항목 수 / 그중 완료 수 */
export function slotProgress(slot?: GearSlot) {
    const goals = TRACKS.filter((t) => slot?.tracks[t]?.goal);
    return { total: goals.length, done: goals.filter((t) => slot?.tracks[t]?.done).length };
}

/** 캐릭터 전체 목표 수 / 남은 수 (장비 목표 + 어빌 + 기타 내실) */
export function charStats(c: Character) {
    let total = 0;
    let open = 0;
    for (const slot of Object.values(c.gear)) {
        const p = slotProgress(slot);
        total += p.total;
        open += p.total - p.done;
    }
    const ab = c.ability;
    if (ab.grade || ab.lines.some(Boolean)) {
        total += 1;
        if (!ab.done) open += 1;
    }
    total += c.inner.length;
    open += c.inner.filter((i) => !i.done).length;
    return { total, open };
}

interface State {
    characters: Character[];
    addCharacter: (name: string) => void;
    renameCharacter: (id: string, name: string) => void;
    toggleCollapsed: (id: string) => void;
    removeCharacter: (id: string) => void;
    /** 장비 슬롯 수정 */
    updateSlot: (charId: string, slot: string, patch: Partial<GearSlot>) => void;
    setTrack: (charId: string, slot: string, track: Track, patch: Partial<TrackGoal>) => void;
    clearSlot: (charId: string, slot: string) => void;
    updateAbility: (charId: string, patch: Partial<Ability>) => void;
    addInner: (charId: string, category: string, text: string) => void;
    toggleInner: (charId: string, id: string) => void;
    removeInner: (charId: string, id: string) => void;
}

const mapChar = (s: State, id: string, fn: (c: Character) => Character) => ({
    characters: s.characters.map((c) => (c.id === id ? fn(c) : c)),
});

export const useMapleTodo = create<State>()(
    persist(
        (set) => ({
            characters: [],
            addCharacter: (name) => {
                const id = newId();
                set((s) => ({
                    characters: [
                        ...s.characters,
                        { id, name, gear: {}, ability: { lines: ["", "", ""], done: false }, inner: [] },
                    ],
                }));
            },
            renameCharacter: (id, name) => set((s) => mapChar(s, id, (c) => ({ ...c, name }))),
            toggleCollapsed: (id) => set((s) => mapChar(s, id, (c) => ({ ...c, collapsed: !c.collapsed }))),
            removeCharacter: (id) => set((s) => ({ characters: s.characters.filter((c) => c.id !== id) })),
            updateSlot: (charId, slot, patch) =>
                set((s) =>
                    mapChar(s, charId, (c) => ({
                        ...c,
                        gear: { ...c.gear, [slot]: { ...(c.gear[slot] ?? emptySlot()), ...patch } },
                    }))
                ),
            setTrack: (charId, slot, track, patch) =>
                set((s) =>
                    mapChar(s, charId, (c) => {
                        const cur = c.gear[slot] ?? emptySlot();
                        const prev = cur.tracks[track] ?? { goal: "", done: false };
                        return {
                            ...c,
                            gear: { ...c.gear, [slot]: { ...cur, tracks: { ...cur.tracks, [track]: { ...prev, ...patch } } } },
                        };
                    })
                ),
            clearSlot: (charId, slot) =>
                set((s) =>
                    mapChar(s, charId, (c) => {
                        const { [slot]: _, ...gear } = c.gear;
                        return { ...c, gear };
                    })
                ),
            updateAbility: (charId, patch) =>
                set((s) => mapChar(s, charId, (c) => ({ ...c, ability: { ...c.ability, ...patch } }))),
            addInner: (charId, category, text) =>
                set((s) =>
                    mapChar(s, charId, (c) => ({
                        ...c,
                        inner: [...c.inner, { id: newId(), category, text, done: false }],
                    }))
                ),
            toggleInner: (charId, id) =>
                set((s) =>
                    mapChar(s, charId, (c) => ({
                        ...c,
                        inner: c.inner.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
                    }))
                ),
            removeInner: (charId, id) =>
                set((s) => mapChar(s, charId, (c) => ({ ...c, inner: c.inner.filter((i) => i.id !== id) }))),
        }),
        {
            name: "doodle-maple-todo",
            version: 1,
            // v0 (분류+텍스트 체크리스트) → v1: 장비는 슬롯 구조로, 내실 항목은 그대로 옮긴다
            migrate: (persisted: any) => {
                const chars = (persisted?.characters ?? []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    gear: {},
                    ability: { lines: ["", "", ""], done: false },
                    inner: (c.items ?? [])
                        .filter((i: any) => i.area === "inner")
                        .map((i: any) => ({ id: i.id, category: i.category, text: i.text, done: i.done })),
                }));
                return { characters: chars } as State;
            },
        }
    )
);
