import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedMessage, generateMessageOptions, CoachPersona } from '@/lib/messageEngine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            recipientName,
            occasionId,
            strengthId,
            archetypeId,
            situation,
            persona,
            coachName,
            generateOptions = false
        } = body;

        // 필수 필드 검증
        if (!recipientName || !occasionId) {
            return NextResponse.json(
                { error: '수신자 이름과 상황은 필수입니다.' },
                { status: 400 }
            );
        }

        if (generateOptions) {
            // 3가지 페르소나별 옵션 생성
            const options = await generateMessageOptions({
                recipientName,
                occasionId,
                strengthId,
                archetypeId,
                situation,
                coachName
            }, 3);

            return NextResponse.json({ options });
        } else {
            // 단일 메시지 생성
            const result = await generatePersonalizedMessage({
                recipientName,
                occasionId,
                strengthId,
                archetypeId,
                situation,
                persona: persona as CoachPersona,
                coachName
            });

            return NextResponse.json(result);
        }
    } catch (error) {
        console.error('메시지 생성 오류:', error);
        return NextResponse.json(
            { error: 'AI 메시지 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
