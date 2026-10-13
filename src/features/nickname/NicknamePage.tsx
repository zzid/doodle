"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    Copy,
    Dices,
    Loader2,
    ExternalLink,
    RefreshCw,
    Search,
    Star,
} from "lucide-react";
import { GhostButton, Panel } from "@/features/symbol/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import {
    GROUPS,
    GROUP_LABEL,
    LETTERS,
    activeOf,
    finalModeOf,
    finalsForMode,
    generate,
    sameExcluded,
    searchUrl,
    syllableCount,
    type FinalMode,
} from "./gen";
import { useNickname } from "./store";
import { nicknameExists } from "./api";

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

const FINAL_MODES: [FinalMode, string][] = [
    ["any", "상관없음"],
    ["none", "받침 없는 글자만"],
    ["has", "받침 있는 글자만"],
];


/** 닉네임 하나를 넥슨 Open API 로 확인해, 없으면 후보에 담고 있으면 '있음'으로 제외한다 */
function useCheck() {
    const { addCandidate, markTaken } = useNickname();
    const [checking, setChecking] = useState<string | null>(null);
    const [error, setError] = useState<{ word: string; message: string } | null>(null);

    const check = async (word: string): Promise<boolean | null> => {
        if (checking) return null;
        setChecking(word);
        setError(null);
        try {
            const exists = await nicknameExists(word);
            if (exists) markTaken(word);
            else addCandidate(word);
            return exists;
        } catch (e) {
            setError({ word, message: e instanceof Error ? e.message : "확인하지 못했어요." });
            return null;
        } finally {
            setChecking(null);
        }
    };
    return { check, checking, error };
}

type Check = ReturnType<typeof useCheck>;

/** 떠오른 닉네임을 직접 입력해서 확인 */
function ManualCheck({ c }: { c: Check }) {
    const [result, setResult] = useState<{ word: string; exists: boolean } | null>(null);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        // 한글 조합 중 Enter 에도 마지막 글자까지 들어가도록 상태 대신 입력칸 값을 읽는다
        const word = String(new FormData(form).get("name") ?? "").trim();
        if (!word) return;
        setResult(null);
        const exists = await c.check(word);
        if (exists !== null) {
            setResult({ word, exists });
            form.reset();
        }
    };
    const busy = c.checking !== null;
    const error = c.error && !result ? c.error : null;

    return (
        <Panel className="p-3 sm:p-4">
            <form onSubmit={submit} className="flex gap-2">
                <input
                    name="name"
                    maxLength={12}
                    autoComplete="off"
                    placeholder="떠오른 닉네임 직접 확인"
                    className="min-w-0 flex-1 rounded-lg border border-line/15 bg-line/[0.04] px-3 py-2 text-base font-semibold tracking-wider text-content outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-faint focus:border-accent"
                />
                <button
                    type="submit"
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent disabled:opacity-60"
                >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} 확인
                </button>
            </form>
            {result && (
                <p className={`mt-2 text-sm ${result.exists ? "text-danger" : "text-good"}`}>
                    <b className="tracking-wider">{result.word}</b>{" "}
                    {result.exists ? "— 이미 있는 닉네임이에요." : "— 없어요! ⭐ 후보에 담았어요."}
                </p>
            )}
            {error && <p className="mt-2 text-xs text-danger">{error.message}</p>}
        </Panel>
    );
}

/** 뽑힌 단어 하나: 누르면 바로 확인 (없으면 후보, 있으면 제외) */
function WordCard({ word, c }: { word: string; c: Check }) {
    const isCand = useNickname((st) => st.candidates.some((x) => x.word === word));
    const isTaken = useNickname((st) => st.taken.includes(word));
    const checking = c.checking === word;
    const error = c.error?.word === word ? c.error.message : "";

    return (
        <button
            type="button"
            onClick={() => c.check(word)}
            disabled={c.checking !== null}
            title="눌러서 있는 닉네임인지 확인"
            className={`relative rounded-xl border px-2 py-3 text-center transition disabled:cursor-wait ${
                isCand
                    ? "border-good/50 bg-good/10"
                    : isTaken
                      ? "border-line/10 bg-line/[0.02] opacity-50"
                      : "border-line/10 bg-line/[0.03] hover:border-line/30 hover:bg-line/[0.07]"
            }`}
        >
            <span
                className={`text-2xl font-bold tracking-wider ${isTaken ? "text-faint line-through" : "text-content"} ${
                    checking ? "opacity-30" : ""
                }`}
            >
                {word}
            </span>
            {checking && <Loader2 size={18} className="absolute inset-0 m-auto animate-spin text-muted" />}
            {isCand && <Star size={12} fill="currentColor" className="absolute right-2 top-2 text-good" />}
            {error && <span className="mt-0.5 block text-[10px] text-danger">{error}</span>}
        </button>
    );
}

