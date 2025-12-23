import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * MöbiusStripLine – Infinite line-drawing animation along a Möbius strip
 * - Uses SVG strokeDasharray / strokeDashoffset
 * - Framer Motion animates the line moving along the path endlessly
 */
export const MobiusStrip = ({
    size = 320,
    strokeWidth = 10,
    speed = 1,
    hue = 100,
}: {
    size?: number;
    strokeWidth?: number;
    speed?: number;
    hue?: number;
}) => {
    const viewBox = `0 0 ${size} ${size}`;
    const a = size * 0.28; // scale for the lemniscate
    const cx = size / 2;
    const cy = size / 2;

    // Generate lemniscate path (figure-8 / Möbius projection)
    const d = useMemo(() => {
        const steps = 400;
        const pts: [number, number][] = [];
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const x = a * Math.cos(t);
            const y = a * Math.sin(t) * Math.cos(t);
            pts.push([cx + x, cy + y]);
        }
        const [x0, y0] = pts[0];
        const commands = ["M", x0.toFixed(3), y0.toFixed(3)];
        for (let i = 1; i < pts.length; i++) {
            const [x, y] = pts[i];
            commands.push("L", x.toFixed(3), y.toFixed(3));
        }
        return commands.join(" ");
    }, [a, cx, cy]);

    const color = `hsl(${hue} 90% 50%)`;

    return (
        <div className="w-full h-full grid place-items-center p-6 bg-transparent">
            <svg
                width={size}
                height={size}
                viewBox={viewBox}
                role="img"
                aria-label="Animated Möbius strip line"
            >
                <motion.path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50 500" // pattern: small dash + large gap
                    animate={{
                        strokeDashoffset: [-550, 0],
                        stroke: [
                            `hsl(0 90% 50%)`,
                            `hsl(300 90% 50%)`,
                            `hsl(0 90% 50%)`,
                        ],
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "linear",
                        duration: 5,
                    }}
                />
            </svg>
            <div className="mt-4 text-xs text-gray-500 text-center">
                Möbius strip · Line follows infinitely
            </div>
        </div>
    );
};

/**
 * Usage:
 * <MobiusStripLine size={360} strokeWidth={14} speed={4} hue={300} />
 *
 * Explanation:
 * - strokeDasharray: defines dash/gap pattern
 * - strokeDashoffset: animated so the dash appears to move along path
 */
