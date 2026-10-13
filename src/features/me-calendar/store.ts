import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncAcrossTabs } from "@/utils/syncAcrossTabs";

/** 번 돈 / 쓴 돈 / 솔 에르다 조각 / 일정·메모 */
export type Kind = "income" | "expense" | "fragment" | "plan";

/** emoji 가 빈 값이면 글자(label)만 쓴다 */
export const KIND_META: Record<Kind, { label: string; emoji: string }> = {
    income: { label: "번 돈", emoji: "💰" },
    expense: { label: "쓴 돈", emoji: "💸" },
    fragment: { label: "조각", emoji: "" },
    plan: { label: "일정·메모", emoji: "📌" },
};

export interface Item {
    id: string;
    kind: Kind;
    /** 번·쓴 돈: 메소(억, 양수) / 조각: 개수(얻으면 +, 쓰면 −) / 일정·메모: 없음 */
    amount?: number;
    text: string;
    /** 일정 완료 */
    done?: boolean;
}

/**
 * 고정 이벤트 (라방·패치·썬데이 등) — 메모와 따로 관리하는 이름 붙은 이벤트.
 * repeatDow 가 있으면 매주 그 요일에 자동으로 표시되고, 없으면(비정기) 날짜마다 직접 켠다.
 */
export interface EventType {
    id: string;
    name: string;
    emoji: string;
    /** "#rrggbb" */
    color: string;
    /** 매주 반복 요일 (0=일 … 6=토). 없으면 비정기 */
    repeatDow?: number;
}

export const DEFAULT_EVENT_TYPES: EventType[] = [
    { id: "live", name: "라방", emoji: "📺", color: "#e5534b" },
    { id: "patch", name: "패치", emoji: "🛠️", color: "#3ab0ff" },
    { id: "sunday", name: "썬데이", emoji: "☀️", color: "#f2a65a" },
];

/**
 * 날짜별 고정 이벤트 표시 + 내용 (예: 썬데이 "스타포스 30% 할인", 패치 "신규 보스 추가").
 * 비정기 이벤트는 이 항목이 있으면 그 날 켜진 것. 매주 반복 이벤트는 내용만 담는다.
 */
export interface EventMark {
    id: string;
    note?: string;
}

/** 달력 첫 칸 요일: 4 = 목요일(메요일), 0 = 일요일 */
export type WeekStart = 4 | 0;

