import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "StrengthsNavigator | 강점 코치의 마음을 전하는 카드",
    description: "당신의 강점을 발견하고, 진심을 담은 메시지로 특별한 순간을 선물하세요. 강점 코치와 함께하는 개인화 카드 플랫폼",
    keywords: ["강점 코치", "신년 카드", "개인화 카드", "갤럽 강점", "StrengthsFinder"],
    openGraph: {
        title: "StrengthsNavigator | 강점 코치의 마음을 전하는 카드",
        description: "당신의 강점을 발견하고, 진심을 담은 메시지로 특별한 순간을 선물하세요.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
