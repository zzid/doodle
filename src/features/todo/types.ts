export type Status = "todo" | "doing" | "done";
export type Priority = 0 | 1 | 2 | 3; // 없음 / 낮음 / 중간 / 높음
export type Recurrence = "daily" | "weekdays" | "weekly" | "monthly";

export interface Subtask {
    id: string;
    title: string;
    done: boolean;
}

export interface Task {
    id: string;
    title: string;
    notes: string;
    status: Status;
    priority: Priority;
    /** 마감일 "YYYY-MM-DD" */
    due?: string;
    /** 마감 시각 "HH:mm" */
    time?: string;
    tags: string[];
    /** 예상 소요 시간(분) */
    estimateMin?: number;
    subtasks: Subtask[];
    recurrence?: Recurrence;
    createdAt: number;
    completedAt?: number;
    /** 같은 묶음 안 정렬용 */
    order: number;
}

export const STATUS_LABEL: Record<Status, string> = {
    todo: "할 일",
    doing: "진행 중",
    done: "완료",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
    0: "없음",
    1: "낮음",
    2: "중간",
    3: "높음",
};

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
    daily: "매일",
    weekdays: "평일마다",
    weekly: "매주",
    monthly: "매달",
};

export const newId = () => Math.random().toString(36).slice(2, 10);
