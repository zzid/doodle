"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    Dices,
    ExternalLink,
    RefreshCw,
    Search,
    Star,
    X,
} from "lucide-react";
import { GhostButton, Panel } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { GROUPS, GROUP_LABEL, LETTERS, activeOf, generate, sameExcluded, searchUrl, syllableCount } from "./gen";
import { useNickname } from "./store";

const QUANTITIES = [1, 10, 20, 50, 100, 200];

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // 클립보드 API 가 막힌 환경 대비
        const field = document.createElement("textarea");
        field.value = text;
        field.style.cssText = "position:fixed;left:-9999px;top:0;";
        document.body.appendChild(field);
        field.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } finally {
            field.remove();
        }
        return ok;
    }
}

/** 눌렀을 때 잠깐 "복사됨"으로 바뀌는 복사 버튼 */
function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(timer.current), []);
    return (
        <GhostButton
            disabled={disabled}
            onClick={async () => {
                if (await copyText(text)) {
                    setDone(true);
                    clearTimeout(timer.current);
                    timer.current = setTimeout(() => setDone(false), 1500);
                }
            }}
            className="flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {done ? <Check size={13} className="text-good" /> : <Copy size={13} />}
            {done ? "복사됨" : "전체 복사"}
        </GhostButton>
    );
}

const iconBtn =
    "flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition disabled:cursor-default";

/** 후보 / 있음 상태와 토글 */
function useMarks(word: string) {
    const { candidates, taken, addCandidate, removeCandidate, markTaken, unmarkTaken } = useNickname();
    const isCand = candidates.some((c) => c.word === word);
    const isTaken = taken.includes(word);
    return {
        isCand,
        isTaken,
        toggleCand: () => (isCand ? removeCandidate(word) : addCandidate(word)),
        toggleTaken: () => (isTaken ? unmarkTaken(word) : markTaken(word)),
    };
}

/**
 * 검색 화면 (항상 떠 있음): 넥슨 공식 랭킹 검색을 iframe 으로 띄우고, 보면서 바로 후보/있음을 정한다.
 * 데스크탑은 오른쪽에 고정, 모바일은 화면 아래 절반에 붙는다(접기 가능).
 * 후보/있음을 누르면 아직 확인 안 한 다음 닉네임으로 넘어간다(자동 넘김).
 */
