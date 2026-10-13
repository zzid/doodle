/**
 * 사이트 전체 페이지 레지스트리.
 * 홈(사이트맵)과 상단 네비게이션이 모두 이 목록 하나만 바라본다.
 * 새 페이지를 추가하면 여기에만 등록하면 된다.
 *
 * 그룹
 *  - personal: 기록 · 실험 (루트 경로)
 *  - game:     메이플스토리 유틸 (/private/* 아래)
 */

export interface SitePage {
    path: string;
    title: string;
    description: string;
    emoji: string;
    /** true 면 홈·메뉴에서 숨긴다 (주소로 직접 들어가는 건 가능) */
    hidden?: boolean;
}

export interface SiteSection {
    id: string;
    label: string;
    pages: SitePage[];
}

export interface SiteGroup {
    id: "personal" | "game";
    label: string;
    description: string;
    emoji: string;
    sections: SiteSection[];
}

/** 게임 유틸 경로 prefix */
export const GAME_BASE = "/private";

export const SITE_GROUPS: SiteGroup[] = [
    {
        id: "personal",
        label: "기록 · 실험",
        description: "일상 기록 도구와 실험용 컴포넌트를 모아둔 곳이에요.",
        emoji: "🗂️",
        sections: [
            {
                id: "record",
                label: "기록",
                pages: [
                    {
                        path: "/todo",
                        title: "할 일",
                        description:
                            "자연어로 빠르게 입력하고, 오늘·예정·보드로 정리하는 할 일 관리예요.",
                        emoji: "✅",
                    },
                    {
                        path: "/overtime",
                        title: "초과근로 기록",
                        description:
                            "달력에 초과근로를 기록하고 월별 수당과 보상휴가를 계산해요.",
                        emoji: "⏰",
                    },
                ],
            },
            {
                id: "fun",
                label: "재미",
                pages: [
                    {
                        path: "/earning",
                        title: "오늘 번 돈",
                        description:
                            "출근부터 지금까지 번 돈이 1초마다 올라가고, 퇴근까지 남은 시간을 보여줘요.",
                        emoji: "💸",
                    },
                ],
            },
            {
                id: "lab",
                label: "실험실",
                pages: [
                    {
                        path: "/motion",
                        title: "Motion 실험",
                        description: "framer-motion 애니메이션 예제 모음이에요.",
                        emoji: "🎬",
                    },
                ],
            },
        ],
    },
    {
        id: "game",
        label: "게임 유틸",
        description: "메이플스토리 계산기, 캘린더, 이벤트 아카이브예요.",
        emoji: "🍁",
        sections: [
            {
                id: "manage",
                label: "관리",
                pages: [
                    {
                        path: `${GAME_BASE}/me-calendar`,
                        title: "메-달력",
                        description: "목요일(메요일) 시작 달력에 번 메소·쓴 메소·일정을 기록해요.",
                        emoji: "🗓️",
                    },
                    {
                        path: `${GAME_BASE}/maple-todo`,
                        title: "메TODO",
                        description: "캐릭터별 장비·내실 할 일을 체크리스트로 관리해요.",
                        emoji: "📝",
                    },
                ],
            },
            {
                id: "calc",
                label: "계산기",
                pages: [
                    {
                        path: `${GAME_BASE}/symbol`,
                        title: "심볼 계산기",
                        description:
                            "어센틱 심볼로 목표 보스 어드밴티지 Force까지 가는 최소 비용과, 아케인 심볼 만렙 예상일을 계산해요.",
                        emoji: "⚡",
                    },
                    {
                        path: `${GAME_BASE}/mvp`,
                        title: "MVP 회수율 계산기",
                        description:
                            "MVP 등급별 실질 비용과 크레딧 환산 회수율을 계산해요.",
                        emoji: "🧮",
                    },
                    {
                        path: `${GAME_BASE}/exp-coupon`,
                        hidden: true,
                        title: "경험치 쿠폰 계산기",
                        description:
                            "일반/상급 경험치 쿠폰 사용 구간에 따른 기대 효율을 비교해요.",
                        emoji: "🎫",
                    },
                ],
            },
            {
                id: "chart",
                label: "차트 · 캘린더",
                pages: [
                    {
                        path: `${GAME_BASE}/calendar`,
                        hidden: true,
                        title: "이벤트 캘린더",
                        description:
                            "누적 출석 카운트와 단계별 보상 효과를 함께 보는 캘린더예요.",
                        emoji: "📅",
                    },
                    {
                        path: `${GAME_BASE}/maple-calendar`,
                        hidden: true,
                        title: "메이플 캘린더",
                        description: "메이플 이벤트 일정을 한눈에 보는 뷰어예요.",
                        emoji: "🍁",
                    },
                    {
                        path: `${GAME_BASE}/mepo`,
                        hidden: true,
                        title: "메포 차트",
                        description: "메소/메이플포인트 환율 추이 차트예요.",
                        emoji: "💰",
                    },
                ],
            },
            {
                id: "archive",
                label: "이벤트 아카이브",
                pages: [
                    {
                        path: `${GAME_BASE}/event-2412`,
                        hidden: true,
                        title: "Event 2412",
                        description: "2024년 12월 언리쉬 이벤트 캘린더예요.",
                        emoji: "🎉",
                    },
                    {
                        path: `${GAME_BASE}/event-2408`,
                        hidden: true,
                        title: "Event 2408",
                        description: "2024년 8월 이벤트 코인샵과 버프 정리예요.",
                        emoji: "🪙",
                    },
                ],
            },
        ],
    },
];

/** 숨김 페이지를 뺀 섹션 목록 (비게 된 섹션도 제외) — 홈·메뉴 표시용 */
export function visibleSections(group: SiteGroup): SiteSection[] {
    return group.sections
        .map((s) => ({ ...s, pages: s.pages.filter((p) => !p.hidden) }))
        .filter((s) => s.pages.length > 0);
}

/** 평탄화된 섹션 목록 (숨김 포함) */
export const SITE_SECTIONS: SiteSection[] = SITE_GROUPS.flatMap((g) => g.sections);

/** 평탄화된 전체 페이지 목록 */
export const ALL_PAGES: SitePage[] = SITE_SECTIONS.flatMap((s) => s.pages);

/** 경로로 페이지 정보 찾기 (가장 긴 prefix 우선) */
export function findPageByPath(pathname: string): SitePage | undefined {
    return ALL_PAGES.filter(
        (p) => pathname === p.path || pathname.startsWith(p.path + "/")
    ).sort((a, b) => b.path.length - a.path.length)[0];
}

/** 경로가 속한 그룹 */
export function findGroupByPath(pathname: string): SiteGroup | undefined {
    const page = findPageByPath(pathname);
    if (page) return SITE_GROUPS.find((g) => g.sections.some((s) => s.pages.includes(page)));
    return pathname.startsWith(GAME_BASE) ? SITE_GROUPS.find((g) => g.id === "game") : undefined;
}
