import { dayjs } from "@/dayjs/dayjs";
import { HOLIDAYS } from "./holidays";

/**
 * 초과근로 수당 / 보상휴가 계산.
 *
 * 사내 규정
 * - 연장(평일):  22시까지 150%, 22시 이후(~06시) 200%
 * - 토요일:      150% (22시 이후는 연장 야간과 동일하게 200%)
 * - 휴일(일요일·법정공휴일·약정휴일)
 *     휴일연장 8시간 이내 150% / 초과 200%
 *     휴일야간 8시간 이내 200% / 초과 250%
 *
 * 자정을 넘기면 자정 이후 분은 익일 날짜의 구분(평일/토/휴일)으로 계산한다.
 *
 * 모든 계산은 분 단위로 하고, 근무 시간을 시간순 "분 배열"(true = 야간)로 펼친 뒤
 * 분마다 카테고리를 매긴다. 그래서 자정을 넘기거나 휴일 8시간 경계를 걸치는 경우도
 * 같은 로직으로 처리된다.
 */

export type DayType = "weekday" | "saturday" | "holiday";
export type Comp = "pay" | "leave";
export interface Entry {
    /** 시작 시각 "HH:mm" (24시간) */
    start: string;
    /** 실근로 시간(휴게 제외) */
    hours: number;
    /** 휴게시간(분) */
    breakMin: number;
    comp: Comp;
    /** 시작일의 자동 판정(요일·공휴일)을 덮어쓸 때만 설정 */
    dayType?: DayType;
    memo?: string;
}

export type Category =
    | "ext"
    | "extNight"
    | "sat"
    | "satNight"
    | "hol"
    | "holOver"
    | "holNight"
    | "holNightOver";

