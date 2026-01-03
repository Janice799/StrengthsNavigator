import { Metadata } from 'next';

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: 'StrengthsNavigator | 강점 카드',
        description: '강점 코치의 마음을 전하는 카드가 도착했어요!',
        openGraph: {
            title: 'StrengthsNavigator | 강점 코치의 마음을 전하는 카드',
            description: '당신을 위한 강점 카드가 도착했어요! 긁어서 확인해보세요 ✨',
            siteName: 'StrengthsNavigator',
            type: 'website',
            url: `https://strengths-navigator.vercel.app/c/${params.id}`,
            images: [
                {
                    url: `https://strengths-navigator.vercel.app/api/og?id=${params.id}`,
                    width: 1200,
                    height: 630,
                    alt: 'StrengthsNavigator Card',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'StrengthsNavigator | 강점 카드',
            description: '당신을 위한 강점 카드가 도착했어요!',
            images: [`https://strengths-navigator.vercel.app/api/og?id=${params.id}`],
        },
    };
}

export default function CardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
