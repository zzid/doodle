import type { Entry } from "./calc";

/**
 * 서버 없이 기기 간에 기록을 옮기기 위한 백업 포맷.
 *
 * - 파일:  JSON 그대로 (.json)
 * - 코드:  JSON → deflate 압축 → base64url. 앞 글자로 형식 구분 ("z" 압축 / "j" 비압축)
 * - 링크:  {현재 페이지}#import={코드}
 *          해시(#)는 서버로 전송되지 않으므로 GitHub Pages 에서도 데이터가 서버에 남지 않는다.
 */

export const BACKUP_APP = "doodle-overtime";
export const BACKUP_VERSION = 1;
export const IMPORT_HASH_KEY = "import";

export interface BackupSettings {
    wageMode: "hourly" | "salary";
    hourlyWage: number;
    salary: number;
    leaveWeighted: boolean;
    monthlyBase: number;
    nonTaxable: number;
    family: number;
    children: number;
    withholdingRatio: number;
}

export interface BackupData {
    app: typeof BACKUP_APP;
    v: number;
    exportedAt: string;
    entries: Record<string, Entry>;
    settings: BackupSettings;
}

/* ---------- 검증 ---------- */

const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null;

export function parseBackup(raw: unknown): BackupData {
    if (!isObj(raw) || raw.app !== BACKUP_APP) throw new Error("초과근로 기록 백업 데이터가 아니에요.");
    if (typeof raw.v !== "number" || raw.v > BACKUP_VERSION)
        throw new Error("더 최신 버전에서 만든 백업이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
    if (!isObj(raw.entries)) throw new Error("기록 데이터가 비어 있어요.");

    const entries: Record<string, Entry> = {};
    for (const [date, e] of Object.entries(raw.entries)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isObj(e)) continue;
        if (typeof e.start !== "string" || !/^\d{2}:\d{2}$/.test(e.start)) continue;
        entries[date] = {
            start: e.start,
            hours: Number(e.hours) || 0,
            breakMin: Number(e.breakMin) || 0,
            comp: e.comp === "leave" ? "leave" : "pay",
            ...(["weekday", "saturday", "holiday"].includes(e.dayType) ? { dayType: e.dayType } : {}),
            ...(typeof e.memo === "string" && e.memo ? { memo: e.memo } : {}),
        };
    }
    const s = isObj(raw.settings) ? raw.settings : {};
    return {
        app: BACKUP_APP,
        v: raw.v,
        exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
        entries,
        settings: {
            wageMode: s.wageMode === "salary" ? "salary" : "hourly",
            hourlyWage: Number(s.hourlyWage) || 0,
            salary: Number(s.salary) || 0,
            leaveWeighted: s.leaveWeighted !== false,
            monthlyBase: Number(s.monthlyBase) || 0,
            nonTaxable: s.nonTaxable === undefined ? 200_000 : Number(s.nonTaxable) || 0,
            family: Number(s.family) || 1,
            children: Number(s.children) || 0,
            withholdingRatio: [0.8, 1, 1.2].includes(s.withholdingRatio) ? s.withholdingRatio : 1,
        },
    };
}

/* ---------- 코드 인코딩 ---------- */

const toB64Url = (bytes: Uint8Array) => {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromB64Url = (s: string) => {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
    const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
}

const canCompress = () => typeof CompressionStream !== "undefined";

export async function encodeBackup(data: BackupData): Promise<string> {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    if (canCompress()) return "z" + toB64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
    return "j" + toB64Url(bytes);
}

export async function decodeBackup(code: string): Promise<BackupData> {
    const trimmed = code.trim();
    // 링크를 통째로 붙여넣은 경우 해시에서 코드만 꺼낸다
    const m = trimmed.match(new RegExp(`[#&]${IMPORT_HASH_KEY}=([^&\\s]+)`));
    const c = m ? m[1] : trimmed;

    // JSON 을 그대로 붙여넣은 경우
    if (c.startsWith("{")) return parseBackup(JSON.parse(c));

    let bytes: Uint8Array;
    try {
        bytes = fromB64Url(c.slice(1));
    } catch {
        throw new Error("코드 형식이 올바르지 않아요.");
    }
    if (c[0] === "z") {
        if (typeof DecompressionStream === "undefined")
            throw new Error("이 브라우저는 압축 코드를 풀 수 없어요. 파일로 옮겨 주세요.");
        try {
            bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
        } catch {
            throw new Error("코드가 손상됐어요. 전체를 다시 복사해 주세요.");
        }
    } else if (c[0] !== "j") {
        throw new Error("코드 형식이 올바르지 않아요.");
    }
    try {
        return parseBackup(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (e) {
        throw e instanceof SyntaxError ? new Error("코드가 손상됐어요. 전체를 다시 복사해 주세요.") : e;
    }
}

export const buildImportLink = (code: string) =>
    `${window.location.origin}${window.location.pathname}#${IMPORT_HASH_KEY}=${code}`;

export const backupFileName = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `overtime-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
};

/** 백업 요약 (가져오기 확인용) */
export function describeBackup(data: BackupData) {
    const dates = Object.keys(data.entries).sort();
    const months = new Set(dates.map((d) => d.slice(0, 7)));
    return {
        count: dates.length,
        months: months.size,
        first: dates[0],
        last: dates[dates.length - 1],
    };
}
