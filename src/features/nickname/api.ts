/** 닉네임이 이미 있는지 (서버 라우트 → 넥슨 Open API). 실패하면 에러 메시지를 던진다. */
export async function nicknameExists(name: string): Promise<boolean> {
    const res = await fetch(`/api/nickname?name=${encodeURIComponent(name)}`);
    const body: { exists?: boolean; error?: string } = await res.json().catch(() => ({}));
    if (typeof body.exists !== "boolean") throw new Error(body.error ?? "확인하지 못했어요.");
    return body.exists;
}
