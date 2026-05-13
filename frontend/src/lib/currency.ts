
const RATES = {
  THB: 1,
  USD: 0.028, 
};

export type CurrencyCode = 'THB' | 'USD';

export function convertFromTHB(amountTHB: number, to: CurrencyCode): number {
  const r = RATES[to] ?? 1;
  return amountTHB * r;
}

export function formatCurrency(amount: number, currency: CurrencyCode) {
 
  const locale = currency === 'THB' ? 'th-TH' : 'en-US';
  const code = currency === 'THB' ? 'THB' : 'USD';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
}
