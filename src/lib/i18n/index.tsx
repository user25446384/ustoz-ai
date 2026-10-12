'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import uz from './messages/uz.json';
import { format, lookup } from './messages-core';

type Dict = typeof uz;
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Dict>;
export type Locale = 'uz';
export const DICTIONARIES: Record<Locale, Dict> = { uz };

/** Dinamik kalitlar uchun (xato kodlari, zod xabarlari): topilmasa `fallback`, u ham bo'lmasa kalitning o'zi. */
export type TranslateLoose = (key: string, fallback?: string) => string;

interface I18n { locale: Locale; t: (key: MessageKey, vars?: Record<string, string | number>) => string; te: TranslateLoose }

const make = (locale: Locale): I18n => {
  const dict = DICTIONARIES[locale];
  return {
    locale,
    t: (key, vars) => format(lookup(dict, key) ?? key, vars),
    te: (key, fallback) => lookup(dict, key) ?? fallback ?? key,
  };
};

const Ctx = createContext<I18n>(make('uz'));

export function I18nProvider({ children, locale = 'uz' }: { children: ReactNode; locale?: Locale }) {
  const value = useMemo(() => make(locale), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
