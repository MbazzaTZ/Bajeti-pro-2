import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Currency = "USD" | "TZS" | "UGX" | "KES" | "GBP";

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: Record<Currency, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", locale: "sw-TZ" },
  UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling", locale: "en-UG" },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "en-KE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("ji-bajeti-currency");
    return (saved as Currency) || "USD";
  });

  useEffect(() => {
    localStorage.setItem("ji-bajeti-currency", currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const formatAmount = (amount: number): string => {
    const config = currencies[currency];
    const absAmount = Math.abs(amount);
    
    // Format number with commas
    const formatted = absAmount.toLocaleString(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `${config.symbol}${formatted}`;
  };

  const getCurrencySymbol = (): string => {
    return currencies[currency].symbol;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
