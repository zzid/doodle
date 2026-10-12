/**
 * 오늘 번 돈 계산.
 *
 * 하루 9시간 체류 = 8시간 근무 + 1시간 무급 점심.
 * 점심 시간 동안에는 돈이 오르지 않는다.
 * 정시 퇴근 이후 "초과근무"를 켜면 사내 연장근로 가산율로 계속 오른다
 * (22시까지 150%, 22시~06시 200% — 초과근로 기록 페이지와 같은 기준, 평일 기준).
 */

export const STAY_MIN = 9 * 60;
export const LUNCH_MIN = 60;
export const PAID_SEC = (STAY_MIN - LUNCH_MIN) * 60;

/** 월 소정근로 209시간 기준 (연봉 ÷ 12 ÷ 209) */
export const MONTHLY_BASE_HOURS = 209;

export type Phase = "before" | "working" | "lunch" | "done";

export const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
};

export const fmtClock = (min: number) => {
    const t = ((min % 1440) + 1440) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/**
 * 점심 시작 시각. 직접 지정하지 않았거나 근무 시간 밖이면
 * 12시가 근무 시간 안에 있을 땐 12시, 아니면 출근 4시간 뒤.
 */
export function resolveLunch(start: string, lunch?: string): number {
    const s = toMin(start);
    const lastLunch = s + STAY_MIN - LUNCH_MIN;
    if (lunch) {
        const l = toMin(lunch);
        if (l >= s && l <= lastLunch) return l;
    }
    return 12 * 60 >= s && 12 * 60 <= lastLunch ? 12 * 60 : s + 4 * 60;
}

export interface DayStatus {
    phase: Phase;
    startMin: number;
    endMin: number;
    lunchStartMin: number;
    lunchEndMin: number;
    /** 지금까지 일한(돈 받는) 초 */
    paidSec: number;
    /** 다음 이벤트까지 남은 초: 출근 전엔 출근까지, 그 외엔 퇴근까지 */
    remainingSec: number;
    /** 0~1, 출근~퇴근 체류 시간 기준 진행률 */
    stayProgress: number;
    earned: number;
    dailyTotal: number;
}

const overlap = (a0: number, a1: number, b0: number, b1: number) =>
    Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

export function dayStatus(now: Date, start: string, lunch: string | undefined, hourly: number): DayStatus {
    const startMin = toMin(start);
    const endMin = startMin + STAY_MIN;
    const lunchStartMin = resolveLunch(start, lunch);
    const lunchEndMin = lunchStartMin + LUNCH_MIN;

    // 오늘 0시 기준 초 (정수 초 — 표시가 1초씩 고르게 바뀌도록 밀리초는 버린다)
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const s = startMin * 60;
    const e = endMin * 60;
    const l0 = lunchStartMin * 60;
    const l1 = lunchEndMin * 60;

    const paidSec = overlap(s, nowSec, s, l0) + overlap(s, nowSec, l1, e);

    let phase: Phase;
    if (nowSec < s) phase = "before";
    else if (nowSec >= e) phase = "done";
    else if (nowSec >= l0 && nowSec < l1) phase = "lunch";
    else phase = "working";

    return {
        phase,
        startMin,
        endMin,
        lunchStartMin,
        lunchEndMin,
        paidSec,
        remainingSec: phase === "before" ? s - nowSec : Math.max(0, e - nowSec),
        stayProgress: Math.min(1, Math.max(0, (nowSec - s) / (e - s))),
        earned: Math.floor((paidSec * hourly) / 3600),
        dailyTotal: Math.round((PAID_SEC * hourly) / 3600),
    };
}

/* ---------- 초과근무 ---------- */

export const OT_RATE_DAY = 1.5;
export const OT_RATE_NIGHT = 2.0;

export interface OvertimeSession {
    /** 초과근무가 붙은 근무일 "YYYY-MM-DD" (자정을 넘겨도 이 날짜 기준) */
    date: string;
    /** 퇴근하기를 누른 시각(epoch ms). 없으면 진행 중 */
    endedAt?: number;
    /** 초과근로 기록 페이지에 추가했는지 */
    saved?: boolean;
}

export interface OvertimeStatus {
    active: boolean;
    /** 정시 퇴근 시각 (epoch ms) */
    startTs: number;
    sec: number;
    nightSec: number;
    earned: number;
    /** 지금 적용 중인 가산율 */
    rateNow: number;
}

const dateStartTs = (date: string) => new Date(`${date}T00:00:00`).getTime();

const isNightTs = (ts: number) => {
    const h = new Date(ts).getHours();
    return h >= 22 || h < 6;
};

/** 정시 퇴근 시각부터 지금(또는 퇴근하기 누른 시각)까지 */
export function overtimeStatus(
    now: Date,
    session: OvertimeSession,
    endMin: number,
    hourly: number
): OvertimeStatus {
    const base = dateStartTs(session.date);
    const startTs = base + endMin * 60_000;
    const endTs = Math.max(startTs, session.endedAt ?? now.getTime());
    const sec = Math.floor((endTs - startTs) / 1000);
    // 22시~다음날 06시 구간과 겹치는 만큼 야간
    const n0 = base + 22 * 3_600_000;
    const n1 = base + 30 * 3_600_000;
    const nightSec = Math.floor(Math.max(0, Math.min(endTs, n1) - Math.max(startTs, n0)) / 1000);
    const daySec = sec - nightSec;
    return {
        active: !session.endedAt,
        startTs,
        sec,
        nightSec,
        earned: Math.floor(((daySec * OT_RATE_DAY + nightSec * OT_RATE_NIGHT) * hourly) / 3600),
        rateNow: isNightTs(now.getTime()) ? OT_RATE_NIGHT : OT_RATE_DAY,
    };
}

/** 초 → "3시간 12분 05초" */
export function fmtDuration(sec: number) {
    const t = Math.max(0, Math.floor(sec));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h ? `${h}시간 ${pad(m)}분 ${pad(s)}초` : `${m}분 ${pad(s)}초`;
}

export const fmtWon = (n: number) => `${Math.floor(n).toLocaleString("ko-KR")}원`;