export default function NicknamePage() {
    const s = useNickname();
    const active = activeOf(s.excluded);
    const total = syllableCount(active) ** 2;
    const [warn, setWarn] = useState("");

    const c = useCheck();
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
    const finalMode = finalModeOf(s.excluded.finals);
    const setFinalMode = (mode: FinalMode) => {
        setWarn("");
        s.setExcluded("finals", finalsForMode(mode, s.excluded.finals));
    };

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            <header className="mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-content sm:text-2xl">닉네임 뽑기</h1>
                <p className="mt-1 text-sm text-muted">
                    무작위 한글 두 글자를 뽑아 눌러 보세요. 없는 닉네임은 후보로 모여요.
                </p>
            </header>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-4">
                    <ManualCheck c={c} />

                    {/* 뽑기 */}
                    <Panel className="p-3 sm:p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <div className="flex gap-1 rounded-lg border border-line/10 bg-line/[0.03] p-1">
                                {QUANTITIES.map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => s.setQuantity(n)}
                                        className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition ${
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
                                    <WordCard key={w} word={w} c={c} />
                                ))}
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-faint">뽑기를 눌러 보세요.</p>
                        )}
                        <p className="mt-3 text-[11px] text-faint">
                            닉네임을 누르면 바로 확인해요: 없으면 ⭐ 후보, 있으면 흐리게 빠져요. 둘 다 다음 뽑기에 다시 나오지 않아요.
                        </p>
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
                                    누른 글자는 빠져요(빨간색). 다 고른 뒤 &apos;적용하고 다시 뽑기&apos;를 누르세요. 받침은 위에서 &apos;받침 없는 글자만&apos;·&apos;받침 있는 글자만&apos;을 고를 수 있어요.
                                </p>
                                {GROUPS.map((g) => (
                                    <div key={g}>
                                        <div className="mb-1.5 text-[11px] font-medium text-muted">{GROUP_LABEL[g]}</div>
                                        {g === "finals" && (
                                            <div className="mb-2 inline-flex rounded-lg bg-line/[0.06] p-0.5">
                                                {FINAL_MODES.map(([mode, label]) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setFinalMode(mode)}
                                                        aria-pressed={finalMode === mode}
                                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                                            finalMode === mode
                                                                ? "bg-accent-strong text-white"
                                                                : "text-muted hover:text-content"
                                                        }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div
                                            className={`flex flex-wrap gap-1 ${
                                                g === "finals" && finalMode === "none" ? "pointer-events-none opacity-35" : ""
                                            }`}
                                        >
                                            {LETTERS[g].map((ch, i) => {
                                                // 받침 "없음"은 위의 모드 버튼으로 고른다
                                                if (g === "finals" && i === 0) return null;
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

                <div className="min-w-0 space-y-4">
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
                            <p className="py-6 text-center text-xs text-faint">확인해서 없는 닉네임이 여기 모여요.</p>
                        ) : (
                            <ul className="space-y-1">
                                {s.candidates.map((cand) => (
                                    <li
                                        key={cand.word}
                                        className="group flex items-center gap-2 rounded-lg border border-line/10 bg-line/[0.03] px-3 py-2"
                                    >
                                        <span className="flex-1 text-lg font-bold tracking-wider text-content">{cand.word}</span>
                                        <span className="text-[10px] tabular-nums text-faint">
                                            {new Date(cand.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                                        </span>
                                        <a
                                            href={searchUrl(cand.word)}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`${cand.word} 랭킹에서 보기`}
                                            title="랭킹에서 한 번 더 보기 (새 탭)"
                                            className="rounded-md p-1 text-faint transition hover:bg-line/10 hover:text-content"
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                        <DeleteButton
                                            iconOnly
                                            label="후보에서 삭제"
                                            title={`"${cand.word}"을 후보에서 뺄까요?`}
                                            description="후보 리스트에서 지워져요. 다음 뽑기에 다시 나올 수 있어요."
                                            onConfirm={() => s.removeCandidate(cand.word)}
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
                        <p className="mt-3 text-[11px] text-faint">
                            이 브라우저에 자동 저장돼요. 넥슨 API는 오래 접속 안 한 캐릭터를 못 찾을 수 있어서, 정할 닉네임은 ↗ 랭킹에서 한 번 더 확인해 보세요.
                        </p>
                    </Panel>

                </div>
            </div>
        </div>
    );
}
