'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SnowEffect from '@/components/effects/SnowEffect';
import StarsEffect from '@/components/effects/StarsEffect';
import OccasionSelector from '@/components/ui/OccasionSelector';
import ArchetypeSelector from '@/components/ui/ArchetypeSelector';
import StrengthSelector from '@/components/ui/StrengthSelector';
import CardPreview from '@/components/card/CardPreview';
import CoachProfile from '@/components/ui/CoachProfile';
import { coachProfile } from '@/config/coach';
import { Occasion } from '@/lib/occasions';
import { Archetype } from '@/lib/archetypes';
import { Strength, strengths } from '@/lib/strengths';
import { CardData, encodeCardData, validateCardData } from '@/lib/cardEncoder';
import { saveClient, getClients, saveCardHistory } from '@/lib/clientStorage';
import { triggerCelebration } from '@/components/effects/FireworksEffect';

type Step = 'occasion' | 'recipient' | 'type' | 'archetype' | 'strength' | 'message' | 'preview';

export default function CreatePage() {
    const [step, setStep] = useState<Step>('occasion');
    const [showAllOccasions, setShowAllOccasions] = useState(false);
    const [useStrength, setUseStrength] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [openMode, setOpenMode] = useState<'envelope' | 'scratch'>('envelope');

    const [cardData, setCardData] = useState<Partial<CardData>>({
        lang: 'ko',
        senderName: coachProfile.name
    });

    const [selectedStrengthIds, setSelectedStrengthIds] = useState<string[]>([]);
    const [existingClients, setExistingClients] = useState<string[]>([]);

    useEffect(() => {
        const clients = getClients();
        setExistingClients(clients.map(c => c.name));
    }, []);

    const handleOccasionSelect = (occasion: Occasion) => {
        setCardData(prev => ({ ...prev, occasionId: occasion.id }));
        setStep('recipient');
    };

    const handleArchetypeSelect = (archetype: Archetype) => {
        setCardData(prev => ({ ...prev, archetypeId: archetype.id, strengthId: undefined }));
    };

    const handleStrengthSelect = (strength: Strength) => {
        setSelectedStrengthIds(prev => [...prev, strength.id]);
        if (selectedStrengthIds.length === 0) {
            setCardData(prev => ({ ...prev, strengthId: strength.id, archetypeId: undefined }));
        }
    };

    const handleStrengthDeselect = (strengthId: string) => {
        setSelectedStrengthIds(prev => prev.filter(id => id !== strengthId));
        if (cardData.strengthId === strengthId) {
            const remaining = selectedStrengthIds.filter(id => id !== strengthId);
            setCardData(prev => ({ ...prev, strengthId: remaining[0] || undefined }));
        }
    };

    const generateShareUrl = useCallback(() => {
        const errors = validateCardData(cardData);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        const fullData: CardData = {
            recipientName: cardData.recipientName || '',
            senderName: cardData.senderName || coachProfile.name,
            occasionId: cardData.occasionId || 'new-year',
            archetypeId: cardData.archetypeId,
            strengthId: cardData.strengthId,
            situation: cardData.situation || '',
            personalMessage: cardData.personalMessage || '',
            lang: cardData.lang || 'ko',
            createdAt: new Date().toISOString(),
            // 코치 정보 포함
            coach: {
                name: coachProfile.name,
                title: coachProfile.title,
                introduction: coachProfile.introduction,
                contact: {
                    email: coachProfile.contact.email,
                    instagram: coachProfile.contact.instagram,
                    kakao: coachProfile.contact.kakao
                }
            }
        };

        const encoded = encodeCardData(fullData);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const modeParam = openMode === 'scratch' ? '&mode=scratch' : '';
        const url = `${baseUrl}/card?data=${encoded}${modeParam}`;
        setShareUrl(url);

        // 클라이언트 & 기록 저장
        saveClient({
            name: fullData.recipientName,
            strengthIds: selectedStrengthIds,
            archetypeId: fullData.archetypeId,
            notes: fullData.situation
        });

        saveCardHistory({
            clientId: fullData.recipientName,
            occasionId: fullData.occasionId,
            archetypeId: fullData.archetypeId,
            strengthId: fullData.strengthId,
            situation: fullData.situation,
            message: fullData.personalMessage,
            sharedUrl: url
        });

        triggerCelebration();
    }, [cardData, selectedStrengthIds, openMode]);

    const copyToClipboard = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    const stepTitles: Record<Step, string> = {
        occasion: '상황 선택',
        recipient: '수신자 정보',
        type: '메시지 타입',
        archetype: '원형 선택',
        strength: '강점 선택',
        message: '메시지 작성',
        preview: '카드 완성'
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 'occasion': return !!cardData.occasionId;
            case 'recipient': return !!cardData.recipientName?.trim();
            case 'type': return true;
            case 'archetype': return !!cardData.archetypeId;
            case 'strength': return !!cardData.strengthId;
            case 'message': return true;
            default: return true;
        }
    };

    const nextStep = () => {
        const steps: Step[] = ['occasion', 'recipient', 'type', useStrength ? 'strength' : 'archetype', 'message', 'preview'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const steps: Step[] = ['occasion', 'recipient', 'type', useStrength ? 'strength' : 'archetype', 'message', 'preview'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };

    return (
        <main className="min-h-screen relative">
            <StarsEffect count={50} />
            <SnowEffect count={80} />

            <div className="relative z-10 min-h-screen py-8 px-4">
                {/* 헤더 */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                            ← 홈으로
                        </Link>
                        <CoachProfile compact />
                    </div>

                    {/* 진행 상태 */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                            <span>{stepTitles[step]}</span>
                            <span>{Object.keys(stepTitles).indexOf(step) + 1} / {Object.keys(stepTitles).length}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gold-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((Object.keys(stepTitles).indexOf(step) + 1) / Object.keys(stepTitles).length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: 상황 선택 */}
                        {step === 'occasion' && (
                            <motion.div key="occasion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <OccasionSelector
                                    selectedId={cardData.occasionId || null}
                                    onSelect={handleOccasionSelect}
                                    showAll={showAllOccasions}
                                />
                                <button
                                    className="mt-4 text-sm text-gold-400 hover:text-gold-300 whitespace-nowrap"
                                    onClick={() => setShowAllOccasions(!showAllOccasions)}
                                >
                                    {showAllOccasions ? '간략히 보기' : '+ 더 많은 상황 보기'}
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: 수신자 정보 */}
                        {step === 'recipient' && (
                            <motion.div key="recipient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <label className="block text-white/80 mb-2">수신자 이름</label>
                                    <input
                                        type="text"
                                        value={cardData.recipientName || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, recipientName: e.target.value }))}
                                        placeholder="받으실 분의 이름을 입력하세요"
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                                        list="existing-clients"
                                    />
                                    <datalist id="existing-clients">
                                        {existingClients.map(name => <option key={name} value={name} />)}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2">상황 설명 (선택)</label>
                                    <textarea
                                        value={cardData.situation || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, situation: e.target.value }))}
                                        placeholder="수신자의 현재 상황이나 코칭 포인트를 입력하세요 (예: 최근 팀장 승진, 리더십에 대한 고민 중)"
                                        rows={3}
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: 메시지 타입 선택 */}
                        {step === 'type' && (
                            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="text-lg font-semibold text-white/90">어떤 메시지를 보내시겠어요?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.button
                                        onClick={() => { setUseStrength(false); setStep('archetype'); }}
                                        className="glass rounded-xl p-6 text-left hover:bg-white/10 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-4xl mb-4 block">🎭</span>
                                        <h4 className="text-lg font-medium text-white mb-2">원형 기반</h4>
                                        <p className="text-sm text-white/60">융의 12가지 원형으로 수신자의 본질을 표현합니다</p>
                                    </motion.button>
                                    <motion.button
                                        onClick={() => { setUseStrength(true); setStep('strength'); }}
                                        className="glass rounded-xl p-6 text-left hover:bg-white/10 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-4xl mb-4 block">💪</span>
                                        <h4 className="text-lg font-medium text-white mb-2">강점 기반</h4>
                                        <p className="text-sm text-white/60">갤럽 34가지 강점으로 수신자를 응원합니다</p>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4a: 원형 선택 */}
                        {step === 'archetype' && (
                            <motion.div key="archetype" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <ArchetypeSelector
                                    selectedId={cardData.archetypeId || null}
                                    onSelect={handleArchetypeSelect}
                                    lang={cardData.lang}
                                />
                            </motion.div>
                        )}

                        {/* Step 4b: 강점 선택 */}
                        {step === 'strength' && (
                            <motion.div key="strength" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <StrengthSelector
                                    selectedIds={selectedStrengthIds}
                                    onSelect={handleStrengthSelect}
                                    onDeselect={handleStrengthDeselect}
                                    maxSelections={5}
                                    lang={cardData.lang}
                                />
                                {selectedStrengthIds.length > 0 && (
                                    <div className="mt-4">
                                        <label className="block text-white/80 mb-2">카드에 표시할 대표 강점</label>
                                        <select
                                            value={cardData.strengthId || ''}
                                            onChange={(e) => setCardData(prev => ({ ...prev, strengthId: e.target.value }))}
                                            className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-400/50 bg-transparent"
                                        >
                                            {selectedStrengthIds.map(id => {
                                                const s = strengths.find(x => x.id === id);
                                                return <option key={id} value={id} className="bg-ocean-800">{s?.icon} {s?.name.ko}</option>;
                                            })}
                                        </select>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 5: 메시지 작성 */}
                        {step === 'message' && (
                            <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <label className="block text-white/80 mb-2">개인 메시지 (선택)</label>
                                    <textarea
                                        value={cardData.personalMessage || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, personalMessage: e.target.value }))}
                                        placeholder="코치로서 전하고 싶은 개인적인 메시지를 작성하세요"
                                        rows={5}
                                        maxLength={500}
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1 text-right">
                                        {(cardData.personalMessage || '').length}/500
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2">발신자 이름</label>
                                    <input
                                        type="text"
                                        value={cardData.senderName || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, senderName: e.target.value }))}
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: 미리보기 & 공유 */}
                        {step === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <CardPreview data={cardData} />

                                {!shareUrl ? (
                                    <div className="space-y-6">
                                        {/* 카드 열기 방식 선택 */}
                                        <div className="glass rounded-xl p-4">
                                            <label className="block text-white/80 mb-3 text-sm">카드 열기 방식</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setOpenMode('envelope')}
                                                    className={`p-4 rounded-xl text-center transition-all ${openMode === 'envelope'
                                                            ? 'bg-gold-500/20 border-2 border-gold-400 text-gold-400'
                                                            : 'glass border border-white/10 text-white/70 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className="text-2xl block mb-1">✉️</span>
                                                    <span className="text-sm font-medium">봉투 클릭</span>
                                                    <p className="text-xs mt-1 opacity-60">클릭하면 카드 공개</p>
                                                </button>
                                                <button
                                                    onClick={() => setOpenMode('scratch')}
                                                    className={`p-4 rounded-xl text-center transition-all ${openMode === 'scratch'
                                                            ? 'bg-gold-500/20 border-2 border-gold-400 text-gold-400'
                                                            : 'glass border border-white/10 text-white/70 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className="text-2xl block mb-1">🎫</span>
                                                    <span className="text-sm font-medium">스크래치</span>
                                                    <p className="text-xs mt-1 opacity-60">긁으면 카드 공개</p>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <motion.button
                                                onClick={generateShareUrl}
                                                className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl shadow-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                🎉 카드 생성하기
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        className="glass rounded-xl p-6 space-y-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gold-400 text-center">🎊 카드가 생성되었습니다!</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={shareUrl}
                                                className="flex-1 px-4 py-3 glass rounded-xl text-white/80 text-sm truncate"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="px-4 py-3 bg-gold-500 text-ocean-900 font-medium rounded-xl hover:bg-gold-400 transition-colors"
                                            >
                                                {copied ? '✓ 복사됨' : '복사'}
                                            </button>
                                        </div>
                                        <p className="text-center text-white/60 text-sm">
                                            이 링크를 수신자에게 공유하세요!
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 네비게이션 버튼 */}
                    {step !== 'occasion' && !shareUrl && (
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 glass rounded-xl text-white hover:bg-white/15 transition-colors"
                            >
                                ← 이전
                            </button>
                            {step !== 'preview' && (
                                <button
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${canProceed()
                                        ? 'bg-gold-500 text-ocean-900 hover:bg-gold-400'
                                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                                        }`}
                                >
                                    다음 →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
