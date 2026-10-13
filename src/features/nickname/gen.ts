/**
 * 무작위 한글 두 글자 생성 (원본: hangul-random.html 의 로직 그대로).
 *
 * 한글 음절 = 0xAC00 + (초성 × 21 + 중성) × 28 + 종성.
 * 제외하지 않은 초성·모음·받침 조합에서 음절을 같은 확률로 고르고, 두 개를 이어 붙인다.
 */

export const LETTERS = {
    vowels: [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"],
    initials: [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"],
    finals: ["없음", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"],
} as const;

export type Group = keyof typeof LETTERS;
export const GROUPS: Group[] = ["vowels", "initials", "finals"];
export const GROUP_LABEL: Record<Group, string> = { vowels: "모음", initials: "초성", finals: "받침" };

/** 그룹별 "제외한" 글자 인덱스 */
export type Excluded = Record<Group, number[]>;

/** 원본 기본값: 모음 ㅑ ㅒ ㅕ ㅖ 제외 */
export const DEFAULT_EXCLUDED: Excluded = { vowels: [2, 3, 6, 7], initials: [], finals: [] };

/** 받침 모드: 상관없음 / 받침 없는 글자만 / 받침 있는 글자만 (받침 0번 = "없음") */
export type FinalMode = "any" | "none" | "has";
const REAL_FINALS = LETTERS.finals.map((_, i) => i).slice(1);

export function finalModeOf(ex: number[]): FinalMode {
    if (ex.includes(0)) return "has";
    return REAL_FINALS.every((i) => ex.includes(i)) ? "none" : "any";
}

/** 모드를 바꿨을 때의 받침 제외 목록. "받침 없는 글자만" = 실제 받침을 전부 제외 */
export function finalsForMode(mode: FinalMode, ex: number[]): number[] {
    const cur = finalModeOf(ex);
    // 개별로 골라 둔 받침 제외는 "상관없음 ↔ 있는 글자만" 사이에서 유지한다
    let picked = cur === "none" ? [] : ex.filter((i) => i !== 0);
    if (picked.length >= REAL_FINALS.length) picked = [];
    if (mode === "none") return [...REAL_FINALS];
    if (mode === "has") return [0, ...picked];
    return picked;
}

/** 제외하지 않은(사용할) 인덱스 */
export function activeOf(excluded: Excluded): Record<Group, number[]> {
    return {
        vowels: LETTERS.vowels.map((_, i) => i).filter((i) => !excluded.vowels.includes(i)),
        initials: LETTERS.initials.map((_, i) => i).filter((i) => !excluded.initials.includes(i)),
        finals: LETTERS.finals.map((_, i) => i).filter((i) => !excluded.finals.includes(i)),
    };
}

/** 나머지 연산 편향을 없애기 위해 범위 밖 난수는 버린다 */
function uniformIndex(max: number) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do crypto.getRandomValues(buf);
    while (buf[0] >= limit);
    return buf[0] % max;
}

function syllableAt(index: number, a: Record<Group, number[]>) {
    const final = a.finals[index % a.finals.length];
    const vowel = a.vowels[Math.floor(index / a.finals.length) % a.vowels.length];
    const initial = a.initials[Math.floor(index / (a.finals.length * a.vowels.length))];
    return String.fromCharCode(0xac00 + (initial * 21 + vowel) * 28 + final);
}

export const syllableCount = (a: Record<Group, number[]>) => a.initials.length * a.vowels.length * a.finals.length;

/**
 * count 개 생성. skip 에 든 단어(이미 있는 닉네임·후보)는 다시 뽑는다.
 * 남은 조합이 거의 없으면 무한히 돌지 않게 시도 횟수를 제한한다.
 */
export function generate(count: number, excluded: Excluded, skip: Set<string> = new Set()): string[] {
    const a = activeOf(excluded);
    const n = syllableCount(a);
    if (!n) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    let tries = 0;
    while (out.length < count && tries < count * 50) {
        tries++;
        const w = syllableAt(uniformIndex(n), a) + syllableAt(uniformIndex(n), a);
        if (skip.has(w) || seen.has(w)) continue;
        seen.add(w);
        out.push(w);
    }
    return out;
}

/** 닉네임 검색 — 넥슨 공식 랭킹 검색 (페이지 안 iframe 으로 띄울 수 있다. maple.gg 는 iframe 을 막는다) */
export const searchUrl = (name: string) =>
    `https://maplestory.nexon.com/N23Ranking/World/Total?c=${encodeURIComponent(name)}`;

export const sameExcluded = (a: Excluded, b: Excluded) =>
    GROUPS.every((g) => [...a[g]].sort().join() === [...b[g]].sort().join());
