import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, FileUp, Link2, Share2, Upload } from "lucide-react";
import { GhostButton, PrimaryButton } from "@/features/symbol/components/ui";
import { Modal } from "./Modal";
import {
    BACKUP_APP,
    BACKUP_VERSION,
    IMPORT_HASH_KEY,
    type BackupData,
    backupFileName,
    buildImportLink,
    decodeBackup,
    describeBackup,
    encodeBackup,
    parseBackup,
} from "./backup";
import { pickBackupSettings, useOvertimeStore } from "./store";

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

function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const state = useOvertimeStore();
    const [withSettings, setWithSettings] = useState(true);
    const [code, setCode] = useState("");

    const data: BackupData = {
        app: BACKUP_APP,
        v: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        entries: state.entries,
        settings: withSettings
            ? pickBackupSettings(state)
            : { ...pickBackupSettings(state), hourlyWage: 0, salary: 0, monthlyBase: 0 },
    };
    const count = Object.keys(state.entries).length;

    useEffect(() => {
        if (!open) return;
        let alive = true;
        encodeBackup(data).then((c) => alive && setCode(c));
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, withSettings, state.entries]);

    const link = code ? buildImportLink(code) : "";
    const json = JSON.stringify(data, null, 2);
    const canShare = typeof navigator !== "undefined" && !!navigator.share;

    const saveFile = async () => {
        const file = new File([json], backupFileName(), { type: "application/json" });
        // 모바일: 공유 시트로 파일을 넘기면 파일 앱/카톡/드라이브 등에 바로 저장 가능
        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: "초과근로 기록 백업" });
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
                기록 내보내기
            </h2>
            <p className="mt-1 text-sm text-muted">
                기록 {count}건을 다른 기기나 브라우저로 옮길 수 있어요. 서버에는 아무것도 저장되지 않아요.
            </p>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input
                    type="checkbox"
                    checked={withSettings}
                    onChange={(e) => setWithSettings(e.target.checked)}
                    className="h-4 w-4 accent-[rgb(var(--c-accent-strong))]"
                />
                시급·연봉 금액도 포함
            </label>

            <section className="mt-4">
                <h3 className="mb-1 text-xs font-bold text-content">🔗 링크로 옮기기 (추천 · 모바일 OK)</h3>
                <p className="mb-2 text-xs text-faint">
                    다른 기기에서 링크를 열면 바로 가져오기 화면이 떠요. 카톡 나에게 보내기, 메모 앱 등으로 보내세요.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <ActionButton
                        icon={<Link2 size={15} />}
                        label="링크 복사"
                        doneLabel="복사됨"
                        onClick={() => copyText(link)}
                    />
                    {canShare ? (
                        <ActionButton
                            icon={<Share2 size={15} />}
                            label="공유하기"
                            onClick={async () => {
                                try {
                                    await navigator.share({ title: "초과근로 기록", url: link });
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
                <p className="mt-1.5 text-[11px] text-faint tabular-nums">
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

            {withSettings && (
                <p className="mt-4 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">
                    링크·파일에 시급/연봉이 들어 있어요. 다른 사람에게 보내지 않도록 주의하세요.
                </p>
            )}
            <div className="mt-5 flex justify-end">
                <GhostButton onClick={onClose}>닫기</GhostButton>
            </div>
        </Modal>
    );
}

function ImportModal({
    open,
    onClose,
    initial,
}: {
    open: boolean;
    onClose: () => void;
    /** 링크로 들어왔을 때 미리 해석된 데이터 */
    initial?: BackupData | null;
}) {
    const importBackup = useOvertimeStore((s) => s.importBackup);
    const currentCount = useOvertimeStore((s) => Object.keys(s.entries).length);
    const [text, setText] = useState("");
    const [data, setData] = useState<BackupData | null>(null);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<"merge" | "replace">("merge");
    const [withSettings, setWithSettings] = useState(true);
    const [done, setDone] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setText("");
        setError("");
        setDone(false);
        setMode("merge");
        setData(initial ?? null);
        setWithSettings(!!initial && (initial.settings.hourlyWage > 0 || initial.settings.salary > 0));
    }, [open, initial]);

    const accept = (d: BackupData) => {
        setData(d);
        setError("");
        setWithSettings(d.settings.hourlyWage > 0 || d.settings.salary > 0);
    };

    const parseText = async (value: string) => {
        if (!value.trim()) return;
        try {
            accept(await decodeBackup(value));
        } catch (e) {
            setData(null);
            setError((e as Error).message);
        }
    };

    const onFile = async (file: File) => {
        try {
            accept(parseBackup(JSON.parse(await file.text())));
        } catch (e) {
            setData(null);
            setError(e instanceof SyntaxError ? "JSON 파일을 읽을 수 없어요." : (e as Error).message);
        }
    };

    const info = data ? describeBackup(data) : null;

    return (
        <Modal open={open} onClose={onClose} labelledBy="import-title" className="max-w-md">
            <h2 id="import-title" className="text-base font-bold text-content">
                기록 가져오기
            </h2>

            {done ? (
                <>
                    <p className="mt-3 rounded-lg bg-good/10 px-3 py-2 text-sm text-good">
                        기록 {info?.count}건을 가져왔어요.
                    </p>
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
                        <ActionButton
                            icon={<Upload size={15} />}
                            label="붙여넣은 내용 확인"
                            onClick={() => parseText(text)}
                        />
                        <ActionButton
                            icon={<FileUp size={15} />}
                            label="파일 선택"
                            onClick={() => fileRef.current?.click()}
                        />
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
                            {info!.count > 0 && (
                                <>
                                    {" "}· {info!.months}개월 ({info!.first} ~ {info!.last})
                                </>
                            )}
                        </div>
                        {data.exportedAt && (
                            <div className="mt-0.5 text-xs text-faint">
                                내보낸 시각 {new Date(data.exportedAt).toLocaleString("ko-KR")}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-[11px] font-medium text-muted">가져오는 방식</div>
                    <div className="mt-1 grid gap-2">
                        {(
                            [
                                ["merge", "합치기", `지금 기록 ${currentCount}건은 유지하고, 같은 날짜만 가져온 값으로 바꿔요.`],
                                ["replace", "덮어쓰기", `지금 기록 ${currentCount}건을 지우고 가져온 기록으로 바꿔요.`],
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

                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted">
                        <input
                            type="checkbox"
                            checked={withSettings}
                            onChange={(e) => setWithSettings(e.target.checked)}
                            className="h-4 w-4 accent-[rgb(var(--c-accent-strong))]"
                        />
                        시급·연봉·공제 설정도 가져오기
                    </label>

                    {mode === "replace" && currentCount > 0 && (
                        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                            지금 이 브라우저의 기록 {currentCount}건은 영구 삭제되며, 복구할 수 없어요.
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
                                importBackup(data, mode, withSettings);
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

/** 헤더에 붙는 내보내기 / 가져오기 버튼. 링크(#import=…)로 들어오면 가져오기 창을 자동으로 연다 */
export function BackupMenu() {
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [linked, setLinked] = useState<BackupData | null>(null);
    const [linkError, setLinkError] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash.includes(`${IMPORT_HASH_KEY}=`)) return;
        // 새로고침해도 다시 뜨지 않게 해시는 바로 지운다
        history.replaceState(null, "", window.location.pathname + window.location.search);
        decodeBackup(hash)
            .then((d) => {
                setLinked(d);
                setImportOpen(true);
            })
            .catch((e) => setLinkError((e as Error).message));
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

            <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
            <ImportModal open={importOpen} onClose={() => setImportOpen(false)} initial={linked} />

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
