import React, { useState, useMemo, useRef, useEffect } from "react";
import rawData from "../data/sorted_price_with_accumulated_only.json";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/utils";
import { BossAdvantageForce } from "./BossAdvantageForce";
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

const Areas: { name: string; level: number }[] = [
    { name: "세르니움", level: 260 },
    { name: "아르크스", level: 265 },
    { name: "오디움", level: 270 },
    { name: "도원경", level: 275 },
    { name: "아르테리아", level: 280 },
    { name: "카르시온", level: 285 },
    { name: "탈라하트", level: 290 },
];

export const SymbolCalc = () => {
    const [currentLevel, setCurrentLevel] = useState<number>(275);
    const [includedAreas, setIncludedAreas] = useState<string[]>(
        Areas.slice(0, 6).map(({ name }) => name)
    );
    const [step, setStepState] = useState<TSteps>(1);
    const [selectedForce, setSelectedForce] = useState<number | null>(null);
    const prevStep = useRef<TSteps>(step);

    useEffect(() => {
        setIncludedAreas(
            Areas.filter(({ level }) => level <= currentLevel).map(
                ({ name }) => name
            )
        );
    }, [currentLevel]);
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
                        <div className="gap-3 grid grid-cols-3 max-w-[400px]">
                            {Areas.map(({ name }) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={`inline-flex items-center justify-center space-x-1 rounded-lg p-3 border transition-colors max-w-[150px]
                                        ${
                                            includedAreas.includes(name)
                                                ? "bg-indigo-600 text-white border-yellow-500 border-4"
                                                : "bg-gray-300 text-black border-gray-300 hover:bg-indigo-100"
                                        }
                                    `}
                                    onClick={() => {
                                        setIncludedAreas((prev) =>
                                            prev.includes(name)
                                                ? prev.filter((a) => a !== name)
                                                : [...prev, name]
                                        );
                                    }}
                                >
                                    {/* <span
                                        className={`w-4 h-4 inline-block rounded-full border-2 mr-1
                                        ${
                                            includedAreas.includes(area)
                                                ? "bg-gray-200 border-gray-300"
                                                : "bg-white border-white"
                                        }
                                    `}
                                    /> */}
                                    <span>{name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <label
                                htmlFor="currentLevel"
                                className="font-medium"
                            >
                                현재 레벨:
                            </label>
                            <input
                                id="currentLevel"
                                type="number"
                                min={260}
                                max={300}
                                className="border rounded px-2 py-1 w-20 text-black"
                                value={currentLevel ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentLevel(val ? parseInt(val) : 260);
                                }}
                                placeholder="최소값 260"
                            />
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
                        <BossAdvantageForce
                            // selectedForce={selectedForce}
                            setSelectedForce={setSelectedForce}
                        />
                        <div className="w-full flex flex-row gap-4">
                            <select
                                className="w-full max-w-[200px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                value={selectedForce ?? ""}
                                onChange={(e) => {
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
                            📈 최소 비용:&nbsp;
                            {formatPrice(selectedResult.accumulatedPrice)} /
                            Force: {selectedResult.accumulatedForce}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {Areas.map(({ name }) => (
                                <div
                                    key={name}
                                    className="border rounded p-4 h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
                                >
                                    {includedAreas.includes(name) &&
                                    maxLevels[name] ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div>{name}</div>
                                            <div>{maxLevels[name]}레벨</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">
                                            {name}
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
