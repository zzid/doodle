// 보스포스 지역
export const ATHENTIC_AREAS: { name: string; level: number }[] = [
    { name: "세르니움", level: 260 },
    { name: "아르크스", level: 265 },
    { name: "오디움", level: 270 },
    { name: "도원경", level: 275 },
    { name: "아르테리아", level: 280 },
    { name: "카르시온", level: 285 },
    { name: "탈라하트", level: 290 },
];

// 어센틱 심볼 최대 레벨
export const AUTHENTIC_MAX_LEVEL = 11;

// 아케인 심볼 종류 (6개)
export const ARCANE_SYMBOLS = [
    { name: "소멸의 여로", defaultDaily: 20 },
    { name: "츄츄 아일랜드", defaultDaily: 20 },
    { name: "레헬른", defaultDaily: 20 },
    { name: "아르카나", defaultDaily: 20 },
    { name: "모라스", defaultDaily: 20 },
    { name: "에스페라", defaultDaily: 20 },
];
export const ARCANE_WEEKLY_BONUS = 120;
// Arcane(아케인 심볼) 데이터
export const ARCANE_LEVEL_TABLE = [
    { from: 1, to: 2, need: 12 },
    { from: 2, to: 3, need: 15 },
    { from: 3, to: 4, need: 20 },
    { from: 4, to: 5, need: 27 },
    { from: 5, to: 6, need: 36 },
    { from: 6, to: 7, need: 47 },
    { from: 7, to: 8, need: 60 },
    { from: 8, to: 9, need: 75 },
    { from: 9, to: 10, need: 92 },
    { from: 10, to: 11, need: 111 },
    { from: 11, to: 12, need: 132 },
    { from: 12, to: 13, need: 155 },
    { from: 13, to: 14, need: 180 },
    { from: 14, to: 15, need: 207 },
    { from: 15, to: 16, need: 236 },
    { from: 16, to: 17, need: 267 },
    { from: 17, to: 18, need: 300 },
    { from: 18, to: 19, need: 335 },
    { from: 19, to: 20, need: 372 },
];
