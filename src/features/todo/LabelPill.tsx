import React from "react";
import { X } from "lucide-react";
import { labelStyle } from "./labels";
import { useTodoStore } from "./store";

/** GitHub 라벨 모양 알약. 등록 안 된 이름이면 회색 */
export function LabelPill({
    name,
    color,
    size = "sm",
    onRemove,
}: {
    name: string;
    /** 미리보기처럼 저장 전 색을 직접 줄 때 */
    color?: string;
    size?: "sm" | "md";
    onRemove?: () => void;
}) {
    const stored = useTodoStore((s) => s.labels.find((l) => l.name === name)?.color);
    return (
        <span
            style={labelStyle(color ?? stored ?? "#8b949e")}
            className={`inline-flex max-w-full items-center gap-1 rounded-full border font-semibold leading-none ${
                size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-[3px] text-[11px]"
            }`}
        >
            <span className="truncate">{name || "라벨 미리보기"}</span>
            {onRemove && (
                <button
                    type="button"
                    aria-label={`${name} 라벨 빼기`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="-mr-0.5 opacity-70 hover:opacity-100"
                >
                    <X size={11} />
                </button>
            )}
        </span>
    );
}
