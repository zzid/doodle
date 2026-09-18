"use client";
import { useState } from "react";
import Link from "next/link";
import { Calculator } from "./styles";
import { calculate, defaults } from "./calculate";
export default function MvpCalculator() {
    const [values, setValues] = useState(defaults);
    const { results, mainError, flgaError, negative } = calculate(values);
    return <Calculator lang="ko"><main className="content"><Link href="/" className="back">← Doodle 홈</Link>
    <header><div className="eyebrow">MVP · RECOVERY CALCULATOR</div><h1>얼마나 회수할 수 있을까?</h1><p>아이템 판매로 돌려받는 금액과 실제 부담 비용을 계산해 보세요.</p></header>
    <div className="budget"><span>3개월 총 실적 · 캐시 충전 기준</span><strong>2,500,000원</strong></div>
    <div className="cards">
    <section className="card" aria-labelledby="main-title">
    <div className="card-top"><h2 id="main-title">MVP 회수율</h2><span className="badge">메인 아이템</span></div>
    <p className="description">아이템을 메소로 판매한 뒤 현금으로 회수하는 기준입니다.</p>
    <div className="field"><label htmlFor="cash">아이템 캐시 가격</label><div className="input-wrap"><input id="cash" type="number" inputMode="decimal" min="0.01" step="any" value={values["cash"]} onChange={(event) => setValues(current => ({ ...current, "cash": event.target.value }))}/><span className="unit">캐시</span></div></div>
    <div className="field"><label htmlFor="meso">아이템 판매가격</label><div className="input-wrap"><input id="meso" type="number" inputMode="decimal" min="0.01" step="any" value={values["meso"]} onChange={(event) => setValues(current => ({ ...current, "meso": event.target.value }))}/><span className="unit">억 메소</span></div></div>
    <div className="field"><label htmlFor="sell">억당 현금 판매 시세</label><div className="input-wrap"><input id="sell" type="number" inputMode="decimal" min="0" step="any" value={values["sell"]} onChange={(event) => setValues(current => ({ ...current, "sell": event.target.value }))}/><span className="unit">원 / 억</span></div></div>
    <div className="fee-banner"><span>메소 판매 수수료 · 고정</span><strong>3% (× 0.97)</strong></div>
    <p className="error" id="main-error" role="status">{mainError}</p>
    <div id="main-results" aria-live="polite" aria-atomic="true">
    <div className="hero"><div className="caption">예상 회수율</div><output id="rate">{results["rate"] ?? "—"}</output></div>
    <div className="row"><span>수수료 후 실제 획득 메소</span><output id="net-meso">{results["net-meso"] ?? "—"}</output></div>
    <div className="row"><span>게임재화 구매시세</span><output id="buy-price">{results["buy-price"] ?? "—"}</output></div>
    <div className="row"><span>예상 회수액</span><output id="recovered">{results["recovered"] ?? "—"}</output></div>
    <div className="row"><span>3개월 실질비용</span><output id="cost">{results["cost"] ?? "—"}</output></div>
    <div className="row"><span>월 실질비용</span><output id="monthly">{results["monthly"] ?? "—"}</output></div>
    </div>
    <details><summary>계산식 보기</summary><p>실제 획득 메소 = 아이템 판매가격 × 0.97<br />구매시세 = 아이템 캐시 가격 ÷ 실제 획득 메소<br />회수율 = 억당 현금 판매 시세 ÷ 구매시세 × 100<br />예상 회수액 = 2,500,000 × 회수율 ÷ 100<br />3개월 실질비용 = 2,500,000 − 예상 회수액<br />월 실질비용 = 3개월 실질비용 ÷ 3</p></details>
    <p className="note">1캐시 = 1원 기준. 메인 계산은 구매 수량을 정수로 제한하지 않은 비례 추정치이며, 플가 회수액은 포함하지 않습니다.</p>
    </section>
    <section className="card secondary" aria-labelledby="flga-title">
    <div className="card-top"><h2 id="flga-title">플가 추가 회수</h2><span className="badge">크레딧 활용</span></div>
    <p className="description">충전 보너스 크레딧을 최대 비율로 사용하여 플가를 구매하는 경우입니다.</p>
    <div className="field"><label htmlFor="credit-rate">캐시 충전 시 크레딧 적립률</label><div className="input-wrap"><input id="credit-rate" type="number" inputMode="decimal" min="0" max="100" step="any" value={values["credit-rate"]} onChange={(event) => setValues(current => ({ ...current, "credit-rate": event.target.value }))}/><span className="unit">%</span></div></div>
    <div className="field"><label htmlFor="flga-price">플가 가격</label><div className="input-wrap"><input id="flga-price" type="number" inputMode="decimal" min="0.01" step="any" value={values["flga-price"]} onChange={(event) => setValues(current => ({ ...current, "flga-price": event.target.value }))}/><span className="unit">원</span></div></div>
    <div className="field"><label htmlFor="credit-use">구매 시 크레딧 최대 사용비율</label><div className="input-wrap"><input id="credit-use" type="number" inputMode="decimal" min="0.01" max="100" step="any" value={values["credit-use"]} onChange={(event) => setValues(current => ({ ...current, "credit-use": event.target.value }))}/><span className="unit">%</span></div></div>
    <div className="field"><label htmlFor="flga-meso">플가 게임재화 판매시세</label><div className="input-wrap"><input id="flga-meso" type="number" inputMode="decimal" min="0" step="any" value={values["flga-meso"]} onChange={(event) => setValues(current => ({ ...current, "flga-meso": event.target.value }))}/><span className="unit">억 메소</span></div></div>
    <p className="error" id="flga-error" role="status">{flgaError}</p>
    <div id="flga-results" aria-live="polite" aria-atomic="true">
    <div className="hero"><div className="caption">플가 순 추가 회수 · 구매 캐시 차감 후</div><output id="flga-net" className={negative ? "negative" : undefined}>{results["flga-net"] ?? "—"}</output></div>
    <div className="row"><span>250만원 충전 시 총 크레딧</span><output id="credit-total">{results["credit-total"] ?? "—"}</output></div>
    <div className="row"><span>플가 1개당 사용 크레딧</span><output id="credit-each">{results["credit-each"] ?? "—"}</output></div>
    <div className="row"><span>구매 가능 정수 수량</span><output id="flga-count">{results["flga-count"] ?? "—"}</output></div>
    <div className="row"><span>플가 구매에 필요한 캐시</span><output id="flga-cash">{results["flga-cash"] ?? "—"}</output></div>
    <div className="row"><span>수수료 후 총 획득 메소</span><output id="flga-net-meso">{results["flga-net-meso"] ?? "—"}</output></div>
    <div className="row"><span>플가 현금 회수액</span><output id="flga-recovered">{results["flga-recovered"] ?? "—"}</output></div>
    <div className="row"><span>남은 크레딧</span><output id="credit-left">{results["credit-left"] ?? "—"}</output></div>
    </div>
    <p className="note">메인 카드의 억당 현금 시세와 수수료 3%를 동일하게 적용합니다. 수량은 보유 크레딧 기준이며, 나머지 구매 대금은 별도 캐시로 부담합니다. 추가 캐시 충전으로 생기는 크레딧은 재적립하지 않습니다. 순 추가 회수가 음수이면 추가 손실입니다.</p>
    <details><summary>계산식 보기</summary><p>총 크레딧 = 2,500,000 × 적립률<br />1개당 크레딧 = 플가 가격 × 크레딧 사용비율<br />구매 수량 = ⌊총 크레딧 ÷ 1개당 크레딧⌋<br />필요 캐시 = 수량 × (플가 가격 − 1개당 크레딧)<br />획득 메소 = 수량 × 플가 판매시세 × 0.97<br />현금 회수액 = 획득 메소 × 억당 현금 판매 시세<br />순 추가 회수 = 현금 회수액 − 필요 캐시</p></details>
    </section>
    </div>
    <footer>입력값을 바꾸면 즉시 계산됩니다. 금액은 원 단위로 반올림하며 계산에는 반올림 전 값을 사용합니다. </footer>
    </main></Calculator>;
}
