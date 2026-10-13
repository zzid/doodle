import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncAcrossTabs } from "@/utils/syncAcrossTabs";
import { type Entry, MAX_HOURS, toMin } from "./calc";
import type { BackupData, BackupSettings } from "./backup";

type SettingKey =
    | "wageMode"
    | "hourlyWage"
    | "salary"
    | "leaveWeighted"
    | "hideWage"
    | "monthlyBase"
    | "nonTaxable"
    | "family"
    | "children"
    | "withholdingRatio";

/** persist 미들웨어가 상태가 바뀔 때마다 localStorage 에 자동 저장한다 */
interface OvertimeState {
    entries: Record<string, Entry>;
    wageMode: "hourly" | "salary";
    hourlyWage: number;
    salary: number;
    /** true: 보상휴가도 가산율 반영(1.5h → 2.25h), false: 1:1 */
    leaveWeighted: boolean;
    /** 시급·연봉·환산식 가리기 */
    hideWage: boolean;
    /** 통상시급 모드에서 쓰는 세전 월 기본급 (0 이면 시급 × 209) */
    monthlyBase: number;
    /** 실수령액 계산용 */
    nonTaxable: number;
    family: number;
    children: number;
    withholdingRatio: number;
    setEntry: (date: string, entry: Entry) => void;
    removeEntry: (date: string) => void;
    /** "YYYY-MM" 달의 기록만 삭제 */
    clearMonth: (month: string) => void;
    /** 기록 + 설정 전부 초기화 */
    clearAll: () => void;
    setSettings: (patch: Partial<Pick<OvertimeState, SettingKey>>) => void;
    /** merge: 같은 날짜는 가져온 값으로 덮고 나머지는 유지 / replace: 기록 전체 교체 */
    importBackup: (data: BackupData, mode: "merge" | "replace", withSettings: boolean) => void;
}

/** 백업에 들어가는 설정만 골라낸다 (hideWage 같은 화면 설정은 기기별로 둔다) */
export const pickBackupSettings = (s: OvertimeState): BackupSettings => ({
    wageMode: s.wageMode,
    hourlyWage: s.hourlyWage,
    salary: s.salary,
    leaveWeighted: s.leaveWeighted,
    monthlyBase: s.monthlyBase,
    nonTaxable: s.nonTaxable,
    family: s.family,
    children: s.children,
    withholdingRatio: s.withholdingRatio,
});

export const useOvertimeStore = create<OvertimeState>()(
    persist(
        (set) => ({
            entries: {},
            wageMode: "hourly",
            hourlyWage: 0,
            salary: 0,
            leaveWeighted: true,
            hideWage: false,
            monthlyBase: 0,
            nonTaxable: 200_000,
            family: 1,
            children: 0,
            withholdingRatio: 1,
            setEntry: (date, entry) =>
                set((s) => ({ entries: { ...s.entries, [date]: entry } })),
            removeEntry: (date) =>
                set((s) => {
                    const { [date]: _, ...rest } = s.entries;
                    return { entries: rest };
                }),
            clearMonth: (month) =>
                set((s) => ({
                    entries: Object.fromEntries(
                        Object.entries(s.entries).filter(([d]) => !d.startsWith(month))
                    ),
                })),
            clearAll: () =>
                set({
                    entries: {},
                    wageMode: "hourly",
                    hourlyWage: 0,
                    salary: 0,
                    leaveWeighted: true,
                    hideWage: false,
                    monthlyBase: 0,
                    nonTaxable: 200_000,
                    family: 1,
                    children: 0,
                    withholdingRatio: 1,
                }),
            setSettings: (patch) => set(patch),
            importBackup: (data, mode, withSettings) =>
                set((s) => ({
                    entries: mode === "replace" ? data.entries : { ...s.entries, ...data.entries },
                    ...(withSettings ? data.settings : {}),
                })),
        }),
        {
            name: "doodle-overtime",
            version: 1,
            // v0: 시간 범위(start~end) / 시간만(hours) 두 가지 입력 방식 → v1: 시작 + 근로시간
            migrate: (persisted, version) => {
                const state = persisted as { entries?: Record<string, any> };
                if (version < 1 && state?.entries) {
                    for (const [date, e] of Object.entries(state.entries)) {
                        let hours = Number(e.hours) || 0;
                        if (e.mode === "range" && e.end) {
                            let span = toMin(e.end) - toMin(e.start);
                            if (span <= 0) span += 1440;
                            hours = Math.max(0, span - (e.breakMin || 0)) / 60;
                        }
                        state.entries[date] = {
                            start: e.mode === "range" ? e.start : "19:00",
                            hours: Math.min(MAX_HOURS, hours),
                            breakMin: e.mode === "range" ? e.breakMin || 0 : 0,
                            comp: e.comp,
                            dayType: e.dayType,
                            memo: e.memo,
                        } satisfies Entry;
                    }
                }
                return state as OvertimeState;
            },
        }
    )
);

// 다른 탭에서 저장하면 바로 다시 읽어 와 저장 충돌을 막는다
syncAcrossTabs(useOvertimeStore);
