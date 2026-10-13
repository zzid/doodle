import { NextResponse } from "next/server";

/**
 * 닉네임이 이미 있는지 넥슨 Open API 로 확인한다.
 * 키는 서버 환경변수(NEXON_API_KEY)에만 두고, 브라우저는 이 라우트만 부른다.
 *
 * GET /api/nickname?name=닉네임 → { exists: boolean } | { error: string }
 */
export const dynamic = "force-dynamic";

const NEXON_ID_URL = "https://open.api.nexon.com/maplestory/v1/id";

export async function GET(req: Request) {
    const key = process.env.NEXON_API_KEY;
    if (!key) return NextResponse.json({ error: "API 키가 설정되지 않았어요." }, { status: 500 });

    const name = new URL(req.url).searchParams.get("name")?.trim() ?? "";
    if (!name || name.length > 12) return NextResponse.json({ error: "닉네임이 올바르지 않아요." }, { status: 400 });

    const res = await fetch(`${NEXON_ID_URL}?character_name=${encodeURIComponent(name)}`, {
        headers: { "x-nxopen-api-key": key },
        cache: "no-store",
    });
    if (res.ok) return NextResponse.json({ exists: true });

    const code: string | undefined = (await res.json().catch(() => null))?.error?.name;
    // 없는 캐릭터 이름은 "잘못된 파라미터"(OPENAPI00004)로 온다
    if (code === "OPENAPI00004") return NextResponse.json({ exists: false });
    if (code === "OPENAPI00007") return NextResponse.json({ error: "요청이 너무 많아요. 잠시 후 다시 해 보세요." }, { status: 429 });
    return NextResponse.json({ error: `확인하지 못했어요 (${code ?? res.status}).` }, { status: 502 });
}
