import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OvertimeSession } from "./calc";

export interface EarningState {
    /** 출근 시각 "HH:mm" */
    start: string;
    /** 점심 시작 "HH:mm". 빈 값이면 자동(12시 또는 출근 4시간 뒤) */
    lunch: string;
    wageMode: "hourly" | "salary";
    hourlyWage: number;
    salary: number;
    hideMoney: boolean;
    /** 오늘(또는 자정을 넘긴 어제) 초과근무 */
    overtime: OvertimeSession | null;
    /** 메소 환산 보기 */
    mesoOn: boolean;
    /** 1억 메소당 현금(원) */
    mesoRate: number;
    /** 재획 30분당 메소(억). 풀메획 기준 약 0.6억 */
    farmEok30: number;
    /** 재획 하루 메소 한도(억). 기본 2.2억, 풀메획(200%) 기준 6.6억 */
    farmDailyCapEok: number;
    set: (patch: Partial<Omit<EarningState, "set">>) => void;
}

/** 처음 켤 때 MVP 계산기에 입력해 둔 억당 현금 시세를 가져온다 (없으면 1,500원) */
function mesoRateFromMvp(): number {
    try {
        const v = Number(JSON.parse(localStorage.getItem("doodle-mvp") ?? "")?.sell);
        if (v > 0) return v;
    } catch {}
    return 1500;
}

/** 처음 들어왔을 때 초과근로 기록 페이지에 입력해 둔 시급·연봉을 가져온다 */
function wageFromOvertime(): Pick<EarningState, "wageMode" | "hourlyWage" | "salary"> {
    try {
        const s = JSON.parse(localStorage.getItem("doodle-overtime") ?? "")?.state;
        if (s && (s.hourlyWage > 0 || s.salary > 0)) {
            return {
                wageMode: s.wageMode === "salary" ? "salary" : "hourly",
                hourlyWage: Number(s.hourlyWage) || 0,
                salary: Number(s.salary) || 0,
            };
        }
    } catch {}
    return { wageMode: "salary", hourlyWage: 0, salary: 0 };
}

export const useEarningStore = create<EarningState>()(
    persist(
        (set) => ({
            start: "09:00",
            lunch: "",
            hideMoney: false,
            overtime: null,
            mesoOn: false,
            mesoRate: mesoRateFromMvp(),
            farmEok30: 0.6,
            farmDailyCapEok: 6.6,
            ...wageFromOvertime(),
            set: (patch) => set(patch),
        }),
        { name: "doodle-earning" }
    )
);
