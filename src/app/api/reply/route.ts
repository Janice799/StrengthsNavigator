import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import coachProfile from '@/config/coach_profile.json';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cardId, recipientName, message } = body;

        // 1. Supabase에 답장 저장
        // 클라이언트 사이드 로직을 서버로 이동
        const replyData = {
            card_id: cardId,
            recipient_name: recipientName,
            message: message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        if (supabase) {
            const { error } = await supabase
                .from('card_replies')
                .insert([replyData]);

            if (error) throw error;
        }

        // 2. 이메일 발송 (환경변수가 설정된 경우에만)
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Gmail 사용 예시
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });

            const mailOptions = {
                from: emailUser,
                to: coachProfile.email || emailUser, // 코치 이메일로 발송
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
        } else {
            console.warn('⚠️ 이메일 환경변수(EMAIL_USER, EMAIL_PASS)가 없어 알림을 보내지 못했습니다.');
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('답장 처리 오류:', error);
        return NextResponse.json({ success: false, error: 'Failed to process reply' }, { status: 500 });
    }
}
