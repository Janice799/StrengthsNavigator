import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 강점 정보
const STRENGTHS: Record<string, { name: string; emoji: string }> = {
    'achiever': { name: '성취', emoji: '🏆' },
    'activator': { name: '활성화', emoji: '⚡' },
    'learner': { name: '학습', emoji: '📖' },
    'strategic': { name: '전략', emoji: '♟️' },
    'communication': { name: '커뮤니케이션', emoji: '💬' },
    'empathy': { name: '공감', emoji: '💝' },
    'positivity': { name: '긍정', emoji: '😊' },
    'developer': { name: '성장촉진', emoji: '🌱' },
    'focus': { name: '집중', emoji: '🎯' },
    'responsibility': { name: '책임', emoji: '✓' },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || '소중한 분';
    const strength = searchParams.get('strength') || '';
    const strengthInfo = STRENGTHS[strength] || { name: '강점', emoji: '💪' };

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c1a2b 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* 배경 장식 */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        opacity: 0.3,
                    }}
                >
                    {/* 별 패턴 */}
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 37) % 100}%`,
                                top: `${(i * 23) % 100}%`,
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'white',
                            }}
                        />
                    ))}
                </div>

                {/* 로고 */}
                <div
                    style={{
                        position: 'absolute',
                        top: 40,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 28,
                            color: '#d4af37',
                            fontWeight: 'bold',
                            letterSpacing: 2,
                        }}
                    >
                        StrengthsNavigator
                    </div>
                </div>

                {/* 메인 카드 */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 60,
                        background: 'linear-gradient(145deg, rgba(20, 40, 70, 0.9), rgba(10, 20, 40, 0.95))',
                        borderRadius: 30,
                        border: '2px solid rgba(212, 175, 55, 0.5)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.2)',
                        maxWidth: 900,
                    }}
                >
                    {/* 선물 아이콘 */}
                    <div style={{ fontSize: 80, marginBottom: 20 }}>🎁</div>

                    {/* 메시지 */}
                    <div
                        style={{
                            fontSize: 36,
                            color: 'white',
                            textAlign: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <span style={{ color: '#d4af37' }}>{name}</span>
                        님께
                    </div>
                    <div
                        style={{
                            fontSize: 42,
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: 30,
                        }}
                    >
                        강점 카드가 도착했어요! 💌
                    </div>

                    {/* 강점 배지 */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '15px 30px',
                            background: 'rgba(212, 175, 55, 0.2)',
                            border: '1px solid rgba(212, 175, 55, 0.5)',
                            borderRadius: 50,
                        }}
                    >
                        <span style={{ fontSize: 32 }}>{strengthInfo.emoji}</span>
                        <span style={{ fontSize: 24, color: '#d4af37' }}>{strengthInfo.name}</span>
                    </div>

                    {/* 안내 */}
                    <div
                        style={{
                            fontSize: 22,
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: 30,
                        }}
                    >
                        ✨ 긁어서 확인하세요 ✨
                    </div>
                </div>

                {/* 하단 */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 18,
                        color: 'rgba(255, 255, 255, 0.4)',
                    }}
                >
                    강점 코칭과 진심이 만나는 곳
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
