import React, {
    useMemo,
    useRef,
    useEffect,
    useState,
    createContext,
    useContext,
    PropsWithChildren,
} from "react";
import dayjs, { Dayjs } from "dayjs";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

// ---- Color Variables ---- //
const colors = {
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

const effectData = [
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

const EVENT_START_DATE = dayjs("2025-12-18");
const EVENT_END_DATE = dayjs("2026-03-18");

const WEEKDAYS = ["목", "금", "토", "일", "월", "화", "수"];

// Mobile friendly & adaptive paddings
const PageWrap = styled.div`
    padding: 24px;
    max-width: 1080px;
    color: ${colors.pageText};
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 600px) {
        padding: 10px;
    }
`;

const MainLayout = styled.div`
    display: flex;
    gap: 44px;
    align-items: flex-start;
    @media (max-width: 900px) {
        flex-direction: column;
        gap: 22px;
    }
    @media (max-width: 600px) {
        gap: 10px;
    }
`;

// Columns are now 100% width on mobile
const LeftCol = styled.div`
    flex: 3 1 0;
    min-width: 320px;

    @media (max-width: 600px) {
        min-width: 0;
        width: 100%;
    }
`;

const RightCol = styled.div`
    flex: 2 1 0;
    min-width: 300px;
    margin-top: 24px;
    position: sticky;
    top: 20px;
    @media (max-width: 900px) {
        position: static;
        margin-top: 2rem;
    }
    @media (max-width: 600px) {
        min-width: 0;
        width: 100%;
        margin-top: 1rem;
    }
`;

const EffectsBarWrap = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 600px) {
        align-items: stretch;
    }
`;

const EffectsTitle = styled.div`
    font-size: 1.07rem;
    color: ${colors.effectTitle};
    font-weight: 600;
    margin-bottom: 12px;
    letter-spacing: -1px;
    text-align: center;
    @media (max-width: 600px) {
        font-size: 1rem;
        margin-bottom: 7px;
    }
`;

const EffectBoxStyled = styled(motion.a)<{
    achieved?: boolean;
    highlighted?: boolean;
}>`
    border: 1.5px solid
        ${({ achieved }) =>
            achieved
                ? colors.effectBoxBorderAchieved
                : colors.effectBoxBorderNormal};
    background: ${({ achieved, highlighted }) =>
        highlighted
            ? colors.effectBoxBgHighlight
            : achieved
            ? colors.effectBoxBgAchieved
            : colors.effectBoxBgNormal};
    color: ${colors.effectBoxText};
    border-radius: 9px;
    padding: 10px 16px 10px 12px;
    min-width: 64px;
    box-shadow: ${({ highlighted }) =>
        highlighted ? colors.effectBoxBoxShadowHighlight : "none"};
    display: flex;
    align-items: center;
    gap: 10px;
    transition: box-shadow 0.22s, border 0.16s, background 0.17s,
        font-weight 0.15s;
    font-weight: ${({ highlighted }) => (highlighted ? 700 : 500)};
    text-decoration: none;
    outline: ${({ highlighted }) =>
        highlighted ? `2.5px solid ${colors.effectBoxOutline}` : "none"};
    outline-offset: ${({ highlighted }) => (highlighted ? "0.5px" : "0")};
    position: relative;

    &:hover,
    &:focus {
        box-shadow: ${colors.effectBoxHoverShadow};
    }

    @media (max-width: 600px) {
        padding: 8px 12px 8px 9px;
        min-width: 40px;
        font-size: 0.99rem;
        gap: 7px;
    }
`;

const EffectCount = styled.div`
    font-size: 1.18rem;
    font-weight: 700;
    margin-right: 2px;
    color: ${colors.effectCount};
    text-shadow: ${colors.effectCountShadow};
    @media (max-width: 600px) {
        font-size: 1.05rem;
    }
`;

const EffectDesc = styled.div`
    font-size: 0.97rem;
    font-weight: 500;
    line-height: 1.3;
    word-break: keep-all;
    @media (max-width: 600px) {
        font-size: 0.9rem;
    }
`;

const MonthTitle = styled.div`
    font-weight: 600;
    font-size: 1.12rem;
    margin-bottom: 0.4em;
    letter-spacing: -1px;
    @media (max-width: 600px) {
        font-size: 1.01rem;
        margin-bottom: 0.2em;
    }
`;

const DayOfWeekRow = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    border-bottom: 1px solid ${colors.dayWeekBorderBottom};
    margin-bottom: 3px;
    font-weight: 500;
    @media (max-width: 600px) {
        gap: 2.5px;
        font-size: 0.99rem;
    }
`;

const WeekdayCell = styled.div<{ idx: number }>`
    color: ${({ idx }) =>
        idx === 0
            ? colors.weekdayThu
            : idx === 6
            ? colors.weekdayWed
            : colors.weekdayOther};
    text-align: center;
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    @media (max-width: 600px) {
        gap: 2.5px;
    }
`;

const CalendarCell = styled(motion.div)<{
    isToday: boolean;
    isEffectDay?: boolean;
    isHighlighted?: boolean;
}>`
    border: 1.3px solid
        ${({ isEffectDay }) =>
            isEffectDay ? colors.cellBorderEffect : colors.cellBorderNormal};
    padding: 10px;
    border-radius: 8px;
    min-height: 70px;
    background: ${({ isToday, isEffectDay, isHighlighted }) => {
        if (isHighlighted) return colors.cellHighlight;
        if (isEffectDay) return colors.cellBgEffect;
        if (isToday) return colors.cellBgToday;
        return colors.cellBgNormal;
    }};
    opacity: 1;
    position: relative;
    box-shadow: ${({ isToday, isEffectDay, isHighlighted }) =>
        isHighlighted
            ? colors.cellHighlightShadow
            : isToday
            ? colors.cellShadowToday
            : isEffectDay
            ? colors.cellShadowEffect
            : colors.cellShadowNone};
    transition: box-shadow 0.15s, background 0.17s;

    &:hover {
        background: ${({ isToday, isEffectDay, isHighlighted }) =>
            isHighlighted
                ? colors.cellHighlight
                : isToday
                ? colors.cellHoverBgToday
                : isEffectDay
                ? colors.cellHoverBgEffect
                : colors.cellHoverBgNormal};
        box-shadow: ${({ isHighlighted }) =>
            isHighlighted
                ? colors.cellHighlightShadow
                : colors.cellHoverShadow};
    }
    @media (max-width: 600px) {
        padding: 6px;
        min-height: 40px;
        border-radius: 5px;
    }
`;

const CellDayNum = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: ${colors.cellDayNum};
    @media (max-width: 600px) {
        font-size: 13px;
    }
`;

const Badge = styled.span<{ isCountUpDay: boolean; shouldEmphasize?: boolean }>`
    font-size: 10px;
    font-weight: 600;
    color: ${({ isCountUpDay, shouldEmphasize }) =>
        shouldEmphasize
            ? colors.badgeEmphasize
            : isCountUpDay
            ? colors.badgeCountUp
            : colors.badgeNormal};
    display: inline-block;
    background: ${({ isCountUpDay, shouldEmphasize }) =>
        shouldEmphasize
            ? colors.badgeBgEmphasize
            : isCountUpDay
            ? colors.badgeBgCountUp
            : colors.badgeBgNormal};
    padding: 0px 7px;
    border-radius: 12px;
    margin-top: 2px;
    @media (max-width: 600px) {
        font-size: 9px;
        padding: 0px 6px;
        margin-top: 1px;
    }
`;

const InfoSection = styled.div`
    margin-top: 24px;
    font-size: 13px;
    color: ${colors.infoSection};
    @media (max-width: 600px) {
        font-size: 11px;
        margin-top: 12px;
    }
`;

// --- highlight context with showHighlight and setHighlightDate ---
type CalendarHighlightContextType = {
    highlightDate: string | null;
    showHighlight: boolean;
    setHighlightDate: (date: string | null, showHighlight?: boolean) => void;
};
const CalendarHighlightContext = createContext<CalendarHighlightContextType>({
    highlightDate: null,
    showHighlight: false,
    setHighlightDate: () => {},
});

export const useCalendarHighlight = () => useContext(CalendarHighlightContext);

const getMonthList = (start: Dayjs, end: Dayjs): Dayjs[] =>
    Array.from(
        {
            length:
                end.startOf("month").diff(start.startOf("month"), "month") + 1,
        },
        (_, idx) => start.startOf("month").add(idx, "month")
    );

// Get a week-aligned array of days (with padding nulls) for a month
const getCalendarGridDates = (
    month: Dayjs,
    eventStart: Dayjs,
    eventEnd: Dayjs
): (Dayjs | null)[] => {
    const calStart = month.startOf("month");
    const daysInMonth = month.daysInMonth();
    // week start: Thursday
    const THU = 4;
    const startDayIdx = calStart.day();
    const prevDays = (7 + startDayIdx - THU) % 7;

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

const getStartOfEventWeek = (date: Dayjs) => {
    const THURSDAY = 4;
    const dayOfWeek = date.day();
    const diff =
        dayOfWeek >= THURSDAY
            ? dayOfWeek - THURSDAY
            : 7 - (THURSDAY - dayOfWeek);
    return date.subtract(diff, "day").startOf("day");
};

const formatDate = (date: Dayjs) => date.format("YYYY-MM-DD");

const getCountForDate = (date: Dayjs): number => {
    if (date.isBefore(EVENT_START_DATE, "day")) return 0;
    const diffDays = date.startOf("day").diff(EVENT_START_DATE, "day");
    if (diffDays < 0) return 0;
    const thisWeekThursday = getStartOfEventWeek(date);
    const weekNum = Math.floor(
        thisWeekThursday.diff(EVENT_START_DATE, "day") / 7
    );
    const dayIdxInWeek = date.diff(thisWeekThursday, "day");
    const countInThisWeek = Math.min(Math.max(dayIdxInWeek + 1, 0), 5);
    return weekNum * 5 + countInThisWeek;
};

const getEffectForCount = (count: number) => {
    const effectObj = effectData.find((d) => d.count === count);
    return effectObj?.effect ?? null;
};

const EFFECT_DAY_ANCHOR_PREFIX = "effect-day-";

// Find the day when effect with specific count is achieved
const getDayForEffectCount = (count: number): Dayjs | null => {
    let currDay = EVENT_START_DATE.clone();
    while (
        currDay.isSameOrBefore(EVENT_END_DATE, "day") &&
        getCountForDate(currDay) < count
    ) {
        currDay = currDay.add(1, "day");
    }
    if (
        currDay.isAfter(EVENT_END_DATE, "day") ||
        getCountForDate(currDay) !== count
    )
        return null;
    return currDay;
};

// --- PRESENTATIONAL CALENDAR COMPONENTS ---

function getEffectCountForDay(day: Dayjs): number | null {
    const count = getCountForDate(day);
    if (effectData.some((e) => e.count === count)) return count;
    return null;
}

const CalendarDayCell: React.FC<{
    date: Dayjs;
    today: Dayjs;
}> = ({ date, today }) => {
    const count = getCountForDate(date);
    const isToday = formatDate(date) === formatDate(today);
    const dayIdxInWeek = date.diff(getStartOfEventWeek(date), "day");
    const isCountUpDay = dayIdxInWeek >= 0 && dayIdxInWeek <= 4;
    const isEffectDay =
        effectData.some((eff) => eff.count === count) && isCountUpDay;

    // highlight context
    const { highlightDate, setHighlightDate, showHighlight } =
        useCalendarHighlight();
    const isHighlighted = highlightDate === formatDate(date) && showHighlight;

    // -- Fix: only highlight for 1500ms when highlightDate is changed,
    //        never persistent after card click.
    useEffect(() => {
        if (isHighlighted) {
            // Only clear if it's this cell being highlighted
            const timeout = setTimeout(() => {
                setHighlightDate(null, false);
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [isHighlighted, setHighlightDate]);

    // For anchor
    const effectAnchor = isEffectDay
        ? EFFECT_DAY_ANCHOR_PREFIX + count
        : undefined;

    return (
        <CalendarCell
            isToday={isToday}
            isEffectDay={isEffectDay}
            isHighlighted={isHighlighted}
            id={effectAnchor}
            initial={
                isToday ? { scale: 1, boxShadow: "0 0 0 0px #faf3ae88" } : false
            }
            animate={
                isHighlighted
                    ? {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                              colors.cellHighlightShadow,
                              "0 0 0 14px #ffcb7f22",
                              colors.cellHighlightShadow,
                          ],
                          background: [
                              colors.cellHighlight,
                              "#fff8b0",
                              colors.cellHighlight,
                          ],
                      }
                    : isToday
                    ? {
                          boxShadow: [
                              "0 0 0 0px #fcffb8",
                              "0 0 0 8px #ffe16e44",
                              "0 0 0 0px #fcffb8",
                          ],
                      }
                    : isEffectDay
                    ? {
                          boxShadow: [
                              "0 0 0 0px #ffe3a259",
                              "0 0 0 7px #ffe6a477",
                              "0 0 0 0px #ffe3a259",
                          ],
                      }
                    : {}
            }
            transition={
                isHighlighted
                    ? {
                          duration: 1.3,
                          repeat: 0,
                          ease: "easeInOut",
                      }
                    : isToday || isEffectDay
                    ? {
                          duration: 1.6,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                      }
                    : {}
            }
        >
            <CellDayNum>{date.date()}</CellDayNum>
            <div>
                <Badge
                    isCountUpDay={isCountUpDay}
                    shouldEmphasize={isEffectDay}
                >
                    {isCountUpDay ? `Count ${count}` : `누적 ${count}`}
                </Badge>
            </div>
            {/* No extra effect text in cell: show effect highlight in bar */}
        </CalendarCell>
    );
};

const MonthCalendar: React.FC<{
    month: Dayjs;
    eventStart: Dayjs;
    eventEnd: Dayjs;
    today: Dayjs;
}> = ({ month, eventStart, eventEnd, today }) => {
    const days = getCalendarGridDates(month, eventStart, eventEnd);
    if (days.every((d) => d === null)) return null;
    return (
        <motion.div
            key={month.format("YYYY-MM")}
            style={{ marginBottom: "2.2rem" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
        >
            <MonthTitle>{month.format("YYYY년 M월")}</MonthTitle>
            <DayOfWeekRow>
                {WEEKDAYS.map((d, idx) => (
                    <WeekdayCell key={idx} idx={idx}>
                        {d}
                    </WeekdayCell>
                ))}
            </DayOfWeekRow>
            <CalendarGrid>
                {days.map((date, idx) =>
                    date ? (
                        <CalendarDayCell
                            key={date.toISOString()}
                            date={date}
                            today={today}
                        />
                    ) : (
                        <div key={idx} />
                    )
                )}
            </CalendarGrid>
        </motion.div>
    );
};

// EFFECTS VERTICAL STRIP COMPONENT (modified with highlight/scroll onClick)
const EffectsVerticalBar: React.FC<{ today: Dayjs }> = ({ today }) => {
    const { setHighlightDate } = useCalendarHighlight();
    const todayCount = getCountForDate(today);
    // Find all effect achievement days for anchor links
    const effectDays: { count: number; effect: string; day: Dayjs | null }[] =
        useMemo(
            () =>
                effectData.map((e) => ({
                    ...e,
                    day: getDayForEffectCount(e.count),
                })),
            []
        );

    // Auto scroll to current unlocked effect on update
    const activeRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [todayCount]);

    // Mobile friendly column
    const EffectsColumn = styled.div`
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        align-items: stretch;
        justify-content: flex-start;
        padding: 6px 0 10px 0;
        font-size: 11px;
        @media (max-width: 600px) {
            gap: 3px;
            padding: 2px 0 5px 0;
        }
    `;

    const handleEffectClick = (
        e: React.MouseEvent,
        eff: (typeof effectDays)[number]
    ) => {
        e.preventDefault();
        if (eff.day) {
            const anchorId = `${EFFECT_DAY_ANCHOR_PREFIX}${eff.count}`;
            const elm = document.getElementById(anchorId);
            if (elm) {
                elm.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
            }
            // Set highlight + showHighlight as true
            setHighlightDate(formatDate(eff.day), true);
        }
    };

    return (
        <EffectsBarWrap>
            <EffectsTitle>
                <span role="img" aria-label="trophy">
                    🎉
                </span>{" "}
                이벤트 누적 달성 효과
            </EffectsTitle>
            <EffectsColumn>
                {effectDays.map((eff) => {
                    const achieved = todayCount >= eff.count;
                    const highlighted = todayCount === eff.count;
                    const href = eff.day
                        ? `#${EFFECT_DAY_ANCHOR_PREFIX}${eff.count}`
                        : undefined;
                    return (
                        <EffectBoxStyled
                            href={href}
                            achieved={achieved}
                            highlighted={highlighted}
                            key={eff.count}
                            ref={highlighted ? activeRef : undefined}
                            tabIndex={0}
                            title={
                                eff.day
                                    ? `${
                                          eff.count
                                      }회 달성일자: ${eff.day.format(
                                          "YYYY-MM-DD"
                                      )}`
                                    : undefined
                            }
                            style={{ width: "100%" }}
                            onClick={(e) => handleEffectClick(e, eff)}
                        >
                            <EffectCount>{eff.count}</EffectCount>
                            <EffectDesc>{eff.effect}</EffectDesc>
                        </EffectBoxStyled>
                    );
                })}
            </EffectsColumn>
        </EffectsBarWrap>
    );
};

