import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import rawData from "../data/sorted_price_with_accumulated_only.json";
import { formatPrice } from "@/utils";
import {
    AREAS_WITHOUT_PRICE_DATA,
    ATHENTIC_AREAS,
    AUTHENTIC_MAX_LEVEL,
    AUTHENTIC_TIER_LABEL,
    AuthenticTier,
} from "../data";
import {
    accumulatedForceOfLevel,
    parseUpgrades,
    planUpgrades,
    RawAuthenticItem,
} from "../utils";
import { BossAdvantageForce } from "./BossAdvantageForce";
import {
    AssetIcon,
    GhostButton,
    NumberInput,
    PrimaryButton,
    StatTile,
    StepCard,
} from "./ui";

const ALL_UPGRADES = parseUpgrades(rawData as RawAuthenticItem[]);
const FORCE_STEP = 10;
const MIN_FORCE = 10;

type OwnedLevels = Record<string, number>;

const createOwnedLevels = (level = 0): OwnedLevels =>
    Object.fromEntries(ATHENTIC_AREAS.map(({ name }) => [name, level]));

/** 티어별로 지역을 묶어 [3/3] + [2] 형태로 보여주기 위한 헬퍼 */
const TIERS: AuthenticTier[] = ["normal", "grand"];
const areasOfTier = (tier: AuthenticTier) =>
    ATHENTIC_AREAS.filter((a) => a.tier === tier);

