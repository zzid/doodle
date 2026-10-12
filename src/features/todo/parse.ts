import { dayjs, type Dayjs } from "@/dayjs/dayjs";
import type { Priority, Recurrence } from "./types";

/**
 * 빠른 입력 한 줄을 할 일로 해석한다.
 *
 *   "내일 오후 3시 회의 준비 #업무 !높음 ~30m 매주"
 *   → 제목 "회의 준비", 내일 15:00, 태그 업무, 우선순위 높음, 예상 30분, 매주 반복
 *
 * 인식한 조각은 제목에서 지우고, 미리보기 칩으로 보여줄 수 있게 tokens 에 남긴다.
 */

export interface Parsed {
    title: string;
    due?: string;
    time?: string;
    priority: Priority;
    tags: string[];
    estimateMin?: number;
    recurrence?: Recurrence;
    /** 인식한 원문 조각 (미리보기용) */
    tokens: { kind: "date" | "time" | "priority" | "tag" | "estimate" | "recurrence"; label: string }[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const fmtDate = (d: Dayjs) => d.format("YYYY-MM-DD");

/** 오늘 기준 다음 해당 요일 (오늘이면 오늘). nextWeek 이면 다음 주의 그 요일 */
function weekdayDate(today: Dayjs, dow: number, mode: "this" | "next" | "auto"): Dayjs {
    if (mode === "next") return today.startOf("week").add(7 + dow, "day");
    if (mode === "this") return today.startOf("week").add(dow, "day");
    const diff = (dow - today.day() + 7) % 7;
    return today.add(diff, "day");
}

export function parseQuickAdd(input: string, now: Dayjs = dayjs()): Parsed {
    const today = now.startOf("day");
    let text = ` ${input} `;
    const out: Parsed = { title: "", priority: 0, tags: [], tokens: [] };

    const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
        const m = text.match(re);
        if (!m) return;
        fn(m);
        text = text.replace(m[0], " ");
    };

    // 반복 (날짜보다 먼저 — "매주 월" 의 "월" 을 요일로 같이 쓰기 위해 반복만 떼어낸다)
    take(/\s(매일|평일마다|평일|매주|매달|매월)(?=\s)/, (m) => {
        const map: Record<string, Recurrence> = {
            매일: "daily",
            평일마다: "weekdays",
            평일: "weekdays",
            매주: "weekly",
            매달: "monthly",
            매월: "monthly",
        };
        out.recurrence = map[m[1]];
        out.tokens.push({ kind: "recurrence", label: m[1] });
    });

    // 날짜
    take(/\s(오늘|내일|모레|글피)(?=\s)/, (m) => {
        const add = { 오늘: 0, 내일: 1, 모레: 2, 글피: 3 }[m[1]]!;
        out.due = fmtDate(today.add(add, "day"));
        out.tokens.push({ kind: "date", label: m[1] });
    });
    if (!out.due)
        take(/\s(\d+)\s*(일|주)\s*(뒤|후)(?=\s)/, (m) => {
            out.due = fmtDate(today.add(Number(m[1]), m[2] === "주" ? "week" : "day"));
            out.tokens.push({ kind: "date", label: m[0].trim() });
        });
    if (!out.due)
        take(/\s(?:(\d{1,2})\/(\d{1,2})|(\d{1,2})월\s*(\d{1,2})일)(?=\s)/, (m) => {
            const month = Number(m[1] ?? m[3]);
            const day = Number(m[2] ?? m[4]);
            let d = today.month(month - 1).date(day);
            if (d.isBefore(today)) d = d.add(1, "year");
            out.due = fmtDate(d);
            out.tokens.push({ kind: "date", label: m[0].trim() });
        });
    if (!out.due)
        take(/\s(다음\s?주\s*|이번\s?주\s*)?([월화수목금토일])(?:요일)?(?=\s)/, (m) => {
            const mode = m[1]?.startsWith("다음") ? "next" : m[1] ? "this" : "auto";
            out.due = fmtDate(weekdayDate(today, WEEKDAYS.indexOf(m[2]), mode));
            out.tokens.push({ kind: "date", label: m[0].trim() });
        });

    // 시간: "오후 3시 30분", "15시", "9:30"
    take(/\s(오전|오후)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?(?!간)(?=\s)/, (m) => {
        let h = Number(m[2]);
        if (m[1] === "오후" && h < 12) h += 12;
        if (m[1] === "오전" && h === 12) h = 0;
        out.time = `${String(h).padStart(2, "0")}:${String(Number(m[3] ?? 0)).padStart(2, "0")}`;
        out.tokens.push({ kind: "time", label: m[0].trim() });
    });
    if (!out.time)
        take(/\s(\d{1,2}):(\d{2})(?=\s)/, (m) => {
            out.time = `${m[1].padStart(2, "0")}:${m[2]}`;
            out.tokens.push({ kind: "time", label: m[0].trim() });
        });
    // 시간만 있고 날짜가 없으면 오늘
    if (out.time && !out.due) out.due = fmtDate(today);

    // 우선순위: !높음 / !중간 / !낮음 / !1~3 / !!!
    take(/\s!(높음|중간|낮음|[123]|!{0,2})(?=\s)/, (m) => {
        const v = m[1];
        const p: Priority =
            v === "높음" || v === "3" || v === "!!" ? 3 : v === "중간" || v === "2" || v === "!" ? 2 : 1;
        out.priority = p;
        out.tokens.push({ kind: "priority", label: `!${v}` });
    });

    // 예상 시간: ~30m, ~1h, ~1h30m, ~30분, ~2시간
    take(/\s~\s*(?:(\d+(?:\.\d+)?)\s*(?:h|시간))?\s*(?:(\d+)\s*(?:m|분))?(?=\s)/, (m) => {
        const min = Math.round(Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0));
        if (min > 0) {
            out.estimateMin = min;
            out.tokens.push({ kind: "estimate", label: m[0].trim() });
        }
    });

    // 태그 (여러 개)
    let tag: RegExpMatchArray | null;
    while ((tag = text.match(/\s#([^\s#]+)(?=\s)/))) {
        if (!out.tags.includes(tag[1])) out.tags.push(tag[1]);
        out.tokens.push({ kind: "tag", label: `#${tag[1]}` });
        text = text.replace(tag[0], " ");
    }

    out.title = text.replace(/\s+/g, " ").trim();
    return out;
}
