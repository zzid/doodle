export * from "./authentic";
import { ARCANE_LEVEL_TABLE, ARCANE_WEEKLY_BONUS } from "../data";
// 주차 보너스 심볼 획득량 정의
// 목요일 0시를 주 시작으로 간주
export function getNextThursday(from: Date) {
    const date = new Date(from);
    const day = date.getDay();
    const offset = (11 - day) % 7 || 7;
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
}

// 예상 만렙 도달 일자 계획 전부를 반환
export function getAllArcaneLevelMilestones(
    currentLevel: number,
    currentCount: number,
    dailyGain: number
):
    | {
          level: number;
          requiredSymbol: number;
          dateReached: Date;
          remainingDays: number;
          symbolOnThisLevel: number;
          isMax: boolean;
      }[]
    | null {
    if (
        currentLevel < 1 ||
        currentLevel > 20 ||
        currentCount < 0 ||
        dailyGain <= 0
    )
        return null;

    let milestones = [];
    let nowCount = currentCount;
    let nowLevel = currentLevel;
    let date = new Date();
    let isMax = false;
    let levelTableIndex = nowLevel - 1;
    let remains = nowCount;

    let nextWeeklyBonusDate = getNextThursday(date);
    let currentDate = new Date(date);

    while (levelTableIndex < ARCANE_LEVEL_TABLE.length) {
        const need = ARCANE_LEVEL_TABLE[levelTableIndex].need;
        if (remains >= need) {
            remains -= need;
            nowLevel++;
            levelTableIndex++;
            if (nowLevel > 20) {
                isMax = true;
                break;
            }
            milestones.push({
                level: nowLevel,
                requiredSymbol: need,
                dateReached: new Date(currentDate),
                remainingDays: 0,
                symbolOnThisLevel: remains,
                isMax: nowLevel === 20,
            });
            continue;
        }

        let simDate = new Date(currentDate);
        let simSymbols = remains;
        let dayIndex = 0;

        while (true) {
            if (dayIndex > 3000) break;
            dayIndex++;
            simDate.setDate(simDate.getDate() + 1);
            simSymbols += dailyGain;
            if (simDate.getDay() === 4) {
                simSymbols += ARCANE_WEEKLY_BONUS;
            }
            if (simSymbols >= need) break;
        }
        let totalDaysPassed = Math.ceil(
            (simDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        nowLevel++;
        levelTableIndex++;
        currentDate = new Date(simDate);
        remains = simSymbols - need;

        milestones.push({
            level: nowLevel,
            requiredSymbol: need,
            dateReached: new Date(simDate),
            remainingDays: totalDaysPassed,
            symbolOnThisLevel: remains,
            isMax: nowLevel === 20,
        });

        if (nowLevel >= 20) break;
    }
    return milestones;
}