function SearchPane({
    word,
    onSelect,
    onNext,
    onPrev,
    onClose,
}: {
    word: string | null;
    onSelect: (w: string) => void;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}) {
    const m = useMarks(word ?? "");
    const [autoNext, setAutoNext] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const results = useNickname((st) => st.results);

    const decide = (fn: () => void, willMark: boolean) => {
        fn();
        // 표시를 "켤" 때만 다음으로 넘어간다 (잘못 눌러 끌 때는 그대로)
        if (autoNext && willMark) onNext();
    };

    const btn = "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition";
    const navBtn = "rounded-lg p-1.5 text-faint transition hover:bg-line/10 hover:text-content disabled:opacity-30";

    return (
        <section
            className={`${word ? "flex" : "hidden lg:flex"} fixed inset-x-0 bottom-0 z-40 flex-col border-t border-line/15 bg-surface shadow-2xl shadow-black/60 ${
                collapsed ? "h-auto" : "h-[58vh]"
            } lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-5.5rem)] lg:rounded-2xl lg:border lg:border-line/10 lg:shadow-lg`}
            aria-label="닉네임 검색"
        >
            <header className="flex flex-wrap items-center gap-1.5 border-b border-line/10 px-3 py-2">
                <button onClick={onPrev} disabled={!word} aria-label="이전 닉네임" className={navBtn}>
                    <ChevronLeft size={17} />
                </button>
                <span className="min-w-[4.5rem] text-center text-xl font-bold tracking-wider text-content">
                    {word ?? "—"}
                </span>
                <button onClick={onNext} disabled={!word} aria-label="다음 닉네임" className={navBtn}>
                    <ChevronRight size={17} />
                </button>
                {word && (
                    <div className="ml-1 flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => decide(m.toggleCand, !m.isCand)}
                            className={`${btn} ${
                                m.isCand ? "bg-good/20 text-good" : "bg-line/[0.06] text-muted hover:bg-good/15 hover:text-good"
                            }`}
                        >
                            <Star size={14} fill={m.isCand ? "currentColor" : "none"} /> 후보
                        </button>
                        <button
                            type="button"
                            onClick={() => decide(m.toggleTaken, !m.isTaken)}
                            className={`${btn} ${
                                m.isTaken
                                    ? "bg-danger/20 text-danger"
                                    : "bg-line/[0.06] text-muted hover:bg-danger/15 hover:text-danger"
                            }`}
                        >
                            <X size={14} /> 있음
                        </button>
                    </div>
                )}
                <label className="ml-auto flex cursor-pointer items-center gap-1 text-[11px] text-muted" title="후보/있음을 누르면 다음 닉네임으로">
                    <input
                        type="checkbox"
                        checked={autoNext}
                        onChange={(e) => setAutoNext(e.target.checked)}
                        className="accent-[rgb(var(--c-accent-strong))]"
                    />
                    자동 넘김
                </label>
                {word && (
                    <a
                        href={searchUrl(word)}
                        target="_blank"
                        rel="noreferrer"
                        title="새 탭으로 열기"
                        className={navBtn}
                    >
                        <ExternalLink size={15} />
                    </a>
                )}
                {/* 모바일 전용: 접기 / 닫기 */}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    aria-label={collapsed ? "펼치기" : "접기"}
                    className={`${navBtn} lg:hidden`}
                >
                    <ChevronDown size={17} className={collapsed ? "rotate-180" : ""} />
                </button>
                <button onClick={onClose} aria-label="검색 닫기" className={`${navBtn} lg:hidden`}>
                    <X size={17} />
                </button>
            </header>
            {!collapsed &&
                (word ? (
                    <iframe
                        key={word}
                        src={searchUrl(word)}
                        title={`${word} 랭킹 검색`}
                        className="min-h-0 w-full flex-1 bg-white lg:rounded-b-2xl"
                    />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-faint">
                        카드의 🔍 검색을 누르면 여기에 넥슨 공식 랭킹 검색이 떠요.
                        {results.length > 0 && (
                            <button
                                onClick={() => onSelect(results[0])}
                                className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
                            >
                                첫 닉네임부터 확인하기
                            </button>
                        )}
                    </div>
                ))}
            {!collapsed && word && (
                <p className="border-t border-line/10 px-3 py-1.5 text-[10px] text-faint">
                    결과 표는 검색 화면을 조금 내리면 보여요. 랭킹에 없어도 저레벨·장기 미접속 캐릭터일 수 있어요.
                </p>
            )}
        </section>
    );
}

/** 뽑힌 단어 하나: 검색 · 후보 · 있음 */
function WordCard({ word, current, onSearch }: { word: string; current: boolean; onSearch: (w: string) => void }) {
    const { isCand, isTaken, toggleCand, toggleTaken } = useMarks(word);

    return (
        <div
            className={`rounded-xl border p-2 transition ${current ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""} ${
                isCand
                    ? "border-good/50 bg-good/10"
                    : isTaken
                      ? "border-line/10 bg-line/[0.02] opacity-50"
                      : "border-line/10 bg-line/[0.03]"
            }`}
        >
            <div
                className={`py-1.5 text-center text-2xl font-bold tracking-wider ${
                    isTaken ? "text-faint line-through" : "text-content"
                }`}
            >
                {word}
            </div>
            <div className="mt-1 flex gap-1">
                <button
                    type="button"
                    onClick={() => onSearch(word)}
                    title="페이지 안에서 랭킹 검색"
                    className={`${iconBtn} bg-line/[0.06] text-muted hover:text-content`}
                >
                    <Search size={12} /> 검색
                </button>
                <button
                    type="button"
                    onClick={toggleCand}
                    title={isCand ? "후보에서 빼기" : "없는 닉네임 → 후보에 추가"}
                    className={`${iconBtn} ${
                        isCand ? "bg-good/20 text-good" : "bg-line/[0.06] text-muted hover:bg-good/15 hover:text-good"
                    }`}
                >
                    <Star size={12} fill={isCand ? "currentColor" : "none"} /> 후보
                </button>
                <button
                    type="button"
                    onClick={toggleTaken}
                    title={isTaken ? "있음 표시 취소" : "이미 있는 닉네임 → 다음부터 안 뽑기"}
                    className={`${iconBtn} ${
                        isTaken ? "bg-danger/20 text-danger" : "bg-line/[0.06] text-muted hover:bg-danger/15 hover:text-danger"
                    }`}
                >
                    <X size={12} /> 있음
                </button>
            </div>
        </div>
    );
}

