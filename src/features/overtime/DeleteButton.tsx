import React, { useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { GhostButton } from "@/features/symbol/components/ui";
import { Modal } from "./Modal";

/**
 * 삭제 버튼 + 확인 모달.
 * 기록은 localStorage 에만 있어서 지우면 되돌릴 수 없으므로, 모든 삭제는 모달로 한 번 더 확인한다.
 * (브라우저 confirm() 대신 직접 그린 모달)
 */
export function DeleteButton({
    label,
    title,
    description,
    disabled,
    className = "",
    onConfirm,
}: {
    label: string;
    /** 모달 제목. 예: "10월 12일 기록을 삭제할까요?" */
    title: string;
    /** 무엇이 지워지는지 */
    description: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onConfirm: () => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <GhostButton
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={`flex items-center justify-center gap-1.5 hover:!border-danger/50 hover:!bg-danger/10 hover:!text-danger disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
            >
                <Trash2 size={13} /> {label}
            </GhostButton>

            <Modal open={open} onClose={() => setOpen(false)} role="alertdialog" labelledBy="delete-dialog-title">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
                    <TriangleAlert size={20} />
                </div>
                <h2 id="delete-dialog-title" className="text-base font-bold text-content">
                    {title}
                </h2>
                <div className="mt-2 text-sm text-muted">{description}</div>
                <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                    이 브라우저의 로컬 스토리지에서 영구 삭제되며, 복구할 수 없어요.
                </p>
                <div className="mt-5 flex gap-2">
                    <button
                        autoFocus
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-lg border border-line/15 bg-line/5 px-4 py-2 text-sm font-semibold text-muted transition hover:text-content"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            onConfirm();
                        }}
                        className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                    >
                        삭제
                    </button>
                </div>
            </Modal>
        </>
    );
}
