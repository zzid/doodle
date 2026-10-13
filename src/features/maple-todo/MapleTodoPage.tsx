"use client";

import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Panel } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { GearWindow } from "./GearWindow";
import { AbilityCard, InnerList } from "./InnerPanel";
import { type Character, charStats, useMapleTodo } from "./store";

/** 캐릭터 한 명 = 카드 한 장 (장비창 + 어빌리티 + 기타 내실) */
function CharacterCard({ char }: { char: Character }) {
    const { renameCharacter, removeCharacter, toggleCollapsed } = useMapleTodo();
    const { total, open } = charStats(char);

    return (
        <Panel className="p-4 sm:p-5">
            <header className="flex items-center gap-2">
                <button
                    onClick={() => toggleCollapsed(char.id)}
                    aria-label={char.collapsed ? "펼치기" : "접기"}
                    aria-expanded={!char.collapsed}
                    className="rounded-md p-1 text-faint transition hover:bg-line/10 hover:text-content"
                >
                    <ChevronDown size={18} className={`transition ${char.collapsed ? "-rotate-90" : ""}`} />
                </button>
                <input
                    value={char.name}
                    onChange={(e) => renameCharacter(char.id, e.target.value)}
                    aria-label="캐릭터 이름"
                    className="min-w-0 rounded-md bg-transparent px-1 text-lg font-bold text-content outline-none transition hover:bg-line/[0.05] focus:bg-line/[0.05]"
                    style={{ width: `${Math.max(4, char.name.length * 1.6 + 1)}ch` }}
                />
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                        !total ? "bg-line/10 text-faint" : open ? "bg-accent/15 text-accent" : "bg-good/15 text-good"
                    }`}
                >
                    {!total ? "목표 없음" : open ? `남은 ${open}/${total}` : "모두 완료"}
                </span>
                <span className="ml-auto">
                    <DeleteButton
                        iconOnly
                        label="캐릭터 삭제"
                        title={`${char.name || "이 캐릭터"}를 삭제할까요?`}
                        description="장비 목표, 어빌리티, 내실 할 일이 모두 지워져요."
                        onConfirm={() => removeCharacter(char.id)}
                    />
                </span>
            </header>

            {!char.collapsed && (
                <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                    <GearWindow char={char} />
                    <div className="min-w-0 space-y-4">
                        <div>
                            <h3 className="mb-2 text-sm font-bold text-content">내실</h3>
                            <AbilityCard char={char} />
                        </div>
                        <InnerList char={char} />
                    </div>
                </div>
            )}
        </Panel>
    );
}

function AddCharacterCard() {
    const addCharacter = useMapleTodo((s) => s.addCharacter);
    const [name, setName] = useState("");
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                addCharacter(name.trim());
                setName("");
            }}
            className="flex items-center gap-2 rounded-2xl border border-dashed border-line/20 p-3 transition focus-within:border-accent/60"
        >
            <Plus size={18} className="shrink-0 text-faint" />
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="캐릭터 추가 — 이름 입력 후 Enter"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-content outline-none placeholder:text-faint"
            />
        </form>
    );
}

export default function MapleTodoPage() {
    const characters = useMapleTodo((s) => s.characters);

    return (
        <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">메TODO</h1>
                <p className="mt-1 text-sm text-muted">캐릭터별 장비(별·추옵·잠재·아랫잠재·주문서작)와 내실 목표</p>
            </header>

            <div className="space-y-4">
                {characters.map((c) => (
                    <CharacterCard key={c.id} char={c} />
                ))}
                <AddCharacterCard />
            </div>

            <p className="mt-4 text-[11px] text-faint">이 브라우저에 자동 저장돼요.</p>
        </div>
    );
}
