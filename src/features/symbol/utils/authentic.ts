import { AUTHENTIC_MAX_LEVEL } from "../data";

export interface AuthenticUpgrade {
    /** 지역명 (예: 세르니움) */
    area: string;
    /** 이 업그레이드로 도달하는 심볼 레벨 */
    level: number;
    /** 해당 레벨로 올리는 데 드는 메소 */
    price: number;
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

/** 원본 가격 데이터를 지역/레벨/Force 가 붙은 업그레이드 목록으로 변환 */
export function parseUpgrades(raw: RawAuthenticItem[]): AuthenticUpgrade[] {
    return raw.map((item) => {
        const [area, levelStr] = item.symbol.split("(");
        const level = parseInt(levelStr.replace(")", ""));
        return { area, level, price: item.price, force: forceOfLevel(level) };
    });
}

export interface PlanInput {
    /** 계산에 포함할 지역 */
    areas: string[];
    /** 지역별 현재 심볼 레벨 (0 또는 1 = 미보유/1레벨) */
    ownedLevels: Record<string, number>;
    /** 목표 Force */
    targetForce: number;
    upgrades: AuthenticUpgrade[];
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
    /** steps 의 총 메소 */
    totalCost: number;
    /** 업그레이드 후 도달 Force */
    reachedForce: number;
    /** 지역별 목표 레벨 */
    targetLevels: Record<string, number>;
    /** 지역별 필요 비용 */
    costByArea: Record<string, number>;
}

/**
 * 현재 심볼 상태에서 목표 Force 까지 가는 최소 비용 플랜.
 * 지역 내에서는 레벨이 오를수록 가격이 비싸지므로, 전체를 가격 오름차순으로
 * 그리디하게 선택해도 각 지역의 레벨 순서가 깨지지 않는다.
 */
export function planUpgrades({
    areas,
    ownedLevels,
    targetForce,
    upgrades,
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

    // 아직 올리지 않은 업그레이드만 후보로
    const candidates = upgrades
        .filter(
            (u) => areas.includes(u.area) && u.level > normalizedOwned[u.area]
        )
        .sort((a, b) => a.price - b.price);

    const maxForce =
        ownedForce + candidates.reduce((acc, u) => acc + u.force, 0);

    const targetLevels: Record<string, number> = { ...normalizedOwned };
    const costByArea: Record<string, number> = {};
    areas.forEach((area) => (costByArea[area] = 0));

    const steps: AuthenticUpgrade[] = [];
    let reachedForce = ownedForce;
    let totalCost = 0;

    for (const upgrade of candidates) {
        if (reachedForce >= targetForce) break;
        steps.push(upgrade);
        reachedForce += upgrade.force;
        totalCost += upgrade.price;
        targetLevels[upgrade.area] = Math.max(
            targetLevels[upgrade.area],
            upgrade.level
        );
        costByArea[upgrade.area] += upgrade.price;
    }

    return {
        ownedForce,
        missingForce: Math.max(0, targetForce - ownedForce),
        maxForce,
        achievable: reachedForce >= targetForce,
        steps,
        totalCost,
        reachedForce,
        targetLevels,
        costByArea,
    };
}
