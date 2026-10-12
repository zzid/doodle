import React, { useState } from "react";
import { X } from "lucide-react";
import { DeleteButton } from "@/features/overtime/DeleteButton";
import {
    type Character,
    GRADES,
    GRADE_COLOR,
    type Grade,
    SLOT_GRID,
    TRACKS,
    TRACK_LABEL,
    TRACK_PLACEHOLDER,
    type Track,
    slotProgress,
    useMapleTodo,
} from "./store";

/** 진행 점 색: 목표 없음 / 진행 중 / 완료 */
const dotClass = (goal?: string, done?: boolean) =>
    !goal ? "bg-line/15" : done ? "bg-good" : "bg-warn";

function GradeChips({ value, onChange }: { value?: Grade; onChange: (g?: Grade) => void }) {
    return (
        <div className="flex gap-1">
            {GRADES.map((g) => (
                <button
                    key={g}
                    type="button"
                    title={g}
                    aria-label={`${g} 등급`}
                    aria-pressed={value === g}
                    onClick={() => onChange(value === g ? undefined : g)}
                    className={`h-4 w-4 rounded-full border-2 transition ${
                        value === g ? "scale-110 border-content" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: GRADE_COLOR[g] }}
                />
            ))}
        </div>
    );
}

/** 선택한 슬롯의 5중 나생문 편집 */
function SlotEditor({ char, slot, onClose }: { char: Character; slot: string; onClose: () => void }) {
    const { updateSlot, setTrack, clearSlot } = useMapleTodo();
    const data = char.gear[slot];

    return (
        <div className="mt-3 rounded-xl border border-line/10 bg-line/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2">
                <span className="shrink-0 text-sm font-bold text-content">{slot}</span>
                <input
                    value={data?.item ?? ""}
                    onChange={(e) => updateSlot(char.id, slot, { item: e.target.value })}
                    placeholder="아이템 이름 (선택)"
                    className="min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-1 text-sm text-muted outline-none transition placeholder:text-faint hover:bg-line/[0.05] focus:bg-line/[0.05] focus:text-content"
                />
                {data && (
                    <DeleteButton
                        iconOnly
                        label="슬롯 비우기"
                        title={`${slot} 목표를 모두 지울까요?`}
                        description="아이템 이름과 5가지 목표가 지워져요."
                        onConfirm={() => clearSlot(char.id, slot)}
                    />
                )}
                <button onClick={onClose} aria-label="닫기" className="rounded-md p-1 text-faint hover:text-content">
                    <X size={14} />
                </button>
            </div>
            <ul className="space-y-1">
                {TRACKS.map((t: Track) => {
                    const tr = data?.tracks[t];
                    const gradeKey = t === "pot" ? "potGrade" : t === "add" ? "addGrade" : null;
                    return (
                        <li key={t} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={!!tr?.done}
                                disabled={!tr?.goal}
                                onChange={() => setTrack(char.id, slot, t, { done: !tr?.done })}
                                aria-label={`${TRACK_LABEL[t]} 완료`}
                                className="h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--c-good))] disabled:cursor-default disabled:opacity-30"
                            />
                            <span className="flex w-16 shrink-0 items-center gap-1.5 text-xs text-muted">
                                <i className={`h-1.5 w-1.5 rounded-full ${dotClass(tr?.goal, tr?.done)}`} />
                                {TRACK_LABEL[t]}
                            </span>
                            <input
                                value={tr?.goal ?? ""}
                                onChange={(e) => setTrack(char.id, slot, t, { goal: e.target.value })}
                                placeholder={TRACK_PLACEHOLDER[t]}
                                className={`min-w-0 flex-1 rounded-md border border-line/10 bg-raised/60 px-2 py-1 text-sm outline-none transition placeholder:text-faint focus:border-accent ${
                                    tr?.done ? "text-faint line-through" : "text-content"
                                }`}
                            />
                            {gradeKey && (
                                <GradeChips
                                    value={data?.[gradeKey]}
                                    onChange={(g) => updateSlot(char.id, slot, { [gradeKey]: g })}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** 게임 장비창처럼 생긴 슬롯 격자 */
export function GearWindow({ char }: { char: Character }) {
    const [selected, setSelected] = useState<string | null>(null);

    let total = 0;
    let done = 0;
    for (const s of Object.values(char.gear)) {
        const p = slotProgress(s);
        total += p.total;
        done += p.done;
    }

    return (
        <div>
            <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-bold text-content">장비</h3>
                <span className="text-xs tabular-nums text-faint">
                    {done}/{total}
                </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 rounded-xl border border-line/10 bg-black/20 p-2">
                {SLOT_GRID.flat().map((slot, i) => {
                    if (!slot) return <div key={i} />;
                    const data = char.gear[slot];
                    const grade = data?.potGrade;
                    const isSel = selected === slot;
                    return (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => setSelected(isSel ? null : slot)}
                            title={data?.item || slot}
                            className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 bg-raised/70 px-0.5 text-center transition hover:bg-raised ${
                                isSel ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""
                            }`}
                            style={{ borderColor: grade ? GRADE_COLOR[grade] : "rgb(var(--c-line) / 0.08)" }}
                        >
                            <span
                                className={`line-clamp-2 break-keep text-[10px] leading-tight ${
                                    data?.item ? "font-semibold text-content" : "text-faint"
                                }`}
                            >
                                {data?.item || slot}
                            </span>
                            <span className="absolute bottom-1 flex gap-[3px]">
                                {TRACKS.map((t) => (
                                    <i
                                        key={t}
                                        className={`h-1 w-1 rounded-full ${dotClass(data?.tracks[t]?.goal, data?.tracks[t]?.done)}`}
                                    />
                                ))}
                            </span>
                        </button>
                    );
                })}
            </div>
            <p
                className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[10px] text-faint"
                title="슬롯 테두리 색 = 잠재 목표 등급"
            >
                <span>점: 별·추옵·잠재·아랫·작</span>
                <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-warn" /> 진행
                </span>
                <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-good" /> 완료
                </span>
                <span>· 슬롯을 눌러 편집</span>
            </p>
            {selected && <SlotEditor char={char} slot={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