export default function NicknamePage() {
    const s = useNickname();
    const active = activeOf(s.excluded);
    const total = syllableCount(active) ** 2;
    const [warn, setWarn] = useState("");

    const [searching, setSearching] = useState<string | null>(null);
    const isMarked = (w: string) => s.taken.includes(w) || s.candidates.some((c) => c.word === w);
    // 다음: 지금 것 뒤에서 아직 후보/있음 표시가 없는 닉네임 (없으면 그대로)
    const goNext = () => {
        const list = s.results;
        const from = searching ? list.indexOf(searching) : -1;
        for (let k = 1; k <= list.length; k++) {
            const w = list[(from + k) % list.length];
            // 방금 누른 표시는 아직 상태에 반영되기 전일 수 있어 지금 것은 건너뛴다
            if (w !== searching && !isMarked(w)) return setSearching(w);
        }
    };
    const goPrev = () => {
        const list = s.results;
        if (!list.length) return;
        const i = searching ? list.indexOf(searching) : 0;
        setSearching(list[(i - 1 + list.length) % list.length]);
    };
    // 제외 설정을 바꿨는데 아직 그 설정으로 다시 뽑지 않았다
    const dirty = !sameExcluded(s.excluded, s.rolledWith);

    const roll = () => {
        const skip = new Set([...s.taken, ...s.candidates.map((c) => c.word)]);
        s.setResults(generate(s.quantity, s.excluded, skip), s.excluded);
    };

    // 처음 들어왔는데 결과가 없으면 한 번 뽑아 둔다
    useEffect(() => {
        if (!s.results.length) roll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = (group: (typeof GROUPS)[number], i: number) => {
        // 각 그룹에서 최소 하나는 남아야 한다
        const left = LETTERS[group].length - s.excluded[group].length;
        if (!s.excluded[group].includes(i) && left <= 1) {
            setWarn(`${GROUP_LABEL[group]}은 최소 하나는 남겨야 해요.`);
            return;
        }
        setWarn("");
        s.toggleExcluded(group, i);
    };

    return (
        <div className={`mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-6 sm:py-8 ${searching ? "pb-[62vh] lg:pb-8" : ""}`}>
            <header className="mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">닉네임 뽑기</h1>
                <p className="mt-1 text-sm text-muted">
                    무작위 한글 두 글자를 뽑아 검색해 보고, 없는 닉네임은 후보로 모아 두세요.
                </p>
            </header>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="min-w-0 space-y-4">
                    {/* 뽑기 */}
                    <Panel className="p-3 sm:p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                                {QUANTITIES.map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => s.setQuantity(n)}
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition ${
                                            s.quantity === n ? "bg-accent-strong text-white" : "text-muted hover:text-content"
                                        }`}
                                    >
                                        {n}개
                                    </button>
                                ))}
                            </div>
                            <div className="ml-auto flex gap-2">
                                <CopyButton text={s.results.join("\n")} disabled={!s.results.length} />
                                <button
                                    onClick={roll}
                                    className="flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent active:scale-95"
                                >
                                    <Dices size={15} /> 뽑기
                                </button>
                            </div>
                        </div>

                        {dirty && (
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
                                제외할 글자를 바꿨어요. 지금 결과는 이전 설정으로 뽑은 거예요.
                                <button
                                    onClick={roll}
                                    className="flex items-center gap-1 rounded-md bg-warn/20 px-2 py-1 font-semibold transition hover:bg-warn/30"
                                >
                                    <RefreshCw size={12} /> 적용하고 다시 뽑기
                                </button>
                            </div>
                        )}
                        {s.results.length ? (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
                                {s.results.map((w) => (
                                    <WordCard key={w} word={w} current={w === searching} onSearch={setSearching} />
                                ))}
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-faint">뽑기를 눌러 보세요.</p>
                        )}
                        <p className="mt-3 text-[11px] text-faint">
                            🔍 검색 → 검색 화면에서 없으면 ⭐ 후보, 있으면 ✕ 있음 (자동으로 다음 닉네임으로 넘어가요). 후보와 &apos;있음&apos;은 다음 뽑기에 다시 나오지 않아요.
                        </p>
                    </Panel>

                    {/* 후보 리스트 */}
                    <Panel className="p-3 sm:p-4">
                        <header className="mb-3 flex items-center justify-between gap-2">
                            <h2 className="flex items-center gap-1.5 text-base font-bold text-content">
                                <Star size={16} className="text-good" fill="currentColor" /> 후보
                                <span className="text-sm font-normal tabular-nums text-faint">{s.candidates.length}</span>
                            </h2>
                            <CopyButton text={s.candidates.map((c) => c.word).join("\n")} disabled={!s.candidates.length} />
                        </header>
                        {s.candidates.length === 0 ? (
                            <p className="py-6 text-center text-xs text-faint">없는 닉네임에 ⭐ 후보를 누르면 여기 모여요.</p>
                        ) : (
                            <ul className="space-y-1">
                                {s.candidates.map((c) => (
                                    <li
                                        key={c.word}
                                        className="group flex items-center gap-2 rounded-lg border border-line/10 bg-line/[0.03] px-3 py-2"
                                    >
                                        <span className="flex-1 text-lg font-bold tracking-wider text-content">{c.word}</span>
                                        <span className="text-[10px] tabular-nums text-faint">
                                            {new Date(c.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                                        </span>
                                        <button
                                            onClick={() => setSearching(c.word)}
                                            aria-label={`${c.word} 검색`}
                                            title="랭킹 검색"
                                            className="rounded-md p-1 text-faint transition hover:bg-line/10 hover:text-content"
                                        >
                                            <Search size={13} />
                                        </button>
                                        <DeleteButton
                                            iconOnly
                                            label="후보에서 삭제"
                                            title={`"${c.word}"을 후보에서 뺄까요?`}
                                            description="후보 리스트에서 지워져요. 다음 뽑기에 다시 나올 수 있어요."
                                            onConfirm={() => s.removeCandidate(c.word)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        {s.taken.length > 0 && (
                            <div className="mt-3 flex items-center justify-between border-t border-line/10 pt-3 text-xs text-faint">
                                <span>이미 있는 닉네임 {s.taken.length}개 제외 중</span>
                                <DeleteButton
                                    label="초기화"
                                    title="'있음' 표시를 모두 지울까요?"
                                    description={`이미 있다고 표시한 ${s.taken.length}개가 다시 뽑힐 수 있어요.`}
                                    onConfirm={s.clearTaken}
                                />
                            </div>
                        )}
                        <p className="mt-3 text-[11px] text-faint">이 브라우저에 자동 저장돼요.</p>
                    </Panel>

                    {/* 제외할 글자 */}
                    <Panel className="p-3 sm:p-4">
                        <details>
                            <summary className="flex cursor-pointer select-none list-none items-center gap-2 text-sm font-bold text-content [&::-webkit-details-marker]:hidden">
                                <ChevronDown size={16} className="text-faint" />
                                제외할 글자
                                <span className="text-xs font-normal tabular-nums text-faint">
                                    {total.toLocaleString("ko-KR")}가지 조합
                                </span>
                            </summary>
                            <div className="mt-3 space-y-3">
                                <p className="text-xs text-muted">
                                    누른 글자는 빠져요(빨간색). 다 고른 뒤 &apos;적용하고 다시 뽑기&apos;를 누르세요. 받침의 &apos;없음&apos;을 빼면 받침 있는 글자만 나와요.
                                </p>
                                {GROUPS.map((g) => (
                                    <div key={g}>
                                        <div className="mb-1.5 text-[11px] font-medium text-muted">{GROUP_LABEL[g]}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {LETTERS[g].map((ch, i) => {
                                                const off = s.excluded[g].includes(i);
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => toggle(g, i)}
                                                        aria-pressed={off}
                                                        aria-label={`${ch} ${off ? "포함하기" : "제외하기"}`}
                                                        className={`min-w-[2.25rem] rounded-md border px-2 py-1 text-sm transition ${
                                                            off
                                                                ? "border-danger/50 bg-danger/15 text-danger line-through"
                                                                : "border-line/10 bg-line/[0.04] text-content hover:border-line/30"
                                                        }`}
                                                    >
                                                        {ch}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {warn && <p className="text-xs text-danger">{warn}</p>}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={roll}
                                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                            dirty
                                                ? "bg-accent-strong text-white hover:bg-accent"
                                                : "border border-line/15 bg-line/5 text-muted hover:text-content"
                                        }`}
                                    >
                                        <RefreshCw size={14} /> 적용하고 다시 뽑기
                                    </button>
                                    <GhostButton onClick={s.resetExcluded}>기본값으로 (ㅑ ㅒ ㅕ ㅖ 제외)</GhostButton>
                                </div>
                            </div>
                        </details>
                    </Panel>
                </div>

                <SearchPane
                    word={searching}
                    onSelect={setSearching}
                    onNext={goNext}
                    onPrev={goPrev}
                    onClose={() => setSearching(null)}
                />
            </div>
        </div>
    );
}
