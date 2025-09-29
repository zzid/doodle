import React, { useState, useMemo, useRef } from "react";
import rawData from "../data/sorted_price_with_accumulated_only.json";
import { motion, AnimatePresence } from "framer-motion";

interface RawItem {
    symbol: string;
    price: number;
}

interface EnrichedItem extends RawItem {
    area: string;
    level: number;
    force: number;
    accumulatedPrice: number;
    accumulatedForce: number;
}

type TSteps = 1 | 2 | 3;
const Areas: string[] = [
    "세르니움",
    "아르크스",
    "오디움",
    "도원경",
    "아르테리아",
    "카르시온",
    "탈라하트",
];

export const SymbolCalc = () => {
    const [includedAreas, setIncludedAreas] = useState<string[]>(Areas);
    const [step, setStepState] = useState<TSteps>(1);
    const [selectedForce, setSelectedForce] = useState<number | null>(null);
    const prevStep = useRef<TSteps>(step);
    const enrichingData = (data: RawItem[]) => {
        let totalPrice = 0;
        let totalForce = 0;
        return data
            .sort((a, b) => a.price - b.price)
            .map((item) => {
                const [area, levelStr] = item.symbol.split("(");
                const level = parseInt(levelStr.replace(")", ""));
                const force = level === 2 ? 20 : 10;
                totalPrice += item.price;
                totalForce += force;
                return {
                    ...item,
                    area,
                    level,
                    force,
                    accumulatedPrice: totalPrice,
                    accumulatedForce: totalForce,
                };
            });
    };

    const setStep = (nextStep: TSteps) => {
        setStepState((prev) => {
            prevStep.current = prev;
            return nextStep;
        });
    };

    const filtered = useMemo(() => {
        return enrichingData(
            rawData.filter((item) =>
                includedAreas.includes(item.symbol.split("(")[0])
            )
        );
    }, [includedAreas, rawData]);

    const forceRange = useMemo(() => {
        const forces = filtered.map((i) => i.accumulatedForce);
        return {
            min: 50, //Math.min(...forces),
            max: Math.max(...forces),
        };
    }, [filtered]);

    console.log("forceRange", filtered);
    const selectedResult = useMemo(() => {
        if (!selectedForce || filtered.length === 0) return null;
        return (
            filtered.find((item) => item.accumulatedForce === selectedForce) ||
            null
        );
    }, [selectedForce, filtered]);

    const maxLevels = useMemo(() => {
        if (!selectedResult) return {};
        const index = filtered.findIndex(
            (item) => item.symbol === selectedResult.symbol
        );
        const slice = filtered.slice(0, index + 1);
        const levels: Record<string, number> = {};
        slice.forEach((item) => {
            levels[item.area] = Math.max(levels[item.area] || 0, item.level);
        });
        return levels;
    }, [selectedResult, filtered]);

    return (
        <div className="w-[100vw] h-[100vh] max-w-4xl mx-auto p-6 space-y-6 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors">
            <div className="flex justify-end gap-2">
                <button
                    className="px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    onClick={() => {
                        setStep((step - 1) as TSteps);
                    }}
                >
                    뒤로
                </button>
                <button
                    className="px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    onClick={() => setStep(1)}
                >
                    처음으로
                </button>
            </div>
            <AnimatePresence>
                {step === 1 && (
                    <motion.section
                        key="step1"
                        className="space-y-4"
                        initial={{
                            opacity: 0,
                            x: prevStep.current < step ? 30 : -30,
                            scale: 0.98,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h2 className="text-xl font-bold">1단계: 지역 선택</h2>
                        <div className="flex flex-wrap gap-3">
                            {Areas.map((area) => (
                                <label
                                    key={area}
                                    className="inline-flex items-center space-x-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={includedAreas.includes(area)}
                                        onChange={() => {
                                            setIncludedAreas((prev) =>
                                                prev.includes(area)
                                                    ? prev.filter(
                                                          (a) => a !== area
                                                      )
                                                    : [...prev, area]
                                            );
                                        }}
                                        className="form-checkbox h-5 w-5 text-indigo-500"
                                    />
                                    <span>{area}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            disabled={includedAreas.length === 0}
                            onClick={() => setStep(2)}
                        >
                            확인
                        </button>
                    </motion.section>
                )}

                {step === 2 && (
                    <motion.section
                        key="step2"
                        className="space-y-4"
                        initial={{
                            opacity: 0,
                            x: prevStep.current < step ? 30 : -30,
                            scale: 0.98,
                        }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 18,
                            duration: 0.5,
                        }}
                    >
                        <h2 className="text-xl font-bold">
                            2단계: 목표 Force 선택
                        </h2>
                        <div className="w-full flex flex-row gap-4">
                            <select
                                className="w-full max-w-[200px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                value={selectedForce ?? ""}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setSelectedForce(
                                        e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                    );
                                }}
                            >
                                <option value="" disabled>
                                    목표 Force를 선택하세요
                                </option>
                                {Array.from(
                                    {
                                        length:
                                            Math.floor(
                                                (forceRange.max -
                                                    forceRange.min) /
                                                    10
                                            ) + 1,
                                    },
                                    (_, i) => forceRange.min + i * 10
                                ).map((force) => (
                                    <option key={force} value={force}>
                                        {force}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                disabled={!selectedForce}
                                onClick={() => setStep(3)}
                            >
                                다음
                            </button>
                        </div>
                    </motion.section>
                )}

                {step === 3 && selectedResult && (
                    <motion.section
                        key="step3"
                        className="space-y-4"
                        initial={{
                            opacity: 0,
                            x: prevStep.current < step ? 30 : -30,
                            scale: 0.98,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h2 className="text-xl font-bold">
                            3단계: 최소 비용 + 도달 레벨 보기
                        </h2>
                        <p>
                            📈 최소 비용: ₩
                            {selectedResult.accumulatedPrice.toLocaleString()} /
                            Force: {selectedResult.accumulatedForce}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {Areas.map((area) => (
                                <div
                                    key={area}
                                    className="border rounded p-4 h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
                                >
                                    {includedAreas.includes(area) &&
                                    maxLevels[area] ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div>{area}</div>
                                            <div>{maxLevels[area]}레벨</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">
                                            {area}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};