export const CATEGORIES: Record<Category, { label: string; rate: number }> = {
    ext: { label: "평일 연장", rate: 1.5 },
    extNight: { label: "평일 연장 (22시 이후)", rate: 2.0 },
    sat: { label: "토요일", rate: 1.5 },
    satNight: { label: "토요일 (22시 이후)", rate: 2.0 },
    hol: { label: "휴일연장 8h 이내", rate: 1.5 },
    holOver: { label: "휴일연장 8h 초과", rate: 2.0 },
    holNight: { label: "휴일야간 8h 이내", rate: 2.0 },
    holNightOver: { label: "휴일야간 8h 초과", rate: 2.5 },
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as Category[];

export const DAY_TYPE_LABEL: Record<DayType, string> = {
    weekday: "평일",
    saturday: "토요일",
    holiday: "휴일",
};

const NIGHT_START = 22 * 60;
const NIGHT_END = 6 * 60;
const HOLIDAY_BASE_MIN = 8 * 60;

export type CatMinutes = Record<Category, number>;

export const emptyCat = (): CatMinutes => ({
    ext: 0,
    extNight: 0,
    sat: 0,
    satNight: 0,
    hol: 0,
    holOver: 0,
    holNight: 0,
    holNightOver: 0,
});

export function autoDayType(date: string): DayType {
    if (HOLIDAYS[date]) return "holiday";
    const dow = dayjs(date).day();
    if (dow === 0) return "holiday";
    if (dow === 6) return "saturday";
    return "weekday";
}

export const dayTypeOf = (date: string, entry?: Entry): DayType =>
    entry?.dayType ?? autoDayType(date);

export function toMin(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}

const isNight = (m: number) => {
    const t = ((m % 1440) + 1440) % 1440;
    return t >= NIGHT_START || t < NIGHT_END;
};

export const MAX_HOURS = 24;

const clampHours = (h: number) => Math.min(MAX_HOURS, Math.max(0, h || 0));

/** 시작일 0시 기준 분 단위 [시작, 종료). 종료가 1440 이상이면 익일 */
export function entrySpan(entry: Entry): { startMin: number; endMin: number } {
    const startMin = toMin(entry.start);
    const work = Math.round(clampHours(entry.hours) * 60);
    const brk = Math.max(0, Math.round(entry.breakMin || 0));
    return { startMin, endMin: startMin + work + brk };
}

/** 분 → "HH:mm", 익일이면 nextDay = true */
export function fmtClock(min: number): { text: string; nextDay: boolean } {
    const t = ((min % 1440) + 1440) % 1440;
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    return { text: `${hh}:${mm}`, nextDay: min >= 1440 };
}

interface WorkMinute {
    night: boolean;
    /** 이 분이 속한 날짜(시작일/익일)의 근무일 구분 */
    dayType: DayType;
}

/**
 * 근무 시간을 시간순 분 배열로.
 * 자정을 넘긴 분은 익일 날짜 기준으로 근무일 구분을 다시 매긴다.
 *   (예: 일요일 20시~월요일 02시 → 자정 전은 휴일근로, 자정 후는 평일 연장)
 */
function toMinuteTimeline(date: string, entry: Entry): WorkMinute[] {
    const { startMin, endMin } = entrySpan(entry);
    const firstType = dayTypeOf(date, entry);
    const nextType = autoDayType(dayjs(date).add(1, "day").format("YYYY-MM-DD"));

    const minutes: WorkMinute[] = [];
    for (let m = startMin; m < endMin; m++) {
        minutes.push({ night: isNight(m), dayType: m < 1440 ? firstType : nextType });
    }

    // 휴게시간 차감: 시작 4시간 이후의 주간 → 그 이전 주간 → 야간(뒤에서부터) 순
    let remain = Math.min(Math.max(0, Math.round(entry.breakMin || 0)), minutes.length);
    const removed = new Set<number>();
    const take = (idxs: number[]) => {
        for (const i of idxs) {
            if (remain <= 0) return;
            if (removed.has(i)) continue;
            removed.add(i);
            remain--;
        }
    };
    const idx = minutes.map((_, i) => i);
    take(idx.filter((i) => i >= 240 && !minutes[i].night));
    take(idx.filter((i) => i < 240 && !minutes[i].night).reverse());
    take(idx.filter((i) => minutes[i].night).reverse());
    return minutes.filter((_, i) => !removed.has(i));
}

export interface EntryResult {
    dayType: DayType;
    totalMin: number;
    nightMin: number;
    /** 익일로 넘어간 근로(분) */
    nextDayMin: number;
    byCat: CatMinutes;
    /** 가산율 반영 시간(분) */
    weightedMin: number;
}

export function evaluateEntry(date: string, entry: Entry): EntryResult {
    const timeline = toMinuteTimeline(date, entry);
    const byCat = emptyCat();
    const { startMin } = entrySpan(entry);
    let holidayMin = 0; // 휴일 8시간 경계는 휴일에 해당하는 분만 센다

    timeline.forEach(({ night, dayType }) => {
        let cat: Category;
        if (dayType === "weekday") cat = night ? "extNight" : "ext";
        else if (dayType === "saturday") cat = night ? "satNight" : "sat";
        else {
            const over = holidayMin++ >= HOLIDAY_BASE_MIN;
            cat = night
                ? over ? "holNightOver" : "holNight"
                : over ? "holOver" : "hol";
        }
        byCat[cat]++;
    });

    const { endMin } = entrySpan(entry);
    return {
        dayType: dayTypeOf(date, entry),
        totalMin: timeline.length,
        nightMin: timeline.filter((m) => m.night).length,
        nextDayMin: Math.max(0, endMin - Math.max(startMin, 1440)),
        byCat,
        weightedMin: weighted(byCat),
    };
}

export const weighted = (byCat: CatMinutes) =>
    CATEGORY_ORDER.reduce((sum, c) => sum + byCat[c] * CATEGORIES[c].rate, 0);

const sumCat = (a: CatMinutes, b: CatMinutes): CatMinutes => {
    const out = emptyCat();
    for (const c of CATEGORY_ORDER) out[c] = a[c] + b[c];
    return out;
};

export interface MonthSummary {
    days: number;
    totalMin: number;
    pay: { byCat: CatMinutes; totalMin: number; weightedMin: number; amount: number };
    leave: { byCat: CatMinutes; totalMin: number; weightedMin: number; leaveMin: number };
}

export function summarizeMonth(
    entries: Record<string, Entry>,
    month: string, // "YYYY-MM"
    hourlyWage: number,
    leaveWeighted: boolean
): MonthSummary {
    let payCat = emptyCat();
    let leaveCat = emptyCat();
    let days = 0;
    for (const [date, entry] of Object.entries(entries)) {
        if (!date.startsWith(month)) continue;
        const r = evaluateEntry(date, entry);
        if (r.totalMin <= 0) continue;
        days++;
        if (entry.comp === "pay") payCat = sumCat(payCat, r.byCat);
        else leaveCat = sumCat(leaveCat, r.byCat);
    }
    const total = (c: CatMinutes) => CATEGORY_ORDER.reduce((s, k) => s + c[k], 0);
    const payWeighted = weighted(payCat);
    const leaveWeightedMin = weighted(leaveCat);
    return {
        days,
        totalMin: total(payCat) + total(leaveCat),
        pay: {
            byCat: payCat,
            totalMin: total(payCat),
            weightedMin: payWeighted,
            amount: Math.round((payWeighted / 60) * hourlyWage),
        },
        leave: {
            byCat: leaveCat,
            totalMin: total(leaveCat),
            weightedMin: leaveWeightedMin,
            leaveMin: leaveWeighted ? leaveWeightedMin : total(leaveCat),
        },
    };
}

/** 연봉 → 통상시급 (월 소정근로 209시간 기준) */
export const MONTHLY_BASE_HOURS = 209;
export const hourlyFromSalary = (salary: number) =>
    salary > 0 ? salary / 12 / MONTHLY_BASE_HOURS : 0;

/* ---------- 표시용 ---------- */

/** 금액 가리기(hideWage) 켜짐일 때 붙이는 클래스 */
export const BLUR_CLASS = "blur-[6px] select-none transition-[filter] duration-fast";

/** 분 → "2.5h" */
export const fmtH = (min: number) => {
    const h = Math.round((min / 60) * 100) / 100;
    return `${h}h`;
};

/** 분 → "2시간 30분" */
export const fmtHM = (min: number) => {
    const m = Math.round(min);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h && r) return `${h}시간 ${r}분`;
    if (h) return `${h}시간`;
    return `${r}분`;
};

export const fmtWon = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
