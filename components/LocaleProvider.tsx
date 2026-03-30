"use client";

import React, { createContext, useContext } from "react";
import type { Locale, T } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  t: T;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  t: locales.en,
});

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <LocaleContext.Provider
      value={{ locale: initialLocale, t: locales[initialLocale] }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export const useT = () => useContext(LocaleContext).t;
export const useLocale = () => useContext(LocaleContext).locale;
