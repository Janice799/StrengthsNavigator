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
import { getTemplatesForOccasion, SituationTemplate } from '@/lib/situationTemplates';
import BackgroundSelector from '@/components/ui/BackgroundSelector';
import { CardBackground, getBackgroundById } from '@/lib/cardBackgrounds';

type Step = 'occasion' | 'recipient' | 'type' | 'archetype' | 'strength' | 'background' | 'message' | 'preview';

export default function CreatePage() {
    const [step, setStep] = useState<Step>('occasion');
    const [showAllOccasions, setShowAllOccasions] = useState(false);
    const [useStrength, setUseStrength] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [openMode, setOpenMode] = useState<'envelope' | 'scratch'>('envelope');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiOptions, setAiOptions] = useState<Array<{ message: string; tone: string }>>([]);
    const [situationTemplates, setSituationTemplates] = useState<SituationTemplate[]>([]);

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
        setSituationTemplates(getTemplatesForOccasion(occasion.id));
        setStep('recipient');
    };

    const handleArchetypeSelect = (archetype: Archetype) => {
        setCardData(prev => ({ ...prev, archetypeId: archetype.id, strengthId: undefined, strengthIds: undefined }));
    };

    const handleStrengthSelect = (strength: Strength) => {
        const newIds = [...selectedStrengthIds, strength.id];
        setSelectedStrengthIds(newIds);
        setCardData(prev => ({
            ...prev,
            strengthId: newIds[0],
            strengthIds: newIds,
            archetypeId: undefined
        }));
    };

    const handleStrengthDeselect = (strengthId: string) => {
        const newIds = selectedStrengthIds.filter(id => id !== strengthId);
        setSelectedStrengthIds(newIds);
        setCardData(prev => ({
            ...prev,
            strengthId: newIds[0] || undefined,
            strengthIds: newIds.length > 0 ? newIds : undefined
        }));
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
            strengthIds: selectedStrengthIds.length > 0 ? selectedStrengthIds : undefined,
            backgroundId: cardData.backgroundId,
            situation: cardData.situation || '',
            personalMessage: cardData.personalMessage || '',
            lang: cardData.lang || 'ko',
            createdAt: new Date().toISOString(),
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

    const generateAIMessage = async () => {
        if (!cardData.recipientName || !cardData.occasionId) {
            alert('수신자 이름과 상황을 먼저 선택해주세요.');
            return;
        }

        setIsGeneratingAI(true);
        setAiOptions([]);

        try {
            const response = await fetch('/api/generate-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientName: cardData.recipientName,
                    occasionId: cardData.occasionId,
                    archetypeId: cardData.archetypeId,
                    strengthId: cardData.strengthId,
                    situation: cardData.situation,
                    lang: cardData.lang,
                    count: 3
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.options) {
                    setAiOptions(data.options);
                } else if (data.message) {
                    setCardData(prev => ({ ...prev, personalMessage: data.message }));
                }
            }
        } catch (error) {
            console.error('AI 메시지 생성 오류:', error);
            alert('AI 메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const selectAIMessage = (message: string) => {
        setCardData(prev => ({ ...prev, personalMessage: message }));
        setAiOptions([]);
    };

    const stepTitles: Record<Step, string> = {
        occasion: '상황 선택',
        recipient: '수신자 정보',
        type: '메시지 타입',
        archetype: '원형 선택',
        strength: '강점 선택',
        background: '배경 선택',
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
            case 'background': return true;
            case 'message': return true;
            default: return true;
        }
    };

    const nextStep = () => {
        const steps: Step[] = ['occasion', 'recipient', 'type', useStrength ? 'strength' : 'archetype', 'background', 'message', 'preview'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const steps: Step[] = ['occasion', 'recipient', 'type', useStrength ? 'strength' : 'archetype', 'background', 'message', 'preview'];
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
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                            ← 홈으로
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-elegant font-bold text-gold-gradient">카드 만들기</h1>
                            <p className="text-white/60 text-sm mt-1">{stepTitles[step]}</p>
                        </div>
                        <div className="w-20" />
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 'occasion' && (
                            <motion.div key="occasion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <OccasionSelector
                                    selectedId={cardData.occasionId || null}
                                    onSelect={handleOccasionSelect}
                                    showAll={showAllOccasions}
                                />
                                {!showAllOccasions && (
                                    <motion.button
                                        onClick={() => setShowAllOccasions(true)}
                                        className="mt-6 w-full py-3 text-gold-400 hover:text-gold-300 transition-colors text-sm"
                                    >
                                        더 많은 상황 보기 →
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {step === 'recipient' && (
                            <motion.div key="recipient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <label className="block text-white/80 mb-2">받으실 분의 이름</label>
                                    <input
                                        type="text"
                                        value={cardData.recipientName || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, recipientName: e.target.value }))}
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                                        placeholder="받으실 분의 이름을 입력하세요"
                                        list="existing-clients"
                                    />
                                    <datalist id="existing-clients">
                                        {existingClients.map(name => <option key={name} value={name} />)}
                                    </datalist>
                                </div>
                            </motion.div>
                        )}

                        {step === 'type' && (
                            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <p className="text-white/60 text-center mb-6">메시지 스타일을 선택하세요</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        onClick={() => { setUseStrength(false); nextStep(); }}
                                        className={`p-6 glass rounded-2xl text-left hover:bg-white/10 transition-colors border ${!useStrength ? 'border-gold-400' : 'border-white/10'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-3xl mb-3 block">🎭</span>
                                        <h3 className="text-white font-medium mb-1">원형 기반</h3>
                                        <p className="text-white/60 text-sm">12가지 성격 원형으로 메시지 전달</p>
                                    </motion.button>
                                    <motion.button
                                        onClick={() => { setUseStrength(true); nextStep(); }}
                                        className={`p-6 glass rounded-2xl text-left hover:bg-white/10 transition-colors border ${useStrength ? 'border-gold-400' : 'border-white/10'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-3xl mb-3 block">💪</span>
                                        <h3 className="text-white font-medium mb-1">강점 기반</h3>
                                        <p className="text-white/60 text-sm">34가지 강점으로 맞춤 메시지</p>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'archetype' && (
                            <motion.div key="archetype" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <ArchetypeSelector
                                    selectedId={cardData.archetypeId || null}
                                    onSelect={handleArchetypeSelect}
                                    lang={cardData.lang}
                                />
                            </motion.div>
                        )}

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

                        {step === 'background' && (
                            <motion.div key="background" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <BackgroundSelector
                                    occasionId={cardData.occasionId || ''}
                                    selectedBackgroundId={cardData.backgroundId}
                                    onSelect={(bg: CardBackground) => setCardData(prev => ({ ...prev, backgroundId: bg.id }))}
                                    lang={cardData.lang}
                                />
                            </motion.div>
                        )}

                        {step === 'message' && (
                            <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <label className="block text-white/80 mb-2">개인 메시지</label>
                                    <textarea
                                        value={cardData.personalMessage || ''}
                                        onChange={(e) => setCardData(prev => ({ ...prev, personalMessage: e.target.value }))}
                                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none"
                                        rows={4}
                                        placeholder="진심을 담은 메시지를 작성해주세요"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <CardPreview data={cardData} />

                                {!shareUrl ? (
                                    <>
                                        <div className="space-y-3">
                                            <p className="text-white/60 text-sm text-center">카드 열기 방식</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenMode('envelope')}
                                                    className={`p-4 glass rounded-xl text-center transition-all cursor-pointer ${openMode === 'envelope' ? 'border-2 border-gold-400' : 'border border-white/10 hover:bg-white/5'}`}
                                                >
                                                    <span className="text-2xl mb-2 block">💌</span>
                                                    <span className="text-white text-sm">봉투 열기</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenMode('scratch')}
                                                    className={`p-4 glass rounded-xl text-center transition-all cursor-pointer ${openMode === 'scratch' ? 'border-2 border-gold-400' : 'border border-white/10 hover:bg-white/5'}`}
                                                >
                                                    <span className="text-2xl mb-2 block">🎫</span>
                                                    <span className="text-white text-sm">스크래치</span>
                                                </button>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={generateShareUrl}
                                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-2xl"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            카드 생성하기 ✨
                                        </motion.button>
                                    </>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <div className="glass rounded-xl p-4">
                                            <p className="text-white/60 text-xs mb-2">공유 URL</p>
                                            <input
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                className="w-full bg-transparent text-white text-sm border-none focus:outline-none"
                                            />
                                        </div>
                                        <motion.button
                                            onClick={copyToClipboard}
                                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-2xl"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {copied ? '복사 완료! ✓' : 'URL 복사하기'}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step !== 'occasion' && step !== 'preview' && (
                        <div className="flex gap-4 mt-8">
                            <motion.button
                                onClick={prevStep}
                                className="flex-1 py-3 glass rounded-xl text-white/70 hover:bg-white/10 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                ← 이전
                            </motion.button>
                            {step !== 'type' && (
                                <motion.button
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-medium rounded-xl disabled:opacity-50"
                                    whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                                >
                                    다음 →
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
