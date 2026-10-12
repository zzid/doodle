import { INCOME_TAX_AT_10M, INCOME_TAX_ROWS } from "./incomeTaxTable";

/**
 * 월 실수령액 추정.
 *
 * 공제 기준
 * - 국민연금:   기준소득월액(상·하한 적용) × 근로자 요율. 기준소득월액은 신고된 고정 보수라
 *               초과수당이 들어와도 그 달 보험료는 바뀌지 않는다 → 기본급(과세분) 기준.
 * - 건강보험:   보수월액 × 근로자 요율. 역시 신고 보수 기준(초과수당은 다음 해 연말정산에서 정산).
 * - 장기요양:   건강보험료 × (장기요양보험료율 ÷ 건강보험료율)
 * - 고용보험:   그 달 실제 지급 보수(초과수당 포함) × 0.9%
 * - 소득세:     근로소득 간이세액표(2026.3 개정) 금액 − 8~20세 자녀 공제, × 원천징수 비율(80/100/120%)
 * - 지방소득세: 소득세 × 10%
 * 모든 공제액은 10원 미만 절사.
 */

interface InsuranceRates {
    /** 적용 시작 "YYYY-MM" */
    from: string;
    pension: number;
    pensionMin: number;
    pensionMax: number;
    health: number;
    /** 장기요양보험료율 ÷ 건강보험료율 */
    careOfHealth: number;
    employment: number;
}

/** 근로자 부담분. 최신이 맨 뒤 */
const RATES: InsuranceRates[] = [
    {
        from: "2025-01",
        pension: 0.045,
        pensionMin: 390_000,
        pensionMax: 6_170_000,
        health: 0.03545,
        careOfHealth: 0.009182 / 0.0709,
        employment: 0.009,
    },
    {
        from: "2025-07",
        pension: 0.045,
        pensionMin: 400_000,
        pensionMax: 6_370_000,
        health: 0.03545,
        careOfHealth: 0.009182 / 0.0709,
        employment: 0.009,
    },
    {
        from: "2026-01",
        pension: 0.0475,
        pensionMin: 400_000,
        pensionMax: 6_370_000,
        health: 0.03595,
        careOfHealth: 0.009448 / 0.0719,
        employment: 0.009,
    },
    {
        from: "2026-07",
        pension: 0.0475,
        pensionMin: 410_000,
        pensionMax: 6_590_000,
        health: 0.03595,
        careOfHealth: 0.009448 / 0.0719,
        employment: 0.009,
    },
];

export const ratesFor = (month: string): InsuranceRates =>
    [...RATES].reverse().find((r) => r.from <= month) ?? RATES[0];

const floor10 = (n: number) => Math.max(0, Math.floor(n / 10) * 10);

/** 간이세액표 세액 (가족 1~11명) */
export function tableIncomeTax(monthlyTaxable: number, family: number): number {
    const f = Math.min(11, Math.max(1, Math.round(family)));
    const k = monthlyTaxable / 1000; // 천원
    if (k < INCOME_TAX_ROWS[0][0]) return 0;
    if (k < 10_000) {
        const row = INCOME_TAX_ROWS.find((r) => r[0] <= k && k < r[1]);
        return row ? row[1 + f] : 0;
    }
    const base = INCOME_TAX_AT_10M[f - 1];
    const won = monthlyTaxable;
    if (won <= 14_000_000) return base + (won - 10_000_000) * 0.98 * 0.35 + 25_000;
    if (won <= 28_000_000) return base + 1_397_000 + (won - 14_000_000) * 0.98 * 0.38;
    if (won <= 30_000_000) return base + 6_610_600 + (won - 28_000_000) * 0.98 * 0.4;
    if (won <= 45_000_000) return base + 7_394_600 + (won - 30_000_000) * 0.4;
    if (won <= 87_000_000) return base + 13_394_600 + (won - 45_000_000) * 0.42;
    return base + 31_034_600 + (won - 87_000_000) * 0.45;
}

/** 8세 이상 20세 이하 자녀 세액공제(월) */
export function childTaxCredit(children: number): number {
    const c = Math.max(0, Math.round(children));
    if (c === 0) return 0;
    if (c === 1) return 20_830;
    return 45_830 + (c - 2) * 33_330;
}

export interface PayrollInput {
    /** 지급월 "YYYY-MM" (요율 선택용) */
    month: string;
    /** 세전 월 기본급 (비과세 포함) */
    basePay: number;
    /** 이번 달 지급 초과수당 */
    overtimePay: number;
    /** 월 비과세액 (식대 등) */
    nonTaxable: number;
    /** 공제대상 가족 수 (본인 포함) */
    family: number;
    /** 8~20세 자녀 수 */
    children: number;
    /** 원천징수 비율 0.8 / 1 / 1.2 */
    withholdingRatio: number;
}

export interface Payroll {
    gross: number;
    taxable: number;
    pension: number;
    pensionBase: number;
    health: number;
    care: number;
    employment: number;
    incomeTax: number;
    localTax: number;
    totalDeduction: number;
    net: number;
    rates: InsuranceRates;
}

export function calcPayroll(i: PayrollInput): Payroll {
    const rates = ratesFor(i.month);
    const nonTaxable = Math.min(i.nonTaxable, i.basePay);
    const baseTaxable = Math.max(0, i.basePay - nonTaxable);
    const taxable = baseTaxable + i.overtimePay;
    const gross = i.basePay + i.overtimePay;

    const pensionBase = Math.min(rates.pensionMax, Math.max(rates.pensionMin, baseTaxable));
    const pension = baseTaxable > 0 ? floor10(pensionBase * rates.pension) : 0;
    const health = floor10(baseTaxable * rates.health);
    const care = floor10(health * rates.careOfHealth);
    const employment = floor10(taxable * rates.employment);

    const tax = Math.max(0, tableIncomeTax(taxable, i.family) - childTaxCredit(i.children));
    const incomeTax = floor10(tax * i.withholdingRatio);
    const localTax = floor10(incomeTax * 0.1);

    const totalDeduction = pension + health + care + employment + incomeTax + localTax;
    return {
        gross,
        taxable,
        pension,
        pensionBase,
        health,
        care,
        employment,
        incomeTax,
        localTax,
        totalDeduction,
        net: gross - totalDeduction,
        rates,
    };
}
