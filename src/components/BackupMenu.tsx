import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, FileUp, Link2, Share2, Upload } from "lucide-react";
import { GhostButton, PrimaryButton } from "@/features/symbol/components/ui";
import { Modal } from "./Modal";
import { IMPORT_HASH_KEY, backupFileName, buildImportLink, decodeCode, encodeCode } from "@/utils/backupCodec";

/**
 * 공통 내보내기 / 가져오기 (링크·코드·JSON 파일).
 * 페이지마다 다른 건 BackupAdapter 로만 넘기고, 화면·인코딩·링크 자동 가져오기는 여기서 한 번만 구현한다.
 */
export interface BackupAdapter<T> {
    /** 화면 문구용 이름. 예: "초과근로 기록" */
    title: string;
    /** 파일 이름 앞부분. 예: "overtime-backup" */
    filePrefix: string;
    /** 지금 데이터를 내보낼 JSON 객체로 */
    build: (opts: { sensitive: boolean }) => unknown;
    /** 가져온 원본 JSON 검증·정리. 이 페이지 백업이 아니면 Error 를 던진다 */
    parse: (raw: unknown) => T;
    /** 미리보기 문구 */
    describe: (data: T) => { count: number; detail?: string; exportedAt?: string };
    /** 지금 이 브라우저의 기록 수 */
    currentCount: number;
    /** "합치기" 설명. 예: "같은 날짜만 가져온 값으로 바꿔요" */
    mergeHint: string;
    apply: (data: T, mode: "merge" | "replace", opts: { sensitive: boolean }) => void;
    /** 금액처럼 민감한 설정을 포함할지 고르게 할 때 */
    sensitive?: {
        exportLabel: string;
        importLabel: string;
        warning: string;
        has: (data: T) => boolean;
    };
}

/** 클릭하면 잠깐 "복사됨"으로 바뀌는 액션 버튼 */
function ActionButton({
    icon,
    label,
    doneLabel,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    doneLabel?: string;
    onClick: () => Promise<boolean | void> | void;
}) {
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(timer.current), []);
    return (
        <button
            onClick={async () => {
                const ok = await onClick();
                if (ok === false || !doneLabel) return;
                setDone(true);
                clearTimeout(timer.current);
                timer.current = setTimeout(() => setDone(false), 1800);
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-line/15 bg-line/5 px-3 py-2.5 text-sm font-semibold text-content transition hover:border-accent/50 hover:bg-accent/10"
        >
            {done ? <Check size={15} className="text-good" /> : icon}
            {done ? doneLabel : label}
        </button>
    );
}

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

const checkbox = "h-4 w-4 accent-[rgb(var(--c-accent-strong))]";

function ExportModal<T>({ adapter, open, onClose }: { adapter: BackupAdapter<T>; open: boolean; onClose: () => void }) {
    const [sensitive, setSensitive] = useState(true);
    const [code, setCode] = useState("");
    const data = adapter.build({ sensitive });
    const json = JSON.stringify(data, null, 2);

    useEffect(() => {
        if (!open) return;
        let alive = true;
        encodeCode(data).then((c) => alive && setCode(c));
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, json]);

    const link = code ? buildImportLink(code) : "";
    const canShare = typeof navigator !== "undefined" && !!navigator.share;

    const saveFile = async () => {
        const file = new File([json], backupFileName(adapter.filePrefix), { type: "application/json" });
        // 모바일: 공유 시트로 파일을 넘기면 파일 앱/카톡/드라이브 등에 바로 저장 가능
        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: `${adapter.title} 백업` });
                return;
            } catch (e) {
                if ((e as Error).name === "AbortError") return false;
            }
        }
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    return (
        <Modal open={open} onClose={onClose} labelledBy="export-title" className="max-w-md">
            <h2 id="export-title" className="text-base font-bold text-content">
                {adapter.title} 내보내기
            </h2>
            <p className="mt-1 text-sm text-muted">
                기록 {adapter.currentCount}건을 다른 기기나 브라우저로 옮길 수 있어요. 서버에는 아무것도 저장되지 않아요.
            </p>

            {adapter.sensitive && (
                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted">
                    <input
                        type="checkbox"
                        checked={sensitive}
                        onChange={(e) => setSensitive(e.target.checked)}
                        className={checkbox}
                    />
                    {adapter.sensitive.exportLabel}
                </label>
            )}

            <section className="mt-4">
                <h3 className="mb-1 text-xs font-bold text-content">🔗 링크로 옮기기 (추천 · 모바일 OK)</h3>
                <p className="mb-2 text-xs text-faint">
                    다른 기기에서 링크를 열면 바로 가져오기 화면이 떠요. 카톡 나에게 보내기, 메모 앱 등으로 보내세요.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <ActionButton icon={<Link2 size={15} />} label="링크 복사" doneLabel="복사됨" onClick={() => copyText(link)} />
                    {canShare ? (
                        <ActionButton
                            icon={<Share2 size={15} />}
                            label="공유하기"
                            onClick={async () => {
                                try {
                                    await navigator.share({ title: adapter.title, url: link });
                                } catch {}
                            }}
                        />
                    ) : (
                        <ActionButton
                            icon={<Copy size={15} />}
                            label="코드만 복사"
                            doneLabel="복사됨"
                            onClick={() => copyText(code)}
                        />
                    )}
                </div>
                <p className="mt-1.5 text-[11px] tabular-nums text-faint">
                    링크 길이 {link.length.toLocaleString()}자
                    {link.length > 6000 && " · 길어서 일부 메신저에서 잘릴 수 있어요. 그럴 땐 파일로 옮기세요."}
                </p>
            </section>

            <section className="mt-4">
                <h3 className="mb-1 text-xs font-bold text-content">💾 파일로 옮기기</h3>
                <p className="mb-2 text-xs text-faint">
                    JSON 파일로 저장해요. 모바일에서는 공유 시트가 떠서 파일 앱·드라이브 등에 저장할 수 있어요.
                </p>
                <ActionButton icon={<Download size={15} />} label="파일 저장 (.json)" onClick={saveFile} />
            </section>

            {adapter.sensitive && sensitive && (
                <p className="mt-4 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">{adapter.sensitive.warning}</p>
            )}
            <div className="mt-5 flex justify-end">
                <GhostButton onClick={onClose}>닫기</GhostButton>
            </div>
        </Modal>
    );
}

