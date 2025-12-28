'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18n from '@/config/i18n.json';

type Language = 'ko' | 'en';
type I18nData = typeof i18n.ko;

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    toggleLang: () => void;
    t: I18nData;
    mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 브라우저 언어 감지
function detectBrowserLanguage(): Language {
    if (typeof window === 'undefined') return 'ko';

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    return 'ko';
}

// URL에서 언어 파라미터 가져오기
function getLanguageFromUrl(): Language | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'ko') return lang;
    return null;
}

// 언어 Provider
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>('ko');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 우선순위: URL 파라미터 > localStorage > 브라우저 설정
        const urlLang = getLanguageFromUrl();
        const storedLang = localStorage.getItem('language') as Language | null;
        const detectedLang = detectBrowserLanguage();

        const finalLang = urlLang || storedLang || detectedLang;
        setLangState(finalLang);
    }, []);

    const setLang = useCallback((newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('language', newLang);
    }, []);

    const toggleLang = useCallback(() => {
        const newLang = lang === 'ko' ? 'en' : 'ko';
        setLang(newLang);
    }, [lang, setLang]);

    const t = (i18n as Record<Language, I18nData>)[lang];

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

// 언어 Hook - Context에서 가져옴
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        // Context 외부에서 사용될 경우 fallback
        const [lang, setLangState] = useState<Language>('ko');
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);
            const storedLang = localStorage.getItem('language') as Language | null;
            if (storedLang) setLangState(storedLang);
        }, []);

        const setLang = useCallback((newLang: Language) => {
            setLangState(newLang);
            localStorage.setItem('language', newLang);
        }, []);

        const toggleLang = useCallback(() => {
            const newLang = lang === 'ko' ? 'en' : 'ko';
            setLang(newLang);
        }, [lang, setLang]);

        const t = (i18n as Record<Language, I18nData>)[lang];
        return { lang, setLang, toggleLang, t, mounted };
    }
    return context;
}

// 언어 전환 버튼 컴포넌트
export function LanguageToggle({ className = '' }: { className?: string }) {
    const { lang, toggleLang, mounted } = useLanguage();

    if (!mounted) return null;

    return (
        <button
            onClick={toggleLang}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${className}`}
            title={lang === 'ko' ? 'Switch to English' : '한국어로 변경'}
        >
            {lang === 'ko' ? '🇺🇸 EN' : '🇰🇷 KO'}
        </button>
    );
}

export default useLanguage;
