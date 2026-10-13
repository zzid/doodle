/**
 * 서버 없이 기기 간에 데이터를 옮기기 위한 공통 코덱.
 *
 * - 파일:  JSON 그대로 (.json)
 * - 코드:  JSON → deflate 압축 → base64url. 앞 글자로 형식 구분 ("z" 압축 / "j" 비압축)
 * - 링크:  {현재 페이지}#import={코드}
 *          해시(#)는 서버로 전송되지 않으므로 데이터가 서버에 남지 않는다.
 *
 * 무엇을 담을지·어떻게 검증할지는 각 페이지가 정하고(BackupAdapter), 여기서는 인코딩만 한다.
 */

export const IMPORT_HASH_KEY = "import";

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

/** 객체 → 링크에 넣을 코드 */
export async function encodeCode(data: unknown): Promise<string> {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    if (typeof CompressionStream !== "undefined")
        return "z" + toB64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
    return "j" + toB64Url(bytes);
}

/** 링크·코드·JSON 텍스트 → 원본 객체 (검증은 호출하는 쪽에서) */
export async function decodeCode(input: string): Promise<unknown> {
    const trimmed = input.trim();
    // 링크를 통째로 붙여넣은 경우 해시에서 코드만 꺼낸다
    const m = trimmed.match(new RegExp(`[#&]${IMPORT_HASH_KEY}=([^&\\s]+)`));
    const c = m ? m[1] : trimmed;

    // JSON 을 그대로 붙여넣은 경우
    if (c.startsWith("{")) {
        try {
            return JSON.parse(c);
        } catch {
            throw new Error("JSON 형식이 올바르지 않아요.");
        }
    }

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
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        throw new Error("코드가 손상됐어요. 전체를 다시 복사해 주세요.");
    }
}

export const buildImportLink = (code: string) =>
    `${window.location.origin}${window.location.pathname}#${IMPORT_HASH_KEY}=${code}`;

export const backupFileName = (prefix: string) => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${prefix}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
};

export const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null;