/** 티어 구분선이 들어간 지역 그리드 */
function TierGroups({
    renderArea,
}: {
    renderArea: (area: (typeof ATHENTIC_AREAS)[number]) => React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            {TIERS.map((tier) => (
                <div key={tier}>
                    <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
                            {AUTHENTIC_TIER_LABEL[tier]}
                        </span>
                        <span className="h-px flex-1 bg-line/10" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {areasOfTier(tier).map((area) => (
                            <React.Fragment key={area.name}>
                                {renderArea(area)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** 지역별 현재 심볼 레벨 입력 카드 */
function OwnedSymbolCard({
    area,
    image,
    level,
    enabled,
    onChange,
}: {
    area: string;
    image?: string;
    level: number;
    enabled: boolean;
    onChange: (level: number) => void;
}) {
    const clamp = (v: number) => Math.max(0, Math.min(AUTHENTIC_MAX_LEVEL, v));
    const atMin = level <= 0;
    const atMax = level >= AUTHENTIC_MAX_LEVEL;

    return (
        <div
            className={`rounded-xl border px-2 py-2 transition sm:px-3 sm:py-2.5 ${
                enabled
                    ? "border-line/10 bg-line/[0.03]"
                    : "border-line/5 bg-line/[0.01] opacity-40"
            }`}
        >
            <div className="mb-1.5 flex items-center gap-1.5">
                <AssetIcon src={image} name={area} size={24} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-content sm:text-sm">
                    {area}
                </span>
                <span className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent">
                    +{accumulatedForceOfLevel(level)}F
                </span>
            </div>

            <div className="flex items-center justify-center gap-1">
                <GhostButton
                    disabled={!enabled || atMin}
                    className="h-9 w-9 shrink-0 !px-0 text-lg leading-none disabled:opacity-25"
                    onClick={() => onChange(clamp(level - 1))}
                    aria-label={`${area} 레벨 1 감소`}
                >
                    −
                </GhostButton>
                <NumberInput
                    value={level}
                    disabled={!enabled}
                    // 0~11 숫자만. 소수점/부호/지수 입력을 막는다.
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    className="w-12 shrink-0 !px-0 text-center"
                    aria-label={`${area} 현재 심볼 레벨`}
                    aria-valuemin={0}
                    aria-valuemax={AUTHENTIC_MAX_LEVEL}
                    aria-valuenow={level}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        if (digits === "") return onChange(0);
                        onChange(clamp(parseInt(digits, 10)));
                    }}
                />
                <GhostButton
                    disabled={!enabled || atMax}
                    className="h-9 w-9 shrink-0 !px-0 text-lg leading-none disabled:opacity-25"
                    onClick={() => onChange(clamp(level + 1))}
                    aria-label={`${area} 레벨 1 증가`}
                >
                    +
                </GhostButton>
            </div>

            <div className="mt-1.5 flex gap-1">
                <GhostButton
                    disabled={!enabled || atMin}
                    className="flex-1 !px-0 py-1 text-[10px] disabled:opacity-25"
                    onClick={() => onChange(0)}
                    aria-label={`${area} 최소 레벨로`}
                >
                    MIN
                </GhostButton>
                <GhostButton
                    disabled={!enabled || atMax}
                    className="flex-1 !px-0 py-1 text-[10px] disabled:opacity-25"
                    onClick={() => onChange(AUTHENTIC_MAX_LEVEL)}
                    aria-label={`${area} 최대 레벨로`}
                >
                    MAX
                </GhostButton>
            </div>
        </div>
    );
}

export const BossForceCalc = () => {
    /** 진행 중인 지역. 이 지역과 그 이하 지역이 모두 계산에 포함된다. */
    const [currentArea, setCurrentArea] = useState<string>("도원경");
    const [ownedLevels, setOwnedLevels] = useState<OwnedLevels>(() =>
        createOwnedLevels(0)
    );
    const [selectedForce, setSelectedForce] = useState<number | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    /** 아래로 쌓인 단계 수 (1 → 4) */
    const [openStep, setOpenStep] = useState(1);

    const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const includedAreas = useMemo(() => {
        const idx = ATHENTIC_AREAS.findIndex(({ name }) => name === currentArea);
        return ATHENTIC_AREAS.slice(0, idx + 1).map(({ name }) => name);
    }, [currentArea]);

    // 새로 열린 단계로 부드럽게 스크롤
    useEffect(() => {
        const el = stepRefs.current[openStep];
        if (!el || openStep === 1) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [openStep]);

    const revealStep = (step: number) =>
        setOpenStep((prev) => Math.max(prev, step));

    const ownedForce = useMemo(
        () =>
            includedAreas.reduce(
                (acc, area) =>
                    acc + accumulatedForceOfLevel(ownedLevels[area] ?? 0),
                0
            ),
        [includedAreas, ownedLevels]
    );

    const maxForce = useMemo(
        () =>
            planUpgrades({
                areas: includedAreas,
                ownedLevels,
                targetForce: Number.MAX_SAFE_INTEGER,
                upgrades: ALL_UPGRADES,
                areasWithoutPrice: AREAS_WITHOUT_PRICE_DATA,
            }).maxForce,
        [includedAreas, ownedLevels]
    );

    const plan = useMemo(() => {
        if (!selectedForce) return null;
        return planUpgrades({
            areas: includedAreas,
            ownedLevels,
            targetForce: selectedForce,
            upgrades: ALL_UPGRADES,
            areasWithoutPrice: AREAS_WITHOUT_PRICE_DATA,
        });
    }, [selectedForce, includedAreas, ownedLevels]);

    const forceOptions = useMemo(() => {
        const options: number[] = [];
        for (let f = 50; f <= maxForce; f += FORCE_STEP) options.push(f);
        return options;
    }, [maxForce]);

    /** 10 단위로 목표 Force 조절 */
    const stepForce = (delta: number) => {
        setSelectedForce((prev) => {
            const base = prev ?? 50;
            const next = Math.round((base + delta) / FORCE_STEP) * FORCE_STEP;
            return Math.max(MIN_FORCE, Math.min(maxForce, next));
        });
        revealStep(4);
    };

    const reset = () => {
        setOwnedLevels(createOwnedLevels(0));
        setSelectedForce(null);
        setShowDetail(false);
        setOpenStep(1);
        stepRefs.current[1]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-end">
                <GhostButton onClick={reset}>처음으로</GhostButton>
            </div>

            {/* 1단계: 현재 지역 */}
            <div
                ref={(el) => {
                    stepRefs.current[1] = el;
                }}
            >
                <StepCard
                    index={1}
                    title="현재 진행 지역"
                    description="진행 중인 지역을 고르면 그 아래 지역이 모두 포함돼요."
                    done={openStep > 1}
                >
                    <TierGroups
                        renderArea={({ name, level, image }) => {
                            const selected = currentArea === name;
                            const included = includedAreas.includes(name);
                            return (
                                <button
                                    type="button"
                                    onClick={() => setCurrentArea(name)}
                                    aria-pressed={selected}
                                    className={`w-full rounded-xl border px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                                        selected
                                            ? "border-accent bg-accent/30 text-white shadow-[0_0_0_1px_rgb(var(--c-accent)/0.4)]"
                                            : included
                                            ? "border-accent/30 bg-accent/10 text-accent"
                                            : "border-line/10 bg-line/[0.02] text-faint hover:border-accent/40 hover:text-muted"
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-1.5">
                                        <AssetIcon
                                            src={image}
                                            name={name}
                                            size={22}
                                            className="border-0 bg-transparent"
                                            hideWhenMissing
                                        />
                                        <span className="truncate">{name}</span>
                                    </span>
                                    <span className="mt-0.5 block text-[10px] font-normal opacity-70">
                                        Lv.{level}+
                                    </span>
                                </button>
                            );
                        }}
                    />
                    <p className="mt-3 text-xs text-muted">
                        포함 지역{" "}
                        <b className="text-accent">
                            {includedAreas.length}곳
                        </b>{" "}
                        · {includedAreas.join(", ")}
                    </p>
                    {openStep === 1 && (
                        <div className="mt-4 flex justify-end">
                            <PrimaryButton onClick={() => revealStep(2)}>
                                다음
                            </PrimaryButton>
                        </div>
                    )}
                </StepCard>
            </div>

            {/* 2단계: 현재 심볼 상태 */}
            {openStep >= 2 && (
                <div
                    ref={(el) => {
                        stepRefs.current[2] = el;
                    }}
                >
                    <StepCard
                        index={2}
                        title="내 현재 심볼 상태"
                        description="지역별 어센틱 심볼 레벨을 입력하면 이미 확보한 Force를 빼고 계산해요. (0 = 미보유)"
                        done={openStep > 2}
                        right={
                            <div className="flex items-center gap-2">
                                <GhostButton
                                    onClick={() =>
                                        setOwnedLevels(createOwnedLevels(0))
                                    }
                                >
                                    전부 0
                                </GhostButton>
                                <GhostButton
                                    onClick={() =>
                                        setOwnedLevels(
                                            createOwnedLevels(
                                                AUTHENTIC_MAX_LEVEL
                                            )
                                        )
                                    }
                                >
                                    전부 만렙
                                </GhostButton>
                            </div>
                        }
                    >
                        <TierGroups
                            renderArea={({ name, image }) => (
                                <OwnedSymbolCard
                                    area={name}
                                    image={image}
                                    level={ownedLevels[name] ?? 0}
                                    enabled={includedAreas.includes(name)}
                                    onChange={(level) =>
                                        setOwnedLevels((prev) => ({
                                            ...prev,
                                            [name]: level,
                                        }))
                                    }
                                />
                            )}
                        />
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
                            <StatTile
                                label="현재 Force"
                                value={ownedForce}
                                tone="accent"
                            />
                            <StatTile
                                label="만렙 시 최대"
                                value={maxForce}
                                sub={`${includedAreas.length}곳 기준`}
                            />
                            <StatTile
                                label="성장 여력"
                                value={maxForce - ownedForce}
                                tone="good"
                            />
                        </div>
                        {openStep === 2 && (
                            <div className="mt-4 flex justify-end">
                                <PrimaryButton onClick={() => revealStep(3)}>
                                    다음
                                </PrimaryButton>
                            </div>
                        )}
                    </StepCard>
                </div>
            )}

            {/* 3단계: 목표 Force */}
            {openStep >= 3 && (
                <div
                    ref={(el) => {
                        stepRefs.current[3] = el;
                    }}
                >
                    <StepCard
                        index={3}
                        title="목표 Force 선택"
                        description="보스를 고르거나, 직접 값을 선택하고 10 단위로 조절하세요."
                        done={openStep > 3 && !!selectedForce}
                    >
                        <BossAdvantageForce
                            selectedForce={selectedForce ?? undefined}
                            setSelectedForce={(force) => {
                                setSelectedForce(force);
                                revealStep(4);
                            }}
                        />
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <select
                                className="min-w-0 flex-1 rounded-lg border border-line/15 bg-raised/80 px-3 py-2 text-sm text-content outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:min-w-[180px] sm:flex-none"
                                value={
                                    selectedForce &&
                                    forceOptions.includes(selectedForce)
                                        ? selectedForce
                                        : ""
                                }
                                onChange={(e) => {
                                    if (!e.target.value) return;
                                    setSelectedForce(parseInt(e.target.value));
                                    revealStep(4);
                                }}
                            >
                                <option value="" disabled>
                                    목표 Force 선택
                                </option>
                                {forceOptions.map((force) => (
                                    <option key={force} value={force}>
                                        {force}
                                        {force <= ownedForce ? " (달성)" : ""}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1 rounded-lg border border-line/15 bg-raised/60 p-1">
                                <GhostButton
                                    className="h-8 w-9 !px-0 text-base leading-none"
                                    onClick={() => stepForce(-FORCE_STEP)}
                                    aria-label={`목표 Force ${FORCE_STEP} 감소`}
                                >
                                    −
                                </GhostButton>
                                <span className="min-w-[48px] text-center text-base font-bold tabular-nums text-accent">
                                    {selectedForce ?? "-"}
                                </span>
                                <GhostButton
                                    className="h-8 w-9 !px-0 text-base leading-none"
                                    onClick={() => stepForce(FORCE_STEP)}
                                    aria-label={`목표 Force ${FORCE_STEP} 증가`}
                                >
                                    +
                                </GhostButton>
                            </div>
                        </div>
                        {selectedForce && (
                            <p className="mt-2 text-xs text-muted">
                                목표{" "}
                                <b className="tabular-nums text-accent">
                                    {selectedForce}
                                </b>{" "}
                                / 현재{" "}
                                <b className="tabular-nums text-content">
                                    {ownedForce}
                                </b>
                            </p>
                        )}
                    </StepCard>
                </div>
            )}

            {/* 4단계: 결과 */}
            {openStep >= 4 && plan && selectedForce && (
                <div
                    ref={(el) => {
                        stepRefs.current[4] = el;
                    }}
                >
                    <StepCard
                        index={4}
                        title="목표까지 필요한 비용"
                        description="현재 심볼 상태에서 가장 싼 강화부터 올렸을 때의 최소 비용이에요."
                    >
                        {plan.missingForce === 0 ? (
                            <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-good">
                                🎉 이미 목표 Force {selectedForce}를 달성했어요.
                                (현재 {plan.ownedForce})
                            </p>
                        ) : !plan.achievable ? (
                            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-sm font-semibold text-warn">
                                포함 지역을 전부 만렙까지 올려도 Force{" "}
                                {plan.maxForce}까지만 도달해요. 상위 지역을
                                선택해 주세요.
                            </p>
                        ) : null}

                        {plan.costIncomplete && (
                            <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-200">
                                기어드락 심볼의 강화 비용 데이터가 아직 없어서,
                                위 금액에는 기어드락 강화 {plan.unpricedSteps}회
                                분이 빠져 있어요. Force 계산에는 정상
                                포함됩니다.
                            </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
                            <StatTile
                                label="필요 비용"
                                value={`${formatPrice(plan.totalCost)}${
                                    plan.costIncomplete ? " +" : ""
                                }`}
                                tone="warn"
                                sub={
                                    plan.costIncomplete
                                        ? `강화 ${plan.steps.length}회 중 ${plan.unpricedSteps}회 비용 미확인`
                                        : `강화 ${plan.steps.length}회`
                                }
                            />
                            <StatTile
                                label="현재 Force"
                                value={plan.ownedForce}
                            />
                            <StatTile
                                label="부족 Force"
                                value={plan.missingForce}
                                tone="accent"
                            />
                            <StatTile
                                label="달성 Force"
                                value={plan.reachedForce}
                                tone="good"
                                sub={`목표 ${selectedForce}`}
                            />
                        </div>

                        {/* 지역별 목표 */}
                        <div className="mt-5">
                            <h3 className="mb-2 text-sm font-semibold text-muted">
                                지역별 목표 레벨
                            </h3>
                            <TierGroups
                                renderArea={({ name, image }) => {
                                    if (!includedAreas.includes(name))
                                        return (
                                            <div className="rounded-xl border border-line/5 bg-line/[0.01] px-2 py-2 opacity-30 sm:px-3 sm:py-2.5">
                                                <div className="truncate text-xs font-semibold text-faint sm:text-sm">
                                                    {name}
                                                </div>
                                                <div className="mt-1 text-xs text-faint">
                                                    미포함
                                                </div>
                                            </div>
                                        );
                                    const from = ownedLevels[name] ?? 0;
                                    const to = plan.targetLevels[name] ?? from;
                                    const cost = plan.costByArea[name] ?? 0;
                                    const grew = to > from;
                                    return (
                                        <div
                                            className={`rounded-xl border px-2 py-2 sm:px-3 sm:py-2.5 ${
                                                grew
                                                    ? "border-accent/50 bg-accent/10"
                                                    : "border-line/10 bg-line/[0.02]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <AssetIcon
                                                    src={image}
                                                    name={name}
                                                    size={20}
                                                />
                                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-content sm:text-sm">
                                                    {name}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs tabular-nums text-muted sm:text-sm">
                                                Lv.{from}
                                                {grew && (
                                                    <>
                                                        <span className="mx-1 text-accent">
                                                            →
                                                        </span>
                                                        <b className="text-accent">
                                                            Lv.{to}
                                                        </b>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-1 text-[10px] text-faint sm:text-[11px]">
                                                {!grew
                                                    ? "투자 없음"
                                                    : AREAS_WITHOUT_PRICE_DATA.includes(
                                                          name
                                                      )
                                                    ? "비용 미확인"
                                                    : formatPrice(cost)}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* 강화 순서 상세 */}
                        {plan.steps.length > 0 && (
                            <div className="mt-5">
                                <GhostButton
                                    onClick={() => setShowDetail((v) => !v)}
                                >
                                    {showDetail
                                        ? "강화 순서 접기"
                                        : "강화 순서 보기"}{" "}
                                    ({plan.steps.length}회)
                                </GhostButton>
                                <AnimatePresence initial={false}>
                                    {showDetail && (
                                        <motion.div
                                            key="detail"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full min-w-[360px] text-xs sm:text-sm">
                                                    <thead>
                                                        <tr className="border-b border-line/10 text-[10px] uppercase tracking-wide text-faint">
                                                            <th className="px-1.5 py-1.5 text-left font-semibold">
                                                                #
                                                            </th>
                                                            <th className="px-1.5 py-1.5 text-left font-semibold">
                                                                지역
                                                            </th>
                                                            <th className="px-1.5 py-1.5 text-right font-semibold">
                                                                레벨
                                                            </th>
                                                            <th className="px-1.5 py-1.5 text-right font-semibold">
                                                                비용
                                                            </th>
                                                            <th className="px-1.5 py-1.5 text-right font-semibold">
                                                                누적 F
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {plan.steps.map(
                                                            (s, idx) => {
                                                                const acc =
                                                                    plan.ownedForce +
                                                                    plan.steps
                                                                        .slice(
                                                                            0,
                                                                            idx +
                                                                                1
                                                                        )
                                                                        .reduce(
                                                                            (
                                                                                a,
                                                                                c
                                                                            ) =>
                                                                                a +
                                                                                c.force,
                                                                            0
                                                                        );
                                                                return (
                                                                    <tr
                                                                        key={`${s.area}-${s.level}`}
                                                                        className="border-b border-line/5 text-muted"
                                                                    >
                                                                        <td className="px-1.5 py-1.5 tabular-nums text-faint">
                                                                            {idx +
                                                                                1}
                                                                        </td>
                                                                        <td className="px-1.5 py-1.5">
                                                                            {
                                                                                s.area
                                                                            }
                                                                        </td>
                                                                        <td className="px-1.5 py-1.5 text-right tabular-nums">
                                                                            {s.level -
                                                                                1}{" "}
                                                                            →{" "}
                                                                            <b className="text-accent">
                                                                                {
                                                                                    s.level
                                                                                }
                                                                            </b>
                                                                        </td>
                                                                        <td className="px-1.5 py-1.5 text-right tabular-nums text-warn/90">
                                                                            {s.price ===
                                                                            null
                                                                                ? "미확인"
                                                                                : formatPrice(
                                                                                      s.price
                                                                                  )}
                                                                        </td>
                                                                        <td className="px-1.5 py-1.5 text-right tabular-nums text-muted">
                                                                            {acc}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </StepCard>
                </div>
            )}
        </div>
    );
};
