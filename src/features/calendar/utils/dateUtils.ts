import { Dayjs } from "dayjs";
import { CalendarConfig, EffectData } from "../types";

export const formatDate = (date: Dayjs) => date.format("YYYY-MM-DD");

export const getMonthList = (start: Dayjs, end: Dayjs): Dayjs[] =>
    Array.from(
        {
            length:
                end.startOf("month").diff(start.startOf("month"), "month") + 1,
        },
        (_, idx) => start.startOf("month").add(idx, "month")
    );

export const getStartOfEventWeek = (
    date: Dayjs,
    weekStartDay: number = 4 // Thursday by default
) => {
    const dayOfWeek = date.day();
    const diff =
        dayOfWeek >= weekStartDay
            ? dayOfWeek - weekStartDay
            : 7 - (weekStartDay - dayOfWeek);
    return date.subtract(diff, "day").startOf("day");
};

export const getCalendarGridDates = (
    month: Dayjs,
    eventStart: Dayjs,
    eventEnd: Dayjs,
    weekStartDay: number = 0 // Sunday by default for calendar grid
): (Dayjs | null)[] => {
    const calStart = month.startOf("month");
    const daysInMonth = month.daysInMonth();
    const startDayIdx = calStart.day();
    const prevDays = (7 + startDayIdx - weekStartDay) % 7;

    // Fill with null paddings, then valid days in the event period, then trailing nulls
    return [
        ...Array(prevDays).fill(null),
        ...Array.from({ length: daysInMonth }, (_, d) => {
            const day = calStart.date(d + 1);
            if (
                day.isBefore(eventStart, "day") ||
                day.isAfter(eventEnd, "day")
            ) {
                return null;
            }
            return day;
        }),
        ...Array((7 - ((prevDays + daysInMonth) % 7)) % 7).fill(null),
    ];
};

export const getCountForDate = (
    date: Dayjs,
    config: CalendarConfig
): number => {
    const { eventStartDate, weekStartDay = 4, countUpDaysPerWeek = 5 } = config;

    if (date.isBefore(eventStartDate, "day")) return 0;
    const diffDays = date.startOf("day").diff(eventStartDate, "day");
    if (diffDays < 0) return 0;

    const thisWeekStart = getStartOfEventWeek(date, weekStartDay);
    const weekNum = Math.floor(thisWeekStart.diff(eventStartDate, "day") / 7);
    const dayIdxInWeek = date.diff(thisWeekStart, "day");
    const countInThisWeek = Math.min(
        Math.max(dayIdxInWeek + 1, 0),
        countUpDaysPerWeek
    );
    return weekNum * countUpDaysPerWeek + countInThisWeek;
};

export const getDayForEffectCount = (
    count: number,
    config: CalendarConfig
): Dayjs | null => {
    const { eventStartDate, eventEndDate } = config;
    let currDay = eventStartDate.clone();
    while (
        currDay.isSameOrBefore(eventEndDate, "day") &&
        getCountForDate(currDay, config) < count
    ) {
        currDay = currDay.add(1, "day");
    }
    if (
        currDay.isAfter(eventEndDate, "day") ||
        getCountForDate(currDay, config) !== count
    )
        return null;
    return currDay;
};

export const getEffectForCount = (
    count: number,
    effectData: EffectData[]
): string | null => {
    const effectObj = effectData.find((d) => d.count === count);
    return effectObj?.effect ?? null;
};

export const getEffectCountForDay = (
    day: Dayjs,
    config: CalendarConfig
): number | null => {
    const count = getCountForDate(day, config);
    if (config.effectData.some((e) => e.count === count)) return count;
    return null;
};