interface State {
    /** "YYYY-MM-DD" → 그날 기록 */
    days: Record<string, Item[]>;
    weekStartDow: WeekStart;
    setWeekStart: (dow: WeekStart) => void;
    /** 솔 에르다 조각 1개 시세 (만 메소) */
    fragPriceMan: number;
    setFragPrice: (man: number) => void;
    eventTypes: EventType[];
    /** "YYYY-MM-DD" → 그날 이벤트 표시·내용 */
    eventDays: Record<string, EventMark[]>;
    addEventType: (t: Omit<EventType, "id">) => void;
    updateEventType: (id: string, patch: Partial<EventType>) => void;
    /** 이벤트 종류 삭제 — 날짜에 켜 둔 표시도 같이 지운다 */
    removeEventType: (id: string) => void;
    toggleEventDay: (date: string, typeId: string) => void;
    /** 그 날 이벤트 내용 쓰기 */
    setEventNote: (date: string, typeId: string, note: string) => void;
    addItem: (date: string, item: Omit<Item, "id">) => void;
    updateItem: (date: string, id: string, patch: Partial<Item>) => void;
    removeItem: (date: string, id: string) => void;
    /** merge: 같은 날짜는 가져온 기록으로 바꾸고 나머지는 유지 / replace: 전체 교체 */
    importDays: (
        data: {
            days: Record<string, Item[]>;
            weekStartDow?: WeekStart;
            fragPriceMan?: number;
            eventTypes?: EventType[];
            eventDays?: Record<string, EventMark[]>;
        },
        mode: "merge" | "replace"
    ) => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

/** 날짜 항목을 바꾸고, 비면 날짜 키를 지운다 */
function withDay(eventDays: Record<string, EventMark[]>, date: string, marks: EventMark[]) {
    const out = { ...eventDays };
    if (marks.length) out[date] = marks;
    else delete out[date];
    return out;
}

export const useMeCalendar = create<State>()(
    persist(
        (set) => ({
            days: {},
            weekStartDow: 4,
            setWeekStart: (dow) => set({ weekStartDow: dow }),
            fragPriceMan: 0,
            setFragPrice: (man) => set({ fragPriceMan: Math.max(0, man) }),
            eventTypes: DEFAULT_EVENT_TYPES,
            eventDays: {},
            addEventType: (t) => set((s) => ({ eventTypes: [...s.eventTypes, { ...t, id: newId() }] })),
            updateEventType: (id, patch) =>
                set((s) => ({ eventTypes: s.eventTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
            removeEventType: (id) =>
                set((s) => {
                    const eventDays: Record<string, EventMark[]> = {};
                    for (const [d, marks] of Object.entries(s.eventDays)) {
                        const left = marks.filter((m) => m.id !== id);
                        if (left.length) eventDays[d] = left;
                    }
                    return { eventTypes: s.eventTypes.filter((t) => t.id !== id), eventDays };
                }),
            toggleEventDay: (date, typeId) =>
                set((s) => {
                    const cur = s.eventDays[date] ?? [];
                    const next = cur.some((m) => m.id === typeId)
                        ? cur.filter((m) => m.id !== typeId)
                        : [...cur, { id: typeId }];
                    return { eventDays: withDay(s.eventDays, date, next) };
                }),
            setEventNote: (date, typeId, note) =>
                set((s) => {
                    const cur = s.eventDays[date] ?? [];
                    const next = cur.some((m) => m.id === typeId)
                        ? cur.map((m) => (m.id === typeId ? { ...m, note: note || undefined } : m))
                        : [...cur, { id: typeId, note: note || undefined }];
                    // 매주 반복 이벤트는 내용이 비면 항목을 남길 이유가 없다
                    const repeat = s.eventTypes.find((t) => t.id === typeId)?.repeatDow !== undefined;
                    return {
                        eventDays: withDay(
                            s.eventDays,
                            date,
                            repeat && !note ? next.filter((m) => m.id !== typeId) : next
                        ),
                    };
                }),
            addItem: (date, item) =>
                set((s) => ({ days: { ...s.days, [date]: [...(s.days[date] ?? []), { ...item, id: newId() }] } })),
            updateItem: (date, id, patch) =>
                set((s) => ({
                    days: { ...s.days, [date]: (s.days[date] ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)) },
                })),
            importDays: (data, mode) =>
                set((s) => ({
                    days: mode === "replace" ? data.days : { ...s.days, ...data.days },
                    ...(data.weekStartDow !== undefined ? { weekStartDow: data.weekStartDow } : {}),
                    ...(data.fragPriceMan ? { fragPriceMan: data.fragPriceMan } : {}),
                    ...(data.eventTypes
                        ? {
                              eventTypes:
                                  mode === "replace"
                                      ? data.eventTypes
                                      : [
                                            ...s.eventTypes.filter((t) => !data.eventTypes!.some((x) => x.id === t.id)),
                                            ...data.eventTypes,
                                        ],
                          }
                        : {}),
                    ...(data.eventDays
                        ? { eventDays: mode === "replace" ? data.eventDays : { ...s.eventDays, ...data.eventDays } }
                        : {}),
                })),
            removeItem: (date, id) =>
                set((s) => {
                    const items = (s.days[date] ?? []).filter((i) => i.id !== id);
                    const days = { ...s.days };
                    if (items.length) days[date] = items;
                    else delete days[date];
                    return { days };
                }),
        }),
        {
            name: "doodle-me-calendar",
            version: 1,
            // v0: eventDays 가 id 문자열 배열 → v1: { id, note } 배열
            migrate: (persisted: any, version) => {
                if (version < 1 && persisted?.eventDays) {
                    for (const [d, list] of Object.entries(persisted.eventDays))
                        persisted.eventDays[d] = (list as unknown[]).map((x) => (typeof x === "string" ? { id: x } : x));
                }
                return persisted as State;
            },
        }
    )
);

// 다른 탭에서 저장하면 바로 다시 읽어 와 저장 충돌을 막는다
syncAcrossTabs(useMeCalendar);

/* ---------- 계산 ---------- */

export interface Totals {
    income: number;
    expense: number;
    net: number;
    plans: number;
    /** 조각 증감 (개) */
    fragments: number;
}

export function totalsOf(items: Item[] = []): Totals {
    let income = 0;
    let expense = 0;
    let plans = 0;
    let fragments = 0;
    for (const i of items) {
        if (i.kind === "income") income += i.amount ?? 0;
        else if (i.kind === "expense") expense += i.amount ?? 0;
        else if (i.kind === "fragment") fragments += i.amount ?? 0;
        else plans++;
    }
    return { income, expense, net: income - expense, plans, fragments };
}

export function sumTotals(list: Totals[]): Totals {
    return list.reduce(
        (a, b) => ({
            income: a.income + b.income,
            expense: a.expense + b.expense,
            net: a.net + b.net,
            plans: a.plans + b.plans,
            fragments: a.fragments + b.fragments,
        }),
        { income: 0, expense: 0, net: 0, plans: 0, fragments: 0 }
    );
}

/** 개수 → "+10개" */
export const fmtFrag = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ko-KR")}개`;

/** 억 → "1.25억" (소수 둘째 자리까지, 끝 0 생략) */
export function fmtEok(v: number, sign = false) {
    const r = Math.round(v * 100) / 100;
    const s = r.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
    return `${sign && r > 0 ? "+" : ""}${s}억`;
}

/** 그 날 표시할 고정 이벤트와 내용: 매주 반복 + 그 날 직접 켠 비정기 */
export function eventsOn(date: string, dow: number, types: EventType[], eventDays: Record<string, EventMark[]>) {
    const marks = eventDays[date] ?? [];
    return types
        .filter((t) => t.repeatDow === dow || (t.repeatDow === undefined && marks.some((m) => m.id === t.id)))
        .map((t) => ({ type: t, note: marks.find((m) => m.id === t.id)?.note }));
}
