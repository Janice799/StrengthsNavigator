import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import nodemailer from 'nodemailer';
import coachProfile from '@/config/coach_profile.json';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cardId, recipientName, message } = body;

        // 서버사이드 Supabase 클라이언트 생성
        const supabase = createClient();

        // 카드에서 coach_id 가져오기
        let coachId = null;
        if (cardId) {
            const { data: cardData } = await supabase
                .from('sent_cards')
                .select('coach_id')
                .eq('id', cardId)
                .single();
            coachId = cardData?.coach_id || null;
        }

        // Supabase에 답장 저장
        const replyData = {
            card_id: cardId || null,
            coach_id: coachId,
            recipient_name: recipientName,
            message: message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('card_replies')
            .insert([replyData]);

        if (error) {
            console.error('Supabase 저장 오류:', error);
            throw error;
        }

        // 2. 이메일 발송 (환경변수가 설정된 경우에만, 실패해도 답장은 저장됨)
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (emailUser && emailPass && emailPass !== '1234 1234 1234 1234') {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                });

                const mailOptions = {
                    from: emailUser,
                    to: coachProfile.email || emailUser,
                    subject: `[StrengthsNavigator] ${recipientName}님이 답장을 보냈습니다 💌`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #d4af37;">새로운 답장이 도착했습니다! 🎉</h2>
                            <p style="color: #555;"><strong>${recipientName}</strong>님이 보내신 메시지:</p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="white-space: pre-wrap; color: #333;">${message}</p>
                            </div>
                            <p style="color: #999; font-size: 12px;">대시보드에서 전체 답장을 확인할 수 있습니다.</p>
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #333; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">대시보드로 이동</a>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
                console.log('✉️ 이메일 알림 발송 성공');
            } catch (emailError) {
                console.warn('⚠️ 이메일 발송 실패 (답장은 저장됨):', emailError);
                // 이메일 실패해도 답장 저장은 성공이므로 에러를 던지지 않음
            }
        } else {
            console.warn('⚠️ 이메일 환경변수가 올바르지 않아 알림을 보내지 못했습니다.');
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('답장 처리 오류:', error);
        return NextResponse.json({ success: false, error: 'Failed to process reply' }, { status: 500 });
    }
}
