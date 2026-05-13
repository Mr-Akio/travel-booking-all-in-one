'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { convertFromTHB, formatCurrency, type CurrencyCode } from '@/lib/currency';

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  priceFromTHB: (amountTHB: number) => number;
  formatFromTHB: (amountTHB: number) => string;
  format: (amountTHB: number) => string; 
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('THB');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('currency')) as CurrencyCode | null;
    if (saved === 'THB' || saved === 'USD') setCurrencyState(saved);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') localStorage.setItem('currency', c);
  };

  const value = useMemo<Ctx>(() => {
    const priceFromTHB = (amt: number) => convertFromTHB(amt, currency);
    const formatFromTHB = (amt: number) => formatCurrency(priceFromTHB(amt), currency);
    return {
      currency,
      setCurrency,
      priceFromTHB,
      formatFromTHB,
      format: formatFromTHB, 
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
}
