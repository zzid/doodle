import React from "react";
import rawData from "../data/advantage_force.json";

interface RawItem {
    name: string;
    min: number;
    max: number;
}

export const BossAdvantageForce = ({
    selectedForce,
    setSelectedForce,
}: {
    selectedForce?: number;
    setSelectedForce: (force: number) => void;
}) => {
    return (
        <div>
            <h1>Boss Advantage Force</h1>
            <div className="grid gap-3 grid-cols-5 gap-4">
                {rawData
                    .sort((a, b) => a.min - b.min)
                    .map((item) => (
                        <div
                            key={item.name}
                            className="rounded-xl p-4 shadow-md bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white"
                        >
                            <h2 className="text-lg font-semibold mb-2 drop-shadow">
                                {item.name[0]}
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition 
                                    ${
                                        selectedForce === item.min
                                            ? "bg-white text-indigo-600 shadow-lg"
                                            : "bg-white/20 hover:bg-white/40"
                                    }`}
                                    onClick={() => setSelectedForce(item.min)}
                                >
                                    min {item.min}
                                </button>
                                <button
                                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition 
                                    ${
                                        selectedForce === item.max
                                            ? "bg-white text-pink-600 shadow-lg"
                                            : "bg-white/20 hover:bg-white/40"
                                    }`}
                                    onClick={() => setSelectedForce(item.max)}
                                >
                                    max {item.max}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
