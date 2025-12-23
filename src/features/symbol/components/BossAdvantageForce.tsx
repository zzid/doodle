import React, { useState } from "react";
import rawData from "../data/advantage_force.json";
import { AnimatePresence, motion } from "framer-motion";

interface RawItem {
    name: string;
    min: number;
    max: number;
    difficulty: "Easy" | "Normal" | "Hard" | "Extreme" | "Chaos" | "All";
}

export const BossAdvantageForce = ({
    selectedForce,
    setSelectedForce,
}: {
    selectedForce?: number;
    setSelectedForce: (force: number) => void;
}) => {
    const [collapsed, setCollapsed] = useState(true);
    return (
        <div>
            <div className="flex flex-row items-center gap-2"> 
                <button
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 ${
                        collapsed ? "bg-indigo-600" : "bg-indigo-800"
                    }`}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    보스 포뻥 선택
                </button>
                {/* <button onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    )}
                </button> */}
            </div>

            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        key="content"
                        initial={{
                            opacity: 0,
                            // height: 0,
                            x: 10,
                        }}
                        animate={{
                            opacity: 1,
                            // height: "auto",
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            // height: 0,
                            x: -10,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid gap-3 grid-cols-5 gap-4">
                            {(rawData as RawItem[])
                                .sort((a, b) => a.min - b.min)
                                .map((item) => (
                                    <div
                                        key={item.name}
                                        className={`rounded-xl p-4 shadow-md bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white`}
                                    >
                                        <div className="text-md font-semibold mb-2 drop-shadow flex flex-row items-center gap-2 justify-between px-3">
                                            {item.name}&nbsp;
                                            <div
                                                className={`text-sm font-normal bg-gradient-to-r rounded-full px-3 py-1 ${
                                                    item.difficulty === "Easy"
                                                        ? "from-gray-400 via-gray-400 to-gray-400"
                                                        : item.difficulty ===
                                                          "Normal"
                                                        ? "from-blue-400 via-blue-400 to-blue-400"
                                                        : item.difficulty ===
                                                          "Hard"
                                                        ? "from-red-500 via-red-500 to-red-500"
                                                        : item.difficulty ===
                                                          "Extreme"
                                                        ? "from-purple-500 via-purple-500 to-purple-500"
                                                        : item.difficulty ===
                                                          "Chaos"
                                                        ? "from-zinc-600 via-red-500 to-zinc-600 text-white-700"
                                                        : item.difficulty ===
                                                          "All"
                                                        ? "from-gray-500 via-gray-500 to-gray-500"
                                                        : "from-purple-500 via-purple-500 to-purple-500"
                                                }`}
                                            >
                                                {item.difficulty}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <button
                                                className={`flex-1 px-4 py-2 rounded-lg font-bold transition 
                                    ${
                                        selectedForce === item.min
                                            ? "bg-white text-indigo-600 shadow-lg"
                                            : "bg-white/20 hover:bg-white/40"
                                    }`}
                                                onClick={() => {
                                                    setSelectedForce(item.min);
                                                    setCollapsed(true);
                                                }}
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
                                                onClick={() => {
                                                    setSelectedForce(item.max);
                                                    setCollapsed(true);
                                                }}
                                            >
                                                max {item.max}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
