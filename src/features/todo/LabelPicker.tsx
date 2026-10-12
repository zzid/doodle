import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Settings2 } from "lucide-react";
import { popover } from "@/config/motion";
import { cleanLabel, nextPreset } from "./labels";
import { useTodoStore } from "./store";

/**
 * GitHub 이슈 사이드바의 Labels 선택 창처럼:
 * 검색 → 체크로 붙이고 떼기 → 없으면 바로 새 라벨 만들기
 */
export function LabelPicker({
    selected,
    onChange,
    onManage,
}: {
    selected: string[];
    onChange: (names: string[]) => void;
    onManage: () => void;
}) {
    const labels = useTodoStore((s) => s.labels);
    const createLabel = useTodoStore((s) => s.createLabel);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    const q = cleanLabel(query).toLowerCase();
    const matches = labels.filter(
        (l) => !q || l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    );
    const exact = labels.some((l) => l.name.toLowerCase() === q);
    const toggle = (name: string) =>
        onChange(selected.includes(name) ? selected.filter((x) => x !== name) : [...selected, name]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition hover:bg-line/10 hover:text-content"
            >
                <Settings2 size={13} /> 라벨 선택
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        variants={popover}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-[calc(100%+6px)] z-10 w-72 overflow-hidden rounded-xl border border-line/15 bg-surface shadow-2xl shadow-black/60"
                    >
                        <div className="border-b border-line/10 p-2">
                            <div className="mb-1.5 px-1 text-xs font-semibold text-content">라벨 붙이기</div>
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && q) {
                                        e.preventDefault();
                                        const hit = labels.find((l) => l.name.toLowerCase() === q) ?? matches[0];
                                        if (hit) toggle(hit.name);
                                        else {
                                            const name = cleanLabel(query);
                                            createLabel({ name, color: nextPreset(labels.map((l) => l.color)), description: "" });
                                            onChange([...selected, name]);
                                        }
                                        setQuery("");
                                    }
                                }}
                                placeholder="라벨 검색 또는 새로 만들기"
                                className="w-full rounded-md border border-line/15 bg-raised/80 px-2.5 py-1.5 text-sm text-content outline-none placeholder:text-faint focus:border-accent"
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                            {matches.map((l) => {
                                const on = selected.includes(l.name);
                                return (
                                    <button
                                        key={l.name}
                                        type="button"
                                        onClick={() => toggle(l.name)}
                                        className="flex w-full items-start gap-2 px-3 py-2 text-left transition hover:bg-line/[0.06]"
                                    >
                                        <Check size={14} className={`mt-0.5 shrink-0 ${on ? "text-accent" : "invisible"}`} />
                                        <span
                                            className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: l.color }}
                                        />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-content">{l.name}</span>
                                            {l.description && (
                                                <span className="block truncate text-xs text-muted">{l.description}</span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                            {q && !exact && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const name = cleanLabel(query);
                                        createLabel({ name, color: nextPreset(labels.map((l) => l.color)), description: "" });
                                        onChange([...selected, name]);
                                        setQuery("");
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-accent transition hover:bg-accent/10"
                                >
                                    <Plus size={14} /> 새 라벨 만들기 <b>&quot;{cleanLabel(query)}&quot;</b>
                                </button>
                            )}
                            {!labels.length && !q && (
                                <p className="px-3 py-4 text-center text-xs text-faint">아직 라벨이 없어요. 이름을 입력해 만들어 보세요.</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onManage();
                            }}
                            className="flex w-full items-center gap-1.5 border-t border-line/10 px-3 py-2 text-xs text-muted transition hover:bg-line/[0.06] hover:text-content"
                        >
                            <Settings2 size={13} /> 라벨 관리
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
