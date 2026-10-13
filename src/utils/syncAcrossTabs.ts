/**
 * 같은 페이지를 여러 탭에서 열어 둘 때 localStorage 저장 충돌을 막는다.
 *
 * zustand persist 는 상태가 바뀔 때마다 "전체 상태"를 저장하므로, 탭 A 가 오래된 상태를 들고 있다가
 * 저장하면 탭 B 에서 방금 고친 내용이 덮여 사라진다. 다른 탭이 저장하면 오는 storage 이벤트를 받아
 * 바로 다시 읽어 들여(rehydrate) 모든 탭이 항상 최신 상태를 갖게 한다.
 */
interface PersistedStore {
    persist: {
        rehydrate: () => Promise<void> | void;
        getOptions: () => { name?: string };
    };
}

export function syncAcrossTabs(store: PersistedStore) {
    if (typeof window === "undefined") return;
    const key = store.persist.getOptions().name;
    if (!key) return;
    window.addEventListener("storage", (e) => {
        if (e.key === key && e.newValue !== null) void store.persist.rehydrate();
    });
}
