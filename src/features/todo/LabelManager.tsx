import React, { useState } from "react";
import { Dices, Pencil, Plus, X } from "lucide-react";
import { Modal } from "@/features/overtime/Modal";
import { DeleteButton } from "@/features/overtime/DeleteButton";
import { LabelPill } from "./LabelPill";
import { type Label, LABEL_PRESETS, cleanLabel, isHex, nextPreset, randomColor } from "./labels";
import { useTodoStore } from "./store";

const fieldClass =
    "w-full rounded-lg border border-line/15 bg-raised/80 px-3 py-2 text-sm text-content outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30";

/** 라벨 만들기/수정 폼 (GitHub 의 New label 폼처럼 미리보기 + 이름 + 설명 + 색) */
function LabelForm({
    initial,
    submitLabel,
    onSubmit,
    onCancel,
    taken,
}: {
    initial: Label;
    submitLabel: string;
    onSubmit: (l: Label) => void;
    onCancel: () => void;
    /** 이미 쓰는 이름 (중복 방지) */
    taken: string[];
}) {
    const [l, setL] = useState(initial);
    const [hex, setHex] = useState(initial.color);
    const name = cleanLabel(l.name);
    const dup = name !== initial.name && taken.includes(name);
    const valid = !!name && !dup && isHex(l.color);
    const setColor = (c: string) => {
        setHex(c);
        if (isHex(c)) setL((v) => ({ ...v, color: c.toLowerCase() }));
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (valid) onSubmit({ ...l, name });
            }}
            className="rounded-xl border border-line/10 bg-line/[0.03] p-3"
        >
            <div className="mb-3">
                <LabelPill name={name} color={isHex(l.color) ? l.color : undefined} size="md" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-muted">이름</span>
                    <input
                        autoFocus
                        value={l.name}
                        onChange={(e) => setL((v) => ({ ...v, name: e.target.value }))}
                        placeholder="예: 버그"
                        className={fieldClass}
                    />
                    {dup && <span className="mt-1 block text-[11px] text-danger">이미 있는 이름이에요.</span>}
                </label>
                <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-muted">설명 (선택)</span>
                    <input
                        value={l.description}
                        onChange={(e) => setL((v) => ({ ...v, description: e.target.value }))}
                        placeholder="이 라벨을 언제 쓰는지"
                        className={fieldClass}
                    />
                </label>
            </div>
            <div className="mt-3">
                <span className="mb-1 block text-[11px] font-medium text-muted">색</span>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setColor(randomColor())}
                        title="랜덤 색"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line/15 text-white transition hover:brightness-110"
                        style={{ backgroundColor: isHex(l.color) ? l.color : "#8b949e" }}
                    >
                        <Dices size={16} />
                    </button>
                    <input
                        value={hex}
                        onChange={(e) => setColor(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)}
                        maxLength={7}
                        className={`${fieldClass.replace("w-full", "w-28")} font-mono ${isHex(hex) ? "" : "!border-danger/60"}`}
                    />
                    <div className="flex flex-wrap gap-1">
                        {LABEL_PRESETS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                aria-label={c}
                                onClick={() => setColor(c)}
                                className={`h-5 w-5 rounded-md transition hover:scale-110 ${
                                    l.color === c ? "ring-2 ring-content ring-offset-1 ring-offset-surface" : ""
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-line/15 bg-line/5 px-3 py-1.5 text-sm font-semibold text-muted hover:text-content"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={!valid}
                    className="rounded-lg bg-good/90 px-3 py-1.5 text-sm font-semibold text-bg transition hover:bg-good disabled:bg-raised disabled:text-faint"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

/** GitHub 의 Labels 페이지처럼 전체 라벨 목록 + 만들기/수정/삭제 */
export function LabelManager({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { labels, tasks, createLabel, updateLabel, deleteLabel } = useTodoStore();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const names = labels.map((l) => l.name);
    const openCount = (name: string) => tasks.filter((t) => t.status !== "done" && t.tags.includes(name)).length;

    return (
        <Modal open={open} onClose={onClose} labelledBy="label-manager-title" className="max-w-2xl">
            <header className="mb-4 flex items-center justify-between gap-3">
                <h2 id="label-manager-title" className="text-base font-bold text-content">
                    라벨 <span className="font-normal text-faint">{labels.length}</span>
                </h2>
                <div className="flex items-center gap-2">
                    {!creating && (
                        <button
                            onClick={() => {
                                setCreating(true);
                                setEditing(null);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-good/90 px-3 py-1.5 text-sm font-semibold text-bg transition hover:bg-good"
                        >
                            <Plus size={15} /> 새 라벨
                        </button>
                    )}
                    <button onClick={onClose} aria-label="닫기" className="rounded-lg p-1.5 text-muted hover:bg-line/10 hover:text-content">
                        <X size={18} />
                    </button>
                </div>
            </header>

            {creating && (
                <div className="mb-4">
                    <LabelForm
                        initial={{ name: "", description: "", color: nextPreset(labels.map((l) => l.color)) }}
                        submitLabel="라벨 만들기"
                        taken={names}
                        onCancel={() => setCreating(false)}
                        onSubmit={(l) => {
                            createLabel(l);
                            setCreating(false);
                        }}
                    />
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-line/10">
                {labels.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-faint">
                        아직 라벨이 없어요. &apos;새 라벨&apos;로 만들거나, 할 일에 #라벨 을 쓰면 자동으로 생겨요.
                    </p>
                )}
                {labels.map((l) =>
                    editing === l.name ? (
                        <div key={l.name} className="border-b border-line/10 p-2 last:border-b-0">
                            <LabelForm
                                initial={l}
                                submitLabel="저장"
                                taken={names}
                                onCancel={() => setEditing(null)}
                                onSubmit={(next) => {
                                    updateLabel(l.name, next);
                                    setEditing(null);
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            key={l.name}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-line/10 px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_80px_auto]"
                        >
                            <div className="min-w-0">
                                <LabelPill name={l.name} size="md" />
                            </div>
                            <div className="hidden truncate text-sm text-muted sm:block">{l.description}</div>
                            <div className="hidden text-xs tabular-nums text-faint sm:block">
                                {openCount(l.name) ? `할 일 ${openCount(l.name)}개` : ""}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        setEditing(l.name);
                                        setCreating(false);
                                    }}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-line/10 hover:text-content"
                                >
                                    <Pencil size={12} /> 수정
                                </button>
                                <DeleteButton
                                    label="삭제"
                                    title={`"${l.name}" 라벨을 삭제할까요?`}
                                    description={
                                        openCount(l.name)
                                            ? `이 라벨이 붙은 할 일 ${tasks.filter((t) => t.tags.includes(l.name)).length}개에서도 빠져요. 할 일 자체는 그대로예요.`
                                            : "라벨 목록에서 지워져요."
                                    }
                                    onConfirm={() => deleteLabel(l.name)}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </Modal>
    );
}
