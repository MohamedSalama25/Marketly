"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import faqsData from '../../lib/assistant/faqs.json';
import definitionsData from '../../lib/assistant/definitions.json';
import servicesData from '../../lib/assistant/services.json';
import { playVoice } from '../../lib/assistant/voiceService';

type LocaleType = 'ar' | 'en';

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [view, setView] = useState<'main' | 'services'>('main');
    const [locale] = useState<LocaleType>('ar');

    const isRTL = locale === 'ar';
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<any>(null);

    const faqs = (faqsData as any)[locale] || faqsData.ar;
    const definitions = (definitionsData as any)[locale] || definitionsData.ar;
    const servicesQuestions = (servicesData as any)[locale] || servicesData.ar;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentText]);

    useEffect(() => {
        if (!isOpen) {
            if (audioRef.current && audioRef.current.pause) {
                audioRef.current.pause();
            }
            if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
            stopTyping();
            setIsSpeaking(false);
        }
    }, [isOpen]);

    const stopTyping = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
    };

    const handleFAQClick = async (question: string, answer: string) => {
        if (isTyping) return;
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setIsTyping(true);
        setIsSpeaking(true);
        setCurrentText("");

        const audio = await playVoice(answer, locale);
        audioRef.current = audio;

        let charDelay = 50;
        if (audio && audio.duration) {
            charDelay = (audio.duration * 1000) / answer.length;
        }

        let i = 0;
        stopTyping();
        typingIntervalRef.current = setInterval(() => {
            if (i < answer.length) {
                setCurrentText(prev => prev + answer.charAt(i));
                i++;
            } else {
                stopTyping();
                setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
                setCurrentText("");
                setIsTyping(false);
                setIsSpeaking(false);
            }
        }, charDelay);
    };

    const stars = [
        { top: '-10%', left: '10%', size: 16, delay: 0 },
        { top: '20%', left: '-15%', size: 12, delay: 0.5 },
        { top: '70%', left: '-10%', size: 14, delay: 1 },
        { top: '-5%', left: '80%', size: 10, delay: 1.5 },
        { top: '80%', left: '90%', size: 12, delay: 2 },
    ];

    const tealColor = '#915EF6';

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        fontFamily: 'El Messiri, sans-serif',
        pointerEvents: 'none'
    };

    const buttonStyle: React.CSSProperties = {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: tealColor,
        border: '4px solid white',
        boxShadow: '0 0 30px rgba(29, 233, 182, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'visible'
    };

    const modalStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '400px',
        maxWidth: 'calc(100vw - 48px)',
        height: '750px',
        maxHeight: '90vh',
        backgroundColor: 'white',
        borderRadius: '2.5rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto',
        border: 'none'
    };

    const headerStyle: React.CSSProperties = {
        backgroundColor: tealColor,
        padding: '24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
    };

    const chatAreaStyle: React.CSSProperties = {
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: '#fdfdfd'
    };

    const suggestionsAreaStyle: React.CSSProperties = {
        padding: '24px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        flexShrink: 0
    };

    const bubbleStyle = (role: string): React.CSSProperties => ({
        padding: '16px',
        borderRadius: '1.5rem',
        fontSize: '14px',
        lineHeight: '1.6',
        maxWidth: '90%',
        marginBottom: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        ...(role === 'user' ? {
            backgroundColor: tealColor,
            color: 'white',
            borderTopRightRadius: '0',
            marginLeft: 'auto'
        } : {
            backgroundColor: '#f1f1f1',
            color: '#333',
            borderTopLeftRadius: '0'
        })
    });

    const actionButtonStyle: React.CSSProperties = {
        padding: '10px 16px',
        borderRadius: '1rem',
        fontSize: '13px',
        border: '1px solid #eee',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        margin: '4px',
        textAlign: 'right'
    };

    return (
        <div style={containerStyle}>
            <div style={{ position: 'relative', pointerEvents: 'auto' }}>
                {!isOpen && stars.map((star, idx) => (
                    <motion.div
                        key={idx}
                        style={{ position: 'absolute', pointerEvents: 'none', color: '#FFD700', top: star.top, left: star.left }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, 1.2, 0.8],
                            opacity: [0, 1, 0.5],
                            y: [0, -10, 0],
                            rotate: [0, 45, -45, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: star.delay,
                            ease: "easeInOut"
                        }}
                    >
                        <i className="fas fa-star" style={{ fontSize: star.size }} />
                    </motion.div>
                ))}

                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <button onClick={() => setIsOpen(true)} style={buttonStyle}>
                        <motion.div
                            style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: tealColor, opacity: 0.4 }}
                            animate={{
                                scale: isSpeaking ? [1, 2, 1] : [1, 1.4, 1],
                                opacity: isSpeaking ? [0.8, 0, 0.8] : [0.4, 0, 0.4],
                            }}
                            transition={{ duration: isSpeaking ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <i className={`fas fa-robot text-4xl ${isSpeaking ? 'animate-bounce' : ''}`} style={{ position: 'relative', zIndex: 10 }} />
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8, originX: 0, originY: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        style={modalStyle}
                    >
                        {/* Header */}
                        <div style={headerStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} dir="rtl">
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
                                    <i className="fas fa-robot text-2xl" />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>مساعد ماركتلي</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, marginTop: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSpeaking ? '#FFD700' : '#4ade80' }} />
                                        {isRTL ? 'مساعدك الذكي دائماً' : 'Online'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', padding: '8px' }}>
                                <i className="fas fa-times text-xl" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div style={chatAreaStyle} ref={scrollRef}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={bubbleStyle('assistant')} dir="rtl">
                                    أهلاً بك في ماركتلي! كيف يمكنني مساعدتك اليوم؟
                                </div>

                                {messages.map((msg, idx) => (
                                    <div key={idx} style={bubbleStyle(msg.role)} dir="rtl">
                                        {msg.content}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div style={bubbleStyle('assistant')} dir="rtl">
                                        {currentText}
                                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: tealColor, marginLeft: '4px', verticalAlign: 'middle' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggestions Area */}
                        <div style={suggestionsAreaStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} dir="rtl">
                                {view === 'main' ? (
                                    <>
                                        <div>
                                            <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>تعرف علينا</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                <button onClick={() => setView('services')} style={{ ...actionButtonStyle, backgroundColor: tealColor, color: 'white', border: 'none', fontWeight: 'bold' }}>
                                                    <i className="fas fa-magic" style={{ marginLeft: '6px' }} />
                                                    خدماتنا
                                                </button>
                                                {definitions.map((def: any) => (
                                                    <button key={def.id} onClick={() => handleFAQClick(def.title, def.content)} style={actionButtonStyle}>{def.title}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>الأسئلة الشائعة</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {faqs.map((faq: any) => (
                                                    <button key={faq.id} onClick={() => handleFAQClick(faq.question, faq.answer)} style={actionButtonStyle}>{faq.question}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <p style={{ fontWeight: 'bold', color: tealColor, margin: 0 }}>خدمات ماركتلي</p>
                                            <button onClick={() => setView('main')} style={{ border: 'none', background: 'transparent', color: '#999', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <i className="fas fa-arrow-right" />
                                                عودة
                                            </button>
                                        </div>
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {servicesQuestions.map((qa: any, idx: number) => (
                                                <button key={idx} onClick={() => handleFAQClick(qa.question, qa.answer)} style={{ ...actionButtonStyle, width: '100%', margin: '0' }}>{qa.question}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
