import { AUTHENTIC_MAX_LEVEL } from "../data";

export interface AuthenticUpgrade {
    /** 지역명 (예: 세르니움) */
    area: string;
    /** 이 업그레이드로 도달하는 심볼 레벨 */
    level: number;
    /** 해당 레벨로 올리는 데 드는 메소. null 이면 가격 데이터 미확인 */
    price: number | null;
    /** 해당 레벨로 올렸을 때 추가되는 보스 어드밴티지 Force */
    force: number;
}

export interface RawAuthenticItem {
    /** "세르니움(2)" 형태 */
    symbol: string;
    price: number;
}

/** 해당 레벨로 올렸을 때 추가되는 Force (1→2 는 20, 이후 10씩) */
export function forceOfLevel(level: number) {
    return level === 2 ? 20 : 10;
}

/** 특정 레벨을 보유 중일 때 이미 확보한 누적 Force */
export function accumulatedForceOfLevel(level: number) {
    let sum = 0;
    for (let lv = 2; lv <= level; lv++) sum += forceOfLevel(lv);
    return sum;
}

/** 지역 하나를 만렙까지 올렸을 때의 총 Force */
export const MAX_FORCE_PER_AREA = accumulatedForceOfLevel(AUTHENTIC_MAX_LEVEL);

/** 원본 가격 데이터를 지역/레벨/Force 가 붙은 업그레이드 목록으로 변환 */
export function parseUpgrades(raw: RawAuthenticItem[]): AuthenticUpgrade[] {
    return raw.map((item) => {
        const [area, levelStr] = item.symbol.split("(");
        const level = parseInt(levelStr.replace(")", ""));
        return { area, level, price: item.price, force: forceOfLevel(level) };
    });
}

/**
 * 가격 데이터가 없는 지역의 업그레이드를 만들어 둔다.
 * Force 는 정상 계산하되 price 는 null 로 둬서 비용에서 분리한다.
 */
function synthesizeUnpricedUpgrades(area: string): AuthenticUpgrade[] {
    const list: AuthenticUpgrade[] = [];
    for (let level = 2; level <= AUTHENTIC_MAX_LEVEL; level++) {
        list.push({ area, level, price: null, force: forceOfLevel(level) });
    }
    return list;
}

export interface PlanInput {
    /** 계산에 포함할 지역 */
    areas: string[];
    /** 지역별 현재 심볼 레벨 (0 = 미보유) */
    ownedLevels: Record<string, number>;
    /** 목표 Force */
    targetForce: number;
    /** 가격이 있는 업그레이드 목록 */
    upgrades: AuthenticUpgrade[];
    /** 가격 데이터가 없는 지역 */
    areasWithoutPrice?: string[];
}

export interface PlanResult {
    /** 현재 심볼 상태로 이미 확보한 Force */
    ownedForce: number;
    /** 목표까지 모자란 Force */
    missingForce: number;
    /** 선택된 지역을 전부 만렙까지 올렸을 때의 Force */
    maxForce: number;
    /** 목표 달성이 가능한지 */
    achievable: boolean;
    /** 목표 달성에 필요한 최소 비용 업그레이드 목록 (싼 순) */
    steps: AuthenticUpgrade[];
    /** steps 중 가격을 아는 것들의 총 메소 */
    totalCost: number;
    /** steps 중 가격 미확인 강화 횟수 */
    unpricedSteps: number;
    /** 가격 미확인 강화가 포함돼 totalCost 가 과소 집계된 상태인지 */
    costIncomplete: boolean;
    /** 업그레이드 후 도달 Force */
    reachedForce: number;
    /** 지역별 목표 레벨 */
    targetLevels: Record<string, number>;
    /** 지역별 필요 비용 (가격 미확인 지역은 0) */
    costByArea: Record<string, number>;
}

/**
 * 현재 심볼 상태에서 목표 Force 까지 가는 최소 비용 플랜.
 * 지역 내에서는 레벨이 오를수록 가격이 비싸지므로, 전체를 가격 오름차순으로
 * 그리디하게 선택해도 각 지역의 레벨 순서가 깨지지 않는다.
 *
 * 가격 데이터가 없는 지역은 "가장 비싼 최신 지역"으로 보고 맨 뒤에 배치한다.
 * (실제로도 상위 지역일수록 비싸므로 순서상 합리적이고, 비용은 따로 표기한다)
 */
export function planUpgrades({
    areas,
    ownedLevels,
    targetForce,
    upgrades,
    areasWithoutPrice = [],
}: PlanInput): PlanResult {
    const normalizedOwned: Record<string, number> = {};
    areas.forEach((area) => {
        const lv = ownedLevels[area] ?? 0;
        normalizedOwned[area] = Math.max(
            0,
            Math.min(AUTHENTIC_MAX_LEVEL, Math.floor(lv))
        );
    });

    const ownedForce = areas.reduce(
        (acc, area) => acc + accumulatedForceOfLevel(normalizedOwned[area]),
        0
    );

    const unpricedSet = new Set(areasWithoutPrice);

    // 아직 올리지 않은 업그레이드만 후보로 (가격순 → 가격 미확인 지역 순)
    const priced = upgrades
        .filter(
            (u) =>
                areas.includes(u.area) &&
                !unpricedSet.has(u.area) &&
                u.level > normalizedOwned[u.area]
        )
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

    const unpriced = areas
        .filter((area) => unpricedSet.has(area))
        .flatMap((area) =>
            synthesizeUnpricedUpgrades(area).filter(
                (u) => u.level > normalizedOwned[area]
            )
        )
        .sort((a, b) => a.level - b.level);

    const candidates = [...priced, ...unpriced];

    const maxForce =
        ownedForce + candidates.reduce((acc, u) => acc + u.force, 0);

    const targetLevels: Record<string, number> = { ...normalizedOwned };
    const costByArea: Record<string, number> = {};
    areas.forEach((area) => (costByArea[area] = 0));

    const steps: AuthenticUpgrade[] = [];
    let reachedForce = ownedForce;
    let totalCost = 0;
    let unpricedSteps = 0;

    for (const upgrade of candidates) {
        if (reachedForce >= targetForce) break;
        steps.push(upgrade);
        reachedForce += upgrade.force;
        if (upgrade.price === null) {
            unpricedSteps++;
        } else {
            totalCost += upgrade.price;
            costByArea[upgrade.area] += upgrade.price;
        }
        targetLevels[upgrade.area] = Math.max(
            targetLevels[upgrade.area],
            upgrade.level
        );
    }

    return {
        ownedForce,
        missingForce: Math.max(0, targetForce - ownedForce),
        maxForce,
        achievable: reachedForce >= targetForce,
        steps,
        totalCost,
        unpricedSteps,
        costIncomplete: unpricedSteps > 0,
        reachedForce,
        targetLevels,
        costByArea,
    };
}
