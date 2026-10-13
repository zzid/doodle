import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncAcrossTabs } from "@/utils/syncAcrossTabs";
import { DEFAULT_EXCLUDED, type Excluded, type Group } from "./gen";

export interface Candidate {
    word: string;
    /** 후보로 넣은 시각 (epoch ms) */
    at: number;
}

interface State {
    excluded: Excluded;
    quantity: number;
    /** 마지막으로 뽑은 결과 (새로고침해도 유지) */
    results: string[];
    /** 마지막으로 뽑을 때 쓴 제외 설정 — 지금 설정과 다르면 "적용하고 다시 뽑기" 를 띄운다 */
    rolledWith: Excluded;
    /** 없는 닉네임 → 사용할 후보 */
    candidates: Candidate[];
    /** 이미 있는 닉네임 → 다음 뽑기부터 제외 */
    taken: string[];
    toggleExcluded: (group: Group, index: number) => void;
    setExcluded: (group: Group, indices: number[]) => void;
    resetExcluded: () => void;
    setQuantity: (n: number) => void;
    setResults: (words: string[], rolledWith: Excluded) => void;
    addCandidate: (word: string) => void;
    removeCandidate: (word: string) => void;
    markTaken: (word: string) => void;
    unmarkTaken: (word: string) => void;
    clearTaken: () => void;
}

export const useNickname = create<State>()(
    persist(
        (set) => ({
            excluded: DEFAULT_EXCLUDED,
            quantity: 20,
            results: [],
            rolledWith: DEFAULT_EXCLUDED,
            candidates: [],
            taken: [],
            toggleExcluded: (group, index) =>
                set((s) => {
                    const cur = s.excluded[group];
                    return {
                        excluded: {
                            ...s.excluded,
                            [group]: cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index],
                        },
                    };
                }),
            setExcluded: (group, indices) => set((s) => ({ excluded: { ...s.excluded, [group]: indices } })),
            resetExcluded: () => set({ excluded: DEFAULT_EXCLUDED }),
            setQuantity: (quantity) => set({ quantity }),
            setResults: (results, rolledWith) => set({ results, rolledWith }),
            addCandidate: (word) =>
                set((s) =>
                    s.candidates.some((c) => c.word === word)
                        ? s
                        : {
                              candidates: [{ word, at: Date.now() }, ...s.candidates],
                              taken: s.taken.filter((w) => w !== word),
                          }
                ),
            removeCandidate: (word) => set((s) => ({ candidates: s.candidates.filter((c) => c.word !== word) })),
            markTaken: (word) =>
                set((s) => ({
                    taken: s.taken.includes(word) ? s.taken : [...s.taken, word],
                    candidates: s.candidates.filter((c) => c.word !== word),
                })),
            unmarkTaken: (word) => set((s) => ({ taken: s.taken.filter((w) => w !== word) })),
            clearTaken: () => set({ taken: [] }),
        }),
        { name: "doodle-nickname" }
    )
);

// 다른 탭에서 저장하면 바로 다시 읽어 와 저장 충돌을 막는다
syncAcrossTabs(useNickname);