// highlight provider (with showHighlight flag) to prevent forever highlight
const CalendarHighlightProvider: React.FC<PropsWithChildren<{}>> = ({
    children,
}) => {
    const [highlightDate, setHighlightDateState] = useState<string | null>(
        null
    );
    const [showHighlight, setShowHighlight] = useState(false);

    // Called from both cell and card
    const setHighlightDate = (date: string | null, show?: boolean) => {
        setHighlightDateState(date);
        setShowHighlight(!!show);
    };

    return (
        <CalendarHighlightContext.Provider
            value={{ highlightDate, showHighlight, setHighlightDate }}
        >
            {children}
        </CalendarHighlightContext.Provider>
    );
};

// MAIN PAGE
export const CalendarPage = () => {
    const monthList = getMonthList(EVENT_START_DATE, EVENT_END_DATE);
    const today = dayjs();

    return (
        <CalendarHighlightProvider>
            <PageWrap>
                <h3
                    style={{
                        fontSize: "1.16rem",
                        marginBottom: 8,
                        lineHeight: 1.33,
                    }}
                >
                    전체 이벤트 달력 (시작:{" "}
                    <b>{EVENT_START_DATE.format("YYYY.MM.DD (dd)")}</b> ~{" "}
                    <b>{EVENT_END_DATE.format("YYYY.MM.DD (dd)")}</b>)
                </h3>
                <MainLayout>
                    {/* Left: Calendar */}
                    <LeftCol>
                        <div style={{ marginTop: 8 }}>
                            {monthList.map((monthObj) => (
                                <MonthCalendar
                                    key={monthObj.format("YYYY-MM")}
                                    month={monthObj}
                                    eventStart={EVENT_START_DATE}
                                    eventEnd={EVENT_END_DATE}
                                    today={today}
                                />
                            ))}
                        </div>
                        <InfoSection>
                            <div>
                                ※ 각 주(목~월) 매일 count up 가능, 화/수요일엔
                                count up 불가
                            </div>
                            <div>
                                ※ 누적 count가 특수 보상 조건(count = 5, 10, 15
                                ...)를 달성하면 오른쪽 효과 리스트에 강조됩니다.
                            </div>
                            <div>※ 노란색으로 표시된 날짜는 오늘입니다.</div>
                            <div>
                                ※ 효과명을 클릭하면 해당 달성일자로 달력이
                                스크롤되고 셀에 하이라이트가 표시됩니다.
                            </div>
                        </InfoSection>
                    </LeftCol>
                    {/* Right: Vertical bar with effectData */}
                    <RightCol>
                        <EffectsVerticalBar today={today} />
                    </RightCol>
                </MainLayout>
            </PageWrap>
        </CalendarHighlightProvider>
    );
};
