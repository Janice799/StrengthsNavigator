import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI 상황 자동완성
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { partialText, occasionId, recipientName, strengthId } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API 키가 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `당신은 강점 코칭 전문가입니다. 코치가 클라이언트의 상황을 설명할 때 도움이 되는 짧은 문장을 완성해주세요.
자연스럽고 전문적인 코칭 언어를 사용하세요.
한 문장으로 간결하게 완성해주세요.`
        });

        const prompt = `
코치가 클라이언트 상황을 설명하고 있습니다.

상황: ${occasionId || '일반'}
수신자: ${recipientName || '클라이언트'}
${strengthId ? `강점: ${strengthId}` : ''}

코치가 입력한 내용: "${partialText}"

위 내용을 자연스럽게 완성해주세요. 완성된 전체 문장만 출력하세요.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const completedText = response.text().trim();

        return NextResponse.json({
            completion: completedText
        });
    } catch (error) {
        console.error('상황 자동완성 오류:', error);
        return NextResponse.json(
            { error: 'AI 자동완성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
