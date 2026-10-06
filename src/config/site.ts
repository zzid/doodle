/**
 * 사이트 전체 페이지 레지스트리.
 * 홈(사이트맵)과 상단 네비게이션이 모두 이 목록 하나만 바라본다.
 * 새 페이지를 추가하면 여기에만 등록하면 된다.
 */

export interface SitePage {
    path: string;
    title: string;
    description: string;
    emoji: string;
}

export interface SiteSection {
    id: string;
    label: string;
    pages: SitePage[];
}

export const SITE_SECTIONS: SiteSection[] = [
    {
        id: "calc",
        label: "계산기",
        pages: [
            {
                path: "/symbol",
                title: "심볼 계산기",
                description:
                    "어센틱 심볼로 목표 보스 어드밴티지 Force까지 가는 최소 비용과, 아케인 심볼 만렙 예상일을 계산해요.",
                emoji: "⚡",
            },
            {
                path: "/mvp",
                title: "MVP 회수율 계산기",
                description:
                    "MVP 등급별 실질 비용과 크레딧 환산 회수율을 계산해요.",
                emoji: "🧮",
            },
            {
                path: "/exp-coupon",
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
                path: "/calendar",
                title: "이벤트 캘린더",
                description:
                    "누적 출석 카운트와 단계별 보상 효과를 함께 보는 캘린더예요.",
                emoji: "📅",
            },
            {
                path: "/maple-calendar",
                title: "메이플 캘린더",
                description: "메이플 이벤트 일정을 한눈에 보는 뷰어예요.",
                emoji: "🍁",
            },
            {
                path: "/mepo",
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
                path: "/event-2412",
                title: "Event 2412",
                description: "2024년 12월 언리쉬 이벤트 캘린더예요.",
                emoji: "🎉",
            },
            {
                path: "/event-2408",
                title: "Event 2408",
                description: "2024년 8월 이벤트 코인샵과 버프 정리예요.",
                emoji: "🪙",
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
];

/** 평탄화된 전체 페이지 목록 */
export const ALL_PAGES: SitePage[] = SITE_SECTIONS.flatMap((s) => s.pages);

/** 경로로 페이지 정보 찾기 (가장 긴 prefix 우선) */
export function findPageByPath(pathname: string): SitePage | undefined {
    return ALL_PAGES.filter(
        (p) => pathname === p.path || pathname.startsWith(p.path + "/")
    ).sort((a, b) => b.path.length - a.path.length)[0];
}
