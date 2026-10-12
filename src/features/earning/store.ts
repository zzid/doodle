import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OvertimeSession } from "./calc";

interface EarningState {
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
    set: (patch: Partial<Omit<EarningState, "set">>) => void;
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
            ...wageFromOvertime(),
            set: (patch) => set(patch),
        }),
        { name: "doodle-earning" }
    )
);
