const TOTAL = 2500000, NET = 0.97;
const fmt = (n: number, d = 0) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: d }).format(n);
const won = (n: number) => fmt(n) + '원';
export const defaults = {
    "cash": "54000",
    "meso": "26",
    "sell": "1500",
    "credit-rate": "5",
    "flga-price": "5900",
    "credit-use": "30",
    "flga-meso": "3"
};
export type Inputs = typeof defaults;
export function calculate(values: Inputs) {
    const results: Record<string, string> = {};
    let mainError = '', flgaError = '', negative = false;
    const number = (id: keyof Inputs) => values[id].trim() === '' ? NaN : Number(values[id]);
    const put = (id: string, value: string) => { results[id] = value; };
    const cash = number('cash'), meso = number('meso'), sell = number('sell');
    const validSell = Number.isFinite(sell) && sell >= 0;
    const net = meso * NET, buy = cash / net, rate = sell / buy, recovered = TOTAL * rate;
    const mainValid = Number.isFinite(cash) && cash > 0 && Number.isFinite(meso) && meso > 0 && validSell && [net, buy, rate, recovered].every(Number.isFinite) && net > 0 && buy > 0;
    mainError = (mainValid ? '' : '아이템 가격과 메소는 0보다 크게, 현금 판매 시세는 0 이상으로 입력해 주세요. 계산 가능한 범위의 값을 사용해 주세요.');
    if (mainValid) {
        put('rate', fmt(rate * 100, 2) + '%');
        put('net-meso', fmt(net, 4) + '억 메소');
        put('buy-price', fmt(buy, 2) + '원 / 억');
        put('recovered', won(recovered));
        put('cost', won(TOTAL - recovered));
        put('monthly', won((TOTAL - recovered) / 3));
    }
    const accrual = number('credit-rate'), price = number('flga-price'), use = number('credit-use'), flgaMeso = number('flga-meso');
    const totalCredit = TOTAL * accrual / 100, each = price * use / 100, count = Math.floor(totalCredit / each), cashCost = count * (price - each), netMeso = count * flgaMeso * NET, flgaRecovered = netMeso * sell, netRecovered = flgaRecovered - cashCost;
    const flgaValid = [accrual, price, use, flgaMeso].every(Number.isFinite) && accrual >= 0 && accrual <= 100 && price > 0 && use > 0 && use <= 100 && flgaMeso >= 0 && validSell && each > 0 && Number.isSafeInteger(count) && [totalCredit, each, cashCost, netMeso, flgaRecovered, netRecovered].every(Number.isFinite);
    flgaError = (flgaValid ? '' : '적립률은 0~100%, 크레딧 사용비율은 0 초과~100%, 가격은 0 초과, 판매시세는 0 이상으로 입력해 주세요. 메인 카드의 현금 시세도 확인해 주세요.');
    if (flgaValid) {
        put('flga-net', won(netRecovered));
        negative = netRecovered < 0;
        put('credit-total', fmt(totalCredit, 2) + ' 크레딧');
        put('credit-each', fmt(each, 2) + ' 크레딧');
        put('flga-count', fmt(count) + '개');
        put('flga-cash', fmt(cashCost) + ' 캐시');
        put('flga-net-meso', fmt(netMeso, 4) + '억 메소');
        put('flga-recovered', won(flgaRecovered));
        put('credit-left', fmt(Math.max(0, totalCredit - count * each), 2) + ' 크레딧');
    }
    return { results, mainError, flgaError, negative };
}
