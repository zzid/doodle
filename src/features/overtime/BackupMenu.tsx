import React from "react";
import { type BackupAdapter, BackupMenu } from "@/components/BackupMenu";
import { BACKUP_APP, BACKUP_VERSION, type BackupData, describeBackup, parseBackup } from "./backup";
import { pickBackupSettings, useOvertimeStore } from "./store";

/** 초과근로 기록용 내보내기/가져오기 — 공통 BackupMenu 에 이 페이지 데이터만 연결한다 */
export function OvertimeBackupMenu() {
    const state = useOvertimeStore();

    const adapter: BackupAdapter<BackupData> = {
        title: "초과근로 기록",
        filePrefix: "overtime-backup",
        build: ({ sensitive }) => ({
            app: BACKUP_APP,
            v: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            entries: state.entries,
            settings: sensitive
                ? pickBackupSettings(state)
                : { ...pickBackupSettings(state), hourlyWage: 0, salary: 0, monthlyBase: 0 },
        }),
        parse: parseBackup,
        describe: (d) => {
            const info = describeBackup(d);
            return {
                count: info.count,
                detail: info.count ? `${info.months}개월 (${info.first} ~ ${info.last})` : undefined,
                exportedAt: d.exportedAt,
            };
        },
        currentCount: Object.keys(state.entries).length,
        mergeHint: "같은 날짜만 가져온 값으로 바꿔요.",
        apply: (d, mode, { sensitive }) => state.importBackup(d, mode, sensitive),
        sensitive: {
            exportLabel: "시급·연봉 금액도 포함",
            importLabel: "시급·연봉·공제 설정도 가져오기",
            warning: "링크·파일에 시급/연봉이 들어 있어요. 다른 사람에게 보내지 않도록 주의하세요.",
            has: (d) => d.settings.hourlyWage > 0 || d.settings.salary > 0,
        },
    };

    return <BackupMenu adapter={adapter} />;
}
