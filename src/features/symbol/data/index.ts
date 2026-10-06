// 보스포스 지역
export const ATHENTIC_AREAS: { name: string; level: number }[] = [
    { name: "세르니움", level: 260 },
    { name: "아르크스", level: 265 },
    { name: "오디움", level: 270 },
    { name: "도원경", level: 275 },
    { name: "아르테리아", level: 280 },
    { name: "카르시온", level: 285 },
    { name: "탈라하트", level: 290 },
    { name: "기어드락", level: 295 },
];

// 어센틱 심볼 최대 레벨
export const AUTHENTIC_MAX_LEVEL = 11;

/**
 * 강화 비용(메소) 데이터가 아직 없는 지역.
 * Force 계산에는 포함하되, 비용은 "미확인"으로 따로 표기한다.
 * 신규 지역이 가격표보다 먼저 나오면 여기에 넣고, 가격을 확보하면
 * sorted_price_with_accumulated_only.json 에 추가한 뒤 다시 빼면 된다.
 */
export const AREAS_WITHOUT_PRICE_DATA: string[] = [];

/**
 * 어센틱심볼 n레벨 → (n+1)레벨 강화 비용 공식 (나무위키 어센틱포스 성장표).
 *
 *   비용 = floor(-5.4n³ + A·n² + B·n) × 100,000
 *
 * 일반 심볼은 세르니움부터 지역마다 A +16.2 / B +36,
 * 그랜드 심볼(탈라하트~)은 별도 계열로 지역마다 A +81 / B +180 씩 증가한다.
 * (현재 JSON 80건 전부 이 공식과 정확히 일치)
 */
export const SYMBOL_PRICE_COEFFICIENTS: Record<
    string,
    { a: number; b: number }
> = {
    세르니움: { a: 106.8, b: 264 },
    아르크스: { a: 123, b: 300 },
    오디움: { a: 139.2, b: 336 },
    도원경: { a: 155.4, b: 372 },
    아르테리아: { a: 171.6, b: 408 },
    카르시온: { a: 187.8, b: 444 },
    탈라하트: { a: 346.2, b: 796 },
    기어드락: { a: 427.2, b: 976 },
};

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
