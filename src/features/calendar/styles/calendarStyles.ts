import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { CalendarColors } from "../types";

export const createCalendarStyles = (colors: CalendarColors) => {
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

    return {
        PageWrap,
        MainLayout,
        LeftCol,
        RightCol,
        EffectsBarWrap,
        EffectsTitle,
        EffectBoxStyled,
        EffectCount,
        EffectDesc,
        EffectsColumn,
        MonthTitle,
        DayOfWeekRow,
        WeekdayCell,
        CalendarGrid,
        CalendarCell,
        CellDayNum,
        Badge,
        InfoSection,
    };
};

