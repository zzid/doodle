import { isObj } from "@/utils/backupCodec";
import type { Entry } from "./calc";

/**
 * 초과근로 기록 백업 데이터 형식과 검증.
 * 링크·파일 인코딩과 화면은 공통 모듈(src/utils/backupCodec.ts, src/components/BackupMenu.tsx)이 맡는다.
 */

export const BACKUP_APP = "doodle-overtime";
export const BACKUP_VERSION = 1;

export interface BackupSettings {
    wageMode: "hourly" | "salary";
    hourlyWage: number;
    salary: number;
    leaveWeighted: boolean;
    monthlyBase: number;
    nonTaxable: number;
    family: number;
    children: number;
    withholdingRatio: number;
}

export interface BackupData {
    app: typeof BACKUP_APP;
    v: number;
    exportedAt: string;
    entries: Record<string, Entry>;
    settings: BackupSettings;
}

/* ---------- 검증 ---------- */

export function parseBackup(raw: unknown): BackupData {
    if (!isObj(raw) || raw.app !== BACKUP_APP) throw new Error("초과근로 기록 백업 데이터가 아니에요.");
    if (typeof raw.v !== "number" || raw.v > BACKUP_VERSION)
        throw new Error("더 최신 버전에서 만든 백업이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
    if (!isObj(raw.entries)) throw new Error("기록 데이터가 비어 있어요.");

    const entries: Record<string, Entry> = {};
    for (const [date, e] of Object.entries(raw.entries)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isObj(e)) continue;
        if (typeof e.start !== "string" || !/^\d{2}:\d{2}$/.test(e.start)) continue;
        entries[date] = {
            start: e.start,
            hours: Number(e.hours) || 0,
            breakMin: Number(e.breakMin) || 0,
            comp: e.comp === "leave" ? "leave" : "pay",
            ...(["weekday", "saturday", "holiday"].includes(e.dayType) ? { dayType: e.dayType } : {}),
            ...(typeof e.memo === "string" && e.memo ? { memo: e.memo } : {}),
        };
    }
    const s = isObj(raw.settings) ? raw.settings : {};
    return {
        app: BACKUP_APP,
        v: raw.v,
        exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
        entries,
        settings: {
            wageMode: s.wageMode === "salary" ? "salary" : "hourly",
            hourlyWage: Number(s.hourlyWage) || 0,
            salary: Number(s.salary) || 0,
            leaveWeighted: s.leaveWeighted !== false,
            monthlyBase: Number(s.monthlyBase) || 0,
            nonTaxable: s.nonTaxable === undefined ? 200_000 : Number(s.nonTaxable) || 0,
            family: Number(s.family) || 1,
            children: Number(s.children) || 0,
            withholdingRatio: [0.8, 1, 1.2].includes(s.withholdingRatio) ? s.withholdingRatio : 1,
        },
    };
}

/** 백업 요약 (가져오기 확인용) */
export function describeBackup(data: BackupData) {
    const dates = Object.keys(data.entries).sort();
    const months = new Set(dates.map((d) => d.slice(0, 7)));
    return {
        count: dates.length,
        months: months.size,
        first: dates[0],
        last: dates[dates.length - 1],
    };
}
