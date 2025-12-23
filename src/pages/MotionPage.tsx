import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    SvgAnimationExample,
    ExitAnimationExample,
    TabAnimationExample,
    MobiusStrip,
} from "@/features/motions";

export const MotionPage = () => {
    return (
        <div className="flex p-5 flex-col gap-5 justify-center items-center">
            <Equalizer />
            {/* <SvgAnimationExample /> */}
            <ExitAnimationExample />
            <TabAnimationExample />
            <MobiusStrip />
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                role="img"
                aria-label="Apple logo"
                style={{
                    width: "100px",
                    height: "100px",
                    color: "#fff",
                    filter: "drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px #0d63f8) drop-shadow(0 0 30px rgb(255, 140, 0))",
                }}
                initial={{
                    // opacity: 1,
                    filter: "drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px #0d63f8) drop-shadow(0 0 30px rgb(255, 140, 0))",
                }}
                animate={{
                    // opacity: [1, 0.4, 1],
                    filter: [
                        "drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px #0d63f8) drop-shadow(0 0 30px rgb(255, 140, 0))",
                        "drop-shadow(0 0 40px #fff) drop-shadow(0 0 30px #0d63f8) drop-shadow(0 0 60px rgb(255, 140, 0))",
                        "drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px #0d63f8) drop-shadow(0 0 30px rgb(255, 140, 0))",
                    ],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                }}
            >
                <motion.path
                    fill="currentColor"
                    d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"
                />
            </motion.svg>
        </div>
    );
};

const Equalizer = () => {
    return (
        <div
            className="flex flex-row gap-1 p-10 w-[100px] h-[100px] border-4 rounded-full justify-center items-center"
            style={{
                boxShadow:
                    "0 0 20px 4px #fff, 0 0 40px 8px #0d63f8, 0 0 60px 12px #ff0088",
                borderColor: "#fff",
            }}
        >
            <AnimatePresence>
                <div className="flex flex-row items-end gap-1 h-[50px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: [0, 50, 0] }}
                            transition={{
                                duration: 0.5 + index * 0.1,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "linear",
                                // delay: index * 0.2,
                                // The 'times' property defines at what point in the animation timeline (as a fraction from 0 to 1) each value in the 'height' array should be reached.
                                times: [0, 0.5, 1],
                            }}
                            style={line(index)}
                        />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
};
const line = (index: number) => ({
    backgroundColor: ["#ff0088", "#0d63f8", "#8df0cc", "#f8e71c", "#f85a0d"][
        index % 5
    ],
    width: "8px",
});
