'use client';

import useLanguage from '@/hooks/useLanguage';

export default function DisclaimerFooter() {
    const { lang } = useLanguage();

    return (
        <footer className="w-full py-6 px-4 mt-auto border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-white/40 text-xs leading-relaxed">
                    {lang === 'en' ? (
                        <>
                            Gallup®, CliftonStrengths®, and the 34 theme names are trademarks of Gallup, Inc.
                            <br />
                            This product is not affiliated with or endorsed by Gallup, Inc.
                        </>
                    ) : (
                        <>
                            Gallup®, CliftonStrengths® 및 34개 테마 명칭은 Gallup, Inc.의 상표입니다.
                            <br />
                            본 서비스는 Gallup, Inc.와 제휴하거나 보증받지 않았습니다.
                        </>
                    )}
                </p>
            </div>
        </footer>
    );
}
