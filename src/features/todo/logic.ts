import { dayjs } from "@/dayjs/dayjs";
import type { Recurrence, Task } from "./types";

export type SmartView = "today" | "upcoming" | "overdue" | "all" | "done";

export const VIEW_LABEL: Record<SmartView, string> = {
    today: "오늘",
    upcoming: "예정",
    overdue: "지난 마감",
    all: "전체",
    done: "완료",
};

export const todayStr = () => dayjs().format("YYYY-MM-DD");

const isOpen = (t: Task) => t.status !== "done";

export function inView(t: Task, view: SmartView, today: string): boolean {
    switch (view) {
        case "today":
            // 오늘 마감 + 지난 마감 + 진행 중인 것
            return isOpen(t) && ((!!t.due && t.due <= today) || t.status === "doing");
        case "upcoming":
            return isOpen(t) && !!t.due && t.due > today;
        case "overdue":
            return isOpen(t) && !!t.due && t.due < today;
        case "all":
            return isOpen(t);
        case "done":
            return t.status === "done";
    }
}

/** 정렬: 마감일 → 시각 → 우선순위 높은 순 → 직접 정한 순서 */
export function sortTasks(a: Task, b: Task) {
    if (a.status === "done" && b.status === "done") return (b.completedAt ?? 0) - (a.completedAt ?? 0);
    const ad = a.due ?? "9999-99-99";
    const bd = b.due ?? "9999-99-99";
    if (ad !== bd) return ad < bd ? -1 : 1;
    const at = a.time ?? "99:99";
    const bt = b.time ?? "99:99";
    if (at !== bt) return at < bt ? -1 : 1;
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.order - b.order;
}

export interface Group {
    key: string;
    label: string;
    tone?: "danger" | "accent";
    tasks: Task[];
}

/** 목록 보기 묶음: 지난 마감 / 오늘 / 내일 / 이번 주 / 나중 / 날짜 없음 */
export function groupByDue(tasks: Task[], today: string): Group[] {
    const t0 = dayjs(today);
    const tomorrow = t0.add(1, "day").format("YYYY-MM-DD");
    const weekEnd = t0.add(7, "day").format("YYYY-MM-DD");
    const groups: Group[] = [
        { key: "overdue", label: "지난 마감", tone: "danger", tasks: [] },
        { key: "today", label: "오늘", tone: "accent", tasks: [] },
        { key: "tomorrow", label: "내일", tasks: [] },
        { key: "week", label: "7일 안", tasks: [] },
        { key: "later", label: "나중", tasks: [] },
        { key: "none", label: "날짜 없음", tasks: [] },
        { key: "done", label: "완료", tasks: [] },
    ];
    const by = Object.fromEntries(groups.map((g) => [g.key, g]));
    for (const t of [...tasks].sort(sortTasks)) {
        if (t.status === "done") by.done.tasks.push(t);
        else if (!t.due) by.none.tasks.push(t);
        else if (t.due < today) by.overdue.tasks.push(t);
        else if (t.due === today) by.today.tasks.push(t);
        else if (t.due === tomorrow) by.tomorrow.tasks.push(t);
        else if (t.due <= weekEnd) by.week.tasks.push(t);
        else by.later.tasks.push(t);
    }
    return groups.filter((g) => g.tasks.length > 0);
}

/** 반복 일정의 다음 마감일 */
export function nextDue(from: string | undefined, rec: Recurrence): string {
    let d = dayjs(from ?? todayStr());
    // 이미 지난 일정을 늦게 완료해도 다음 회차는 오늘 이후로
    const today = dayjs(todayStr());
    do {
        if (rec === "daily") d = d.add(1, "day");
        else if (rec === "weekly") d = d.add(1, "week");
        else if (rec === "monthly") d = d.add(1, "month");
        else {
            d = d.add(1, "day");
            while (d.day() === 0 || d.day() === 6) d = d.add(1, "day");
        }
    } while (d.isBefore(today));
    return d.format("YYYY-MM-DD");
}

/** 마감 표시: "오늘", "내일", "어제", "10/20 (화)", 시간 포함 */
export function dueLabel(t: Task, today: string): { text: string; tone: "danger" | "accent" | "muted" } | null {
    if (!t.due) return null;
    const d = dayjs(t.due);
    const diff = d.diff(dayjs(today), "day");
    const dow = ["일", "월", "화", "수", "목", "금", "토"][d.day()];
    const base =
        diff === 0 ? "오늘" : diff === 1 ? "내일" : diff === -1 ? "어제" : `${d.format("M/D")} (${dow})`;
    return {
        text: t.time ? `${base} ${t.time}` : base,
        tone: t.status !== "done" && diff < 0 ? "danger" : diff === 0 ? "accent" : "muted",
    };
}

export const fmtEstimate = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h && m ? `${h}시간 ${m}분` : h ? `${h}시간` : `${m}분`;
};
