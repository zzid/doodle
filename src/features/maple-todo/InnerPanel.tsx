import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { type Character, GRADES, GRADE_COLOR, INNER_CATEGORIES, useMapleTodo } from "./store";

/** 게임 어빌리티 창처럼: 등급 색 헤더 + 옵션 3줄 */
export function AbilityCard({ char }: { char: Character }) {
    const updateAbility = useMapleTodo((s) => s.updateAbility);
    const ab = char.ability;
    const color = ab.grade ? GRADE_COLOR[ab.grade] : "rgb(var(--c-line) / 0.25)";

    return (
        <div className="overflow-hidden rounded-xl border-2" style={{ borderColor: color }}>
            <div
                className="flex items-center justify-between gap-2 px-3 py-2"
                style={{ backgroundColor: ab.grade ? `${GRADE_COLOR[ab.grade]}22` : undefined }}
            >
                <span className="text-sm font-bold text-content">
                    어빌리티
                    {ab.grade && (
                        <span className="ml-1.5 text-xs font-semibold" style={{ color }}>
                            {ab.grade}
                        </span>
                    )}
                </span>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
                    <input
                        type="checkbox"
                        checked={ab.done}
                        onChange={() => updateAbility(char.id, { done: !ab.done })}
                        className="h-3.5 w-3.5 accent-[rgb(var(--c-good))]"
                    />
                    완료
                </label>
            </div>
            <div className="space-y-1.5 p-3">
                <div className="mb-2 flex flex-wrap gap-1">
                    {GRADES.map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => updateAbility(char.id, { grade: ab.grade === g ? undefined : g })}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                                ab.grade === g ? "text-bg" : "bg-line/[0.06] text-muted hover:text-content"
                            }`}
                            style={ab.grade === g ? { backgroundColor: GRADE_COLOR[g] } : undefined}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                {ab.lines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <i className="h-5 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <input
                            value={line}
                            onChange={(e) => {
                                const lines = [...ab.lines] as [string, string, string];
                                lines[i] = e.target.value;
                                updateAbility(char.id, { lines });
                            }}
                            placeholder={["예: 보스 공격력 20%", "예: 공격력 버프 +50", "예: 패시브 +1"][i]}
                            className={`min-w-0 flex-1 rounded-md border border-line/10 bg-raised/60 px-2 py-1 text-sm outline-none transition placeholder:text-faint focus:border-accent ${
                                ab.done ? "text-faint line-through" : "text-content"
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** 레벨·심볼·스킬 등 나머지 내실 체크리스트. 분류는 칩으로 고른다 */
export function InnerList({ char }: { char: Character }) {
    const { addInner, toggleInner, removeInner } = useMapleTodo();
    const [category, setCategory] = useState(INNER_CATEGORIES[0]);
    const [text, setText] = useState("");
    const sorted = [...char.inner].sort(
        (a, b) => Number(a.done) - Number(b.done) || INNER_CATEGORIES.indexOf(a.category) - INNER_CATEGORIES.indexOf(b.category)
    );

    return (
        <div>
            <div className="mb-1.5 flex flex-wrap gap-1">
                {INNER_CATEGORIES.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                            category === c ? "bg-accent-strong text-white" : "bg-line/[0.06] text-muted hover:text-content"
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!text.trim()) return;
                    addInner(char.id, category, text.trim());
                    setText("");
                }}
                className="flex gap-1.5"
            >
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`${category} 할 일 + Enter`}
                    className="min-w-0 flex-1 rounded-lg border border-line/15 bg-raised/80 px-3 py-1.5 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <button
                    type="submit"
                    aria-label="추가"
                    disabled={!text.trim()}
                    className="shrink-0 rounded-lg bg-accent-strong px-2.5 text-white transition hover:bg-accent disabled:bg-raised disabled:text-faint"
                >
                    <Plus size={15} />
                </button>
            </form>
            {sorted.length > 0 && (
                <ul className="mt-2">
                    {sorted.map((i) => (
                        <li key={i.id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-line/[0.05]">
                            <input
                                type="checkbox"
                                checked={i.done}
                                onChange={() => toggleInner(char.id, i.id)}
                                className="h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--c-good))]"
                            />
                            <span className="w-14 shrink-0 truncate text-[11px] text-faint">{i.category}</span>
                            <span className={`min-w-0 flex-1 text-sm ${i.done ? "text-faint line-through" : "text-content"}`}>
                                {i.text}
                            </span>
                            <span className="transition focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                <DeleteButton
                                    iconOnly
                                    label="삭제"
                                    title="이 항목을 삭제할까요?"
                                    description={`${i.category} · ${i.text}`}
                                    onConfirm={() => removeInner(char.id, i.id)}
                                />
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
