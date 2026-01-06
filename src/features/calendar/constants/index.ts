import { CalendarConfig, CalendarColors } from "../types";
import { dayjs } from "@/dayjs/dayjs";

// ---- Color Variables ---- //
export const colors: CalendarColors = {
    white: "#ffffff",
    pageText: "#ffffff",
    infoSection: "#777",
    // Gold/yellow
    effectTitle: "#ffda44",
    effectBoxBorderAchieved: "#ffc600",
    effectBoxBorderNormal: "#e5cb73",
    effectBoxBgHighlight: "#fffbe5",
    effectBoxBgAchieved: "#fffbe7",
    effectBoxBgNormal: "#faf7e3",
    effectBoxText: "#be9700",
    effectBoxBoxShadowHighlight: "0 0 8px 1px #fffbe3, 0 3px 14px 0 #ffe47ea1",
    effectBoxOutline: "#ffd326",
    effectBoxHoverShadow: "0 0 10px 2px #fffbe386",
    // Effect Count
    effectCount: "#f7bb36",
    effectCountShadow: "0 0 3px #fff5bbad",
    // Calendar
    calendarMonthTitle: "#ffffff",
    dayWeekBorderBottom: "#ddd",
    cellDayNum: "#000000",
    // Weekdays
    weekdayThu: "#2074c5", // idx 0=목
    weekdayWed: "#b7a600", // idx 6=수
    weekdayOther: "#444",
    // Calendar Cell
    cellBorderEffect: "#ffb75b",
    cellBorderNormal: "#ccc",
    cellBgToday: "#fffac1",
    cellBgEffect: "#fcf5ec",
    cellBgCountUp: "#f7fafd",
    cellBgNormal: "#f7fafd",
    cellShadowToday: "0 0 0 2px #ffe58e8a",
    cellShadowEffect: "0 0 0 2px #ffebcb80",
    cellShadowNone: "none",
    cellHoverBgToday: "#fff5be",
    cellHoverBgEffect: "#fff3e2",
    cellHoverBgNormal: "#e9f2fd",
    cellHoverShadow: "0 0 0 3px #ffe8b733",
    // Badge
    badgeEmphasize: "#D7263D",
    badgeCountUp: "#176fcc",
    badgeNormal: "#bbb",
    badgeBgEmphasize: "#ffeaea",
    badgeBgCountUp: "#e9f2fd",
    badgeBgNormal: "#f0f0f0",
    // highlight
    cellHighlight: "#ffe57f",
    cellHighlightShadow: "0 0 0 7px #ffdf7f77",
};

export const effectData = [
    { count: 5, effect: "몬스터파크 클리어 경험치 +10%" },
    { count: 10, effect: "지혜의 진향 경험치 획득량 3배 적용" },
    { count: 15, effect: "보스 몬스터 데미지 +10%" },
    { count: 20, effect: "에픽 던전 기본 경험치 보상 1.5배 적용" },
    { count: 25, effect: "몬스터파크 클리어 경험치 +10%" },
    { count: 30, effect: "아케인리버, 그란디스 일일 미션 보상 +20%" },
    { count: 35, effect: "사냥 시 솔 에르다 획득량 2배 적용" },
    { count: 40, effect: "에픽 던전 기본 경험치 보상 2배 적용" },
    { count: 45, effect: "몬스터파크 클리어 경험치 +10%" },
    { count: 50, effect: "보스 처치 시 획득 솔 에르다 +40%" },
    { count: 55, effect: "트레저 헌터 경험치 획득량 기본 2배 적용" },
    { count: 60, effect: "에픽 던전 기본 경험치 보상 2.5배 적용" },
];

export const EVENT_START_DATE = dayjs("2025-12-18");
export const EVENT_END_DATE = dayjs("2026-03-18");

export const calendarConfig: CalendarConfig = {
    eventStartDate: EVENT_START_DATE,
    eventEndDate: EVENT_END_DATE,
    weekStartDay: 4, // 0: Sunday, 4: Thursday
    countUpDaysPerWeek: 5,
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    effectData,
    anchorPrefix: "effect-day-",
};

export const infoTexts = [
    "※ 각 주(목~월) 매일 count up 가능, 화/수요일엔 count up 불가",
    "※ 누적 count가 특수 보상 조건(count = 5, 10, 15 ...)를 달성하면 오른쪽 효과 리스트에 강조됩니다.",
    "※ 노란색으로 표시된 날짜는 오늘입니다.",
    "※ 효과명을 클릭하면 해당 달성일자로 달력이 스크롤되고 셀에 하이라이트가 표시됩니다.",
];
