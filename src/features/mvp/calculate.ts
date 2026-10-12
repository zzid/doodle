/**
 * MVP 회수율 계산.
 *
 * 총 회수액 = 메인 아이템 회수액 + 크레딧으로 산 아이템들의 순회수액
 * - 메인:   2,500,000원 충전으로 산 아이템을 메소로 팔아 현금화
 * - 크레딧: 충전 적립 크레딧으로 산 아이템(개당 가격 × 개수)을 메소로 팔아 현금화.
 *           크레딧은 충전 보너스라 비용으로 빼지 않는다. 다만 보유 크레딧보다 많이 썼다면
 *           모자란 만큼은 캐시로 결제한 것으로 보고 회수액에서 뺀다.
 * 메소 판매 수수료 3%(× 0.97), 1캐시 = 1원.
 */

export const TOTAL = 2_500_000;
export const NET = 0.97;

export interface CreditItem {
    id: string;
    name: string;
    /** 개당 가격 (크레딧) */
    price: string;
    /** 개수 */
    count: string;
    /** 개당 판매가 (억 메소) */
    meso: string;
}

export interface Inputs {
    /** 메인 아이템 캐시 가격 */
    cash: string;
    /** 메인 아이템 판매 가격 (억 메소) */
    meso: string;
    /** 억당 현금 판매 시세 (원) */
    sell: string;
    /** 캐시 충전 시 크레딧 적립률 (%) */
    creditRate: string;
    items: CreditItem[];
}

export const newItemId = () => Math.random().toString(36).slice(2, 9);

export const defaults: Inputs = {
    cash: "54000",
    meso: "26",
    sell: "1500",
    creditRate: "5",
    items: [{ id: "default", name: "플가", price: "5900", count: "21", meso: "3" }],
};

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

export interface ItemResult {
    valid: boolean;
    /** 아직 아무것도 입력하지 않은 줄 (계산에서 조용히 빠짐) */
    empty: boolean;
    count: number;
    /** 사용 크레딧 = 개당 가격 × 개수 */
    credit: number;
    /** 수수료 후 메소 합계 (억) */
    netMeso: number;
    /** 판매 현금화 금액 */
    recovered: number;
    /** 크레딧 1당 회수 (원) */
    perCredit: number;
}

export interface Result {
    main: {
        valid: boolean;
        netMeso: number;
        /** 원 / 억 */
        buyPrice: number;
        recovered: number;
        rate: number;
    };
    credit: {
        valid: boolean;
        total: number;
        used: number;
        left: number;
        over: boolean;
        /** 모자라서 캐시로 낸 금액 */
        shortfall: number;
        items: ItemResult[];
        /** 판매 현금화 합계 */
        gross: number;
        /** 순회수 = gross − shortfall */
        net: number;
        rate: number;
    };
    totalRecovered: number;
    totalRate: number;
    cost: number;
    monthly: number;
    errors: { main: string; credit: string };
}

export function calculate(v: Inputs): Result {
    const cash = num(v.cash);
    const meso = num(v.meso);
    const sell = num(v.sell);
    const validSell = Number.isFinite(sell) && sell >= 0;

    // 메인 아이템
    const netMeso = meso * NET;
    const buyPrice = cash / netMeso;
    const mainRate = sell / buyPrice;
    const mainValid =
        Number.isFinite(cash) && cash > 0 && Number.isFinite(meso) && meso > 0 && validSell && Number.isFinite(mainRate);
    const mainRecovered = mainValid ? TOTAL * mainRate : 0;

    // 크레딧 아이템
    const creditRate = num(v.creditRate);
    const rateValid = Number.isFinite(creditRate) && creditRate >= 0 && creditRate <= 100;
    const totalCredit = rateValid ? (TOTAL * creditRate) / 100 : 0;
    const items: ItemResult[] = v.items.map((it) => {
        const price = num(it.price);
        const count = num(it.count);
        const m = num(it.meso);
        const empty = [it.price, it.count, it.meso].every((x) => x.trim() === "");
        const valid =
            validSell &&
            Number.isFinite(price) && price >= 0 &&
            Number.isFinite(count) && count >= 0 &&
            Number.isFinite(m) && m >= 0;
        const credit = valid ? price * count : 0;
        const itemNetMeso = valid ? m * count * NET : 0;
        const recovered = valid ? itemNetMeso * sell : 0;
        return {
            valid,
            empty,
            count: valid ? count : 0,
            credit,
            netMeso: itemNetMeso,
            recovered,
            perCredit: credit > 0 ? recovered / credit : 0,
        };
    });
    const used = items.reduce((s, i) => s + i.credit, 0);
    // 보유보다 많이 쓴 크레딧은 캐시로 결제한 것으로 본다
    const shortfall = Math.max(0, used - totalCredit);
    const creditGross = items.reduce((s, i) => s + i.recovered, 0);
    const creditNet = creditGross - shortfall;
    const creditValid = rateValid && items.every((i) => i.valid || i.empty);

    const totalRecovered = mainRecovered + creditNet;
    const cost = TOTAL - totalRecovered;

    return {
        main: { valid: mainValid, netMeso, buyPrice, recovered: mainRecovered, rate: mainRecovered / TOTAL },
        credit: {
            valid: creditValid,
            total: totalCredit,
            used,
            left: totalCredit - used,
            over: used > totalCredit,
            shortfall,
            items,
            gross: creditGross,
            net: creditNet,
            rate: creditNet / TOTAL,
        },
        totalRecovered,
        totalRate: totalRecovered / TOTAL,
        cost,
        monthly: cost / 3,
        errors: {
            main: mainValid
                ? ""
                : "아이템 가격과 메소는 0보다 크게, 현금 판매 시세는 0 이상으로 입력해 주세요.",
            credit: !rateValid
                ? "크레딧 적립률은 0~100% 사이로 입력해 주세요."
                : creditValid
                  ? ""
                  : "가격·개수·판매가는 0 이상 숫자로 입력해 주세요. 계산에서 빠진 줄이 있어요.",
        },
    };
}

/* ---------- 표시 ---------- */

export const fmt = (n: number, d = 0) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: d }).format(n);
export const won = (n: number) => `${fmt(Math.round(n))}원`;
export const pct = (r: number) => `${fmt(r * 100, 2)}%`;
