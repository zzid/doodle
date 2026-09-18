import type { Metadata } from "next";
import MvpCalculator from "@/features/mvp/MvpCalculator";

export const metadata: Metadata = {
    title: "MVP 회수율 계산기 | Doodle",
    description: "3개월 250만원 기준 MVP 회수율과 플가 크레딧 추가 회수를 계산합니다.",
};

export default function Page() {
    return <MvpCalculator />;
}
