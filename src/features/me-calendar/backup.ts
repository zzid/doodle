import { isObj } from "@/utils/backupCodec";
import type { EventMark, EventType, Item, Kind, WeekStart } from "./store";

/**
 * 메-달력 백업 데이터 형식과 검증.
 * 링크·파일 인코딩과 화면은 공통 모듈(src/utils/backupCodec.ts, src/components/BackupMenu.tsx)이 맡는다.
 */

export const BACKUP_APP = "doodle-me-calendar";
/** v2: 고정 이벤트(eventTypes, eventDays) 추가 */
export const BACKUP_VERSION = 2;

export interface MeCalendarBackup {
    app: typeof BACKUP_APP;
    v: number;
    exportedAt: string;
    days: Record<string, Item[]>;
    weekStartDow: WeekStart;
    fragPriceMan?: number;
    eventTypes?: EventType[];
    eventDays?: Record<string, EventMark[]>;
}

const KINDS: Kind[] = ["income", "expense", "fragment", "plan"];
const newId = () => Math.random().toString(36).slice(2, 10);

export function parseBackup(raw: unknown): MeCalendarBackup {
    if (!isObj(raw) || raw.app !== BACKUP_APP) throw new Error("메-달력 백업 데이터가 아니에요.");
    if (typeof raw.v !== "number" || raw.v > BACKUP_VERSION)
        throw new Error("더 최신 버전에서 만든 백업이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
    if (!isObj(raw.days)) throw new Error("기록 데이터가 비어 있어요.");

    const days: Record<string, Item[]> = {};
    for (const [date, list] of Object.entries(raw.days)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(list)) continue;
        const items: Item[] = [];
        for (const i of list) {
            if (!isObj(i) || !KINDS.includes(i.kind)) continue;
            const amount = Number(i.amount);
            items.push({
                id: typeof i.id === "string" ? i.id : newId(),
                kind: i.kind,
                text: typeof i.text === "string" ? i.text : "",
                // 돈은 양수, 조각은 부호 있는 정수
                ...(i.kind === "fragment"
                    ? Number.isFinite(amount) && amount !== 0
                        ? { amount: Math.trunc(amount) }
                        : {}
                    : i.kind !== "plan" && amount > 0
                      ? { amount }
                      : {}),
                ...(i.kind === "plan" ? { done: !!i.done } : {}),
            });
        }
        if (items.length) days[date] = items;
    }
    // 고정 이벤트 (v2~). v1 백업에는 없으므로 그대로 둔다
    let eventTypes: EventType[] | undefined;
    if (Array.isArray(raw.eventTypes)) {
        eventTypes = raw.eventTypes
            .filter((t: any) => isObj(t) && typeof t.id === "string" && typeof t.name === "string")
            .map((t: any) => ({
                id: t.id,
                name: t.name,
                emoji: typeof t.emoji === "string" ? t.emoji : "📌",
                color: /^#[0-9a-fA-F]{6}$/.test(t.color) ? t.color : "#8b949e",
                ...(Number.isInteger(t.repeatDow) && t.repeatDow >= 0 && t.repeatDow <= 6 ? { repeatDow: t.repeatDow } : {}),
            }));
    }
    let eventDays: Record<string, EventMark[]> | undefined;
    if (isObj(raw.eventDays)) {
        eventDays = {};
        for (const [date, list] of Object.entries(raw.eventDays)) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(list)) continue;
            // 예전 형식(id 문자열)과 새 형식({ id, note }) 모두 받는다
            const marks: EventMark[] = [];
            for (const m of list) {
                if (typeof m === "string") marks.push({ id: m });
                else if (isObj(m) && typeof m.id === "string")
                    marks.push({ id: m.id, ...(typeof m.note === "string" && m.note ? { note: m.note } : {}) });
            }
            if (marks.length) eventDays[date] = marks;
        }
    }
    return {
        app: BACKUP_APP,
        v: raw.v,
        exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
        days,
        weekStartDow: raw.weekStartDow === 0 ? 0 : 4,
        ...(Number(raw.fragPriceMan) > 0 ? { fragPriceMan: Number(raw.fragPriceMan) } : {}),
        ...(eventTypes ? { eventTypes } : {}),
        ...(eventDays ? { eventDays } : {}),
    };
}

/** 기록 수 = 항목 수, 기간 = 첫 날 ~ 마지막 날 */
export function describeBackup(data: MeCalendarBackup) {
    const dates = Object.keys(data.days).sort();
    const count = dates.reduce((n, d) => n + data.days[d].length, 0);
    return {
        count,
        detail: dates.length ? `${dates.length}일 (${dates[0]} ~ ${dates[dates.length - 1]})` : undefined,
        exportedAt: data.exportedAt,
    };
}