function ImportModal<T>({
    adapter,
    open,
    onClose,
    initial,
}: {
    adapter: BackupAdapter<T>;
    open: boolean;
    onClose: () => void;
    /** 링크로 들어왔을 때 미리 해석된 데이터 */
    initial?: T | null;
}) {
    const [text, setText] = useState("");
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<"merge" | "replace">("merge");
    const [sensitive, setSensitive] = useState(true);
    const [done, setDone] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const current = adapter.currentCount;

    const accept = (d: T) => {
        setData(d);
        setError("");
        setSensitive(adapter.sensitive ? adapter.sensitive.has(d) : false);
    };

    useEffect(() => {
        if (!open) return;
        setText("");
        setError("");
        setDone(false);
        setMode("merge");
        setData(null);
        if (initial) accept(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initial]);

    const tryParse = (raw: unknown) => {
        try {
            accept(adapter.parse(raw));
        } catch (e) {
            setData(null);
            setError((e as Error).message);
        }
    };
    const parseText = async (value: string) => {
        if (!value.trim()) return;
        try {
            tryParse(await decodeCode(value));
        } catch (e) {
            setData(null);
            setError((e as Error).message);
        }
    };
    const onFile = async (file: File) => {
        try {
            tryParse(JSON.parse(await file.text()));
        } catch {
            setData(null);
            setError("JSON 파일을 읽을 수 없어요.");
        }
    };

    const info = data ? adapter.describe(data) : null;

    return (
        <Modal open={open} onClose={onClose} labelledBy="import-title" className="max-w-md">
            <h2 id="import-title" className="text-base font-bold text-content">
                {adapter.title} 가져오기
            </h2>

            {done ? (
                <>
                    <p className="mt-3 rounded-lg bg-good/10 px-3 py-2 text-sm text-good">기록 {info?.count}건을 가져왔어요.</p>
                    <div className="mt-5 flex justify-end">
                        <PrimaryButton onClick={onClose}>확인</PrimaryButton>
                    </div>
                </>
            ) : !data ? (
                <>
                    <p className="mt-1 text-sm text-muted">내보내기 한 링크·코드를 붙여넣거나 백업 파일을 선택하세요.</p>
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setError("");
                        }}
                        onPaste={(e) => {
                            const v = e.clipboardData.getData("text");
                            setTimeout(() => parseText(v));
                        }}
                        rows={4}
                        placeholder="https://…#import=… 또는 코드"
                        className="mt-3 w-full resize-none rounded-lg border border-line/15 bg-raised/80 px-3 py-2 font-mono text-xs text-content outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
                    />
                    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <ActionButton icon={<Upload size={15} />} label="붙여넣은 내용 확인" onClick={() => parseText(text)} />
                        <ActionButton icon={<FileUp size={15} />} label="파일 선택" onClick={() => fileRef.current?.click()} />
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onFile(f);
                            e.target.value = "";
                        }}
                    />
                    <div className="mt-5 flex justify-end">
                        <GhostButton onClick={onClose}>취소</GhostButton>
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-3 rounded-xl border border-line/10 bg-line/[0.03] p-3 text-sm text-muted">
                        <div>
                            기록 <b className="text-content">{info!.count}건</b>
                            {info!.detail && <> · {info!.detail}</>}
                        </div>
                        {info!.exportedAt && (
                            <div className="mt-0.5 text-xs text-faint">
                                내보낸 시각 {new Date(info!.exportedAt).toLocaleString("ko-KR")}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-[11px] font-medium text-muted">가져오는 방식</div>
                    <div className="mt-1 grid gap-2">
                        {(
                            [
                                ["merge", "합치기", `지금 기록 ${current}건은 유지하고, ${adapter.mergeHint}`],
                                ["replace", "덮어쓰기", `지금 기록 ${current}건을 지우고 가져온 기록으로 바꿔요.`],
                            ] as const
                        ).map(([v, label, desc]) => (
                            <label
                                key={v}
                                className={`flex cursor-pointer gap-2 rounded-lg border p-2.5 transition ${
                                    mode === v ? "border-accent/60 bg-accent/10" : "border-line/10 hover:border-line/25"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="import-mode"
                                    checked={mode === v}
                                    onChange={() => setMode(v)}
                                    className="mt-0.5 accent-[rgb(var(--c-accent-strong))]"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-content">{label}</span>
                                    <span className="block text-xs text-muted">{desc}</span>
                                </span>
                            </label>
                        ))}
                    </div>

                    {adapter.sensitive && (
                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
                            <input
                                type="checkbox"
                                checked={sensitive}
                                onChange={(e) => setSensitive(e.target.checked)}
                                className={checkbox}
                            />
                            {adapter.sensitive.importLabel}
                        </label>
                    )}

                    {mode === "replace" && current > 0 && (
                        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                            지금 이 브라우저의 기록 {current}건은 영구 삭제되며, 복구할 수 없어요.
                        </p>
                    )}

                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={() => (initial ? onClose() : setData(null))}
                            className="flex-1 rounded-lg border border-line/15 bg-line/5 px-4 py-2 text-sm font-semibold text-muted transition hover:text-content"
                        >
                            {initial ? "취소" : "뒤로"}
                        </button>
                        <button
                            onClick={() => {
                                adapter.apply(data, mode, { sensitive });
                                setDone(true);
                            }}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                                mode === "replace" ? "bg-rose-600 hover:bg-rose-500" : "bg-accent-strong hover:bg-accent"
                            }`}
                        >
                            {mode === "replace" ? "덮어쓰기" : "가져오기"}
                        </button>
                    </div>
                </>
            )}
        </Modal>
    );
}

/** 내보내기 / 가져오기 버튼. 링크(#import=…)로 들어오면 가져오기 창을 자동으로 연다 */
export function BackupMenu<T>({ adapter }: { adapter: BackupAdapter<T> }) {
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [linked, setLinked] = useState<T | null>(null);
    const [linkError, setLinkError] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash.includes(`${IMPORT_HASH_KEY}=`)) return;
        // 새로고침해도 다시 뜨지 않게 해시는 바로 지운다
        history.replaceState(null, "", window.location.pathname + window.location.search);
        decodeCode(hash)
            .then((raw) => {
                setLinked(adapter.parse(raw));
                setImportOpen(true);
            })
            .catch((e) => setLinkError((e as Error).message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <GhostButton onClick={() => setExportOpen(true)} className="flex items-center gap-1.5">
                <Download size={13} /> 내보내기
            </GhostButton>
            <GhostButton
                onClick={() => {
                    setLinked(null);
                    setImportOpen(true);
                }}
                className="flex items-center gap-1.5"
            >
                <Upload size={13} /> 가져오기
            </GhostButton>

            <ExportModal adapter={adapter} open={exportOpen} onClose={() => setExportOpen(false)} />
            <ImportModal adapter={adapter} open={importOpen} onClose={() => setImportOpen(false)} initial={linked} />

            <Modal open={!!linkError} onClose={() => setLinkError("")}>
                <h2 className="text-base font-bold text-content">링크를 읽을 수 없어요</h2>
                <p className="mt-2 text-sm text-muted">{linkError}</p>
                <div className="mt-5 flex justify-end">
                    <GhostButton onClick={() => setLinkError("")}>닫기</GhostButton>
                </div>
            </Modal>
        </>
    );
}
