import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Package,
  StopCircle,
  Radio,
} from 'lucide-react';
import { Product, SaleTransaction, UserAccount, VoiceConsultationMessage } from '../types';

interface VoiceConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  products: Product[];
  transactions: SaleTransaction[];
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

// Helper to format text naturally for Indonesian Text-To-Speech
const formatForIndonesianSpeech = (text: string): string => {
  if (!text) return '';
  return text
    // Remove links
    .replace(/https?:\/\/\S+/g, '')
    // Remove markdown symbols
    .replace(/[*#_`~[\]()]/g, ' ')
    // Currency formatting to spoken Indonesian words
    .replace(/Rp\s?(\d+)\.(\d+)\.(\d+)/gi, (_, m1, m2, m3) => {
      const j = parseInt(m1, 10);
      const r = parseInt(m2, 10);
      return `${j} juta ${r > 0 ? r + ' ribu' : ''} rupiah`;
    })
    .replace(/Rp\s?(\d+)\.(\d+)/gi, (_, m1, m2) => {
      const r = parseInt(m1, 10);
      const s = parseInt(m2, 10);
      return `${r} ribu ${s > 0 ? s : ''} rupiah`;
    })
    .replace(/Rp\s?(\d+)/gi, (_, m1) => `${m1} rupiah`)
    // Indonesian business acronyms & terms for natural pronunciation
    .replace(/\bUMKM\b/gi, 'U M K M')
    .replace(/\bJuragan\.AI\b/gi, 'Juragan A I')
    .replace(/\.AI\b/gi, ' A I')
    .replace(/\bAI\b/gi, 'A I')
    .replace(/\bpcs\b/gi, 'buah')
    .replace(/\bqty\b/gi, 'jumlah')
    .replace(/\bkg\b/gi, 'kilogram')
    .replace(/\bgr\b/gi, 'gram')
    .replace(/\bbln\b/gi, 'bulan')
    .replace(/\bthn\b/gi, 'tahun')
    .replace(/\bHPP\b/gi, 'H P P')
    .replace(/[-•—]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper to find the best Indonesian voice available in the browser
const findIndonesianVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  const idVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
    const name = (v.name || '').toLowerCase();

    return (
      lang === 'id-id' ||
      lang.startsWith('id') ||
      lang === 'in-id' ||
      lang.startsWith('in') ||
      name.includes('indonesia') ||
      name.includes('bahasa') ||
      name.includes('gadis') ||
      name.includes('ardi') ||
      name.includes('id-id')
    );
  });

  if (idVoices.length > 0) {
    // Prioritize natural Indonesian voices (Google Bahasa Indonesia, Microsoft Gadis/Ardi, Natural)
    const preferred =
      idVoices.find((v) => v.name.toLowerCase().includes('google')) ||
      idVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
      idVoices.find((v) => v.name.toLowerCase().includes('gadis')) ||
      idVoices.find((v) => v.name.toLowerCase().includes('ardi')) ||
      idVoices[0];
    return preferred;
  }

  return null;
};

// Dedicated Fluid Visual Waveform Animation (Canvas-based)
const WaveformVisualizer: React.FC<{
  isSpeaking: boolean;
  isListening: boolean;
  volumeScale: number;
}> = ({ isSpeaking, isListening, volumeScale }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Handle retina displays
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, width, height);

      let currentAmp = 10;
      if (isSpeaking) {
        currentAmp = 20 + Math.max(0, volumeScale - 1.0) * 110;
      } else if (isListening) {
        // Active dynamic listening wave pulsating with volumeScale and speech phase
        currentAmp = 16 + Math.max(0, volumeScale - 1.0) * 60 + Math.sin(phase * 2.8) * 7;
      } else {
        currentAmp = 8 + Math.sin(phase * 1.2) * 3;
      }

      phase += isSpeaking ? 0.08 : isListening ? 0.06 : 0.025;

      // Google-inspired vibrant fluid sound waves (Blue, Emerald, Yellow/Amber, Coral/Red, Purple)
      const waves = [
        { color: 'rgba(66, 133, 244, 0.65)', speed: 1.0, freq: 0.016, phaseOff: 0, lineWidth: 3 },
        { color: 'rgba(52, 168, 83, 0.60)', speed: 1.25, freq: 0.022, phaseOff: 1.4, lineWidth: 2.5 },
        { color: 'rgba(251, 188, 5, 0.60)', speed: 0.85, freq: 0.014, phaseOff: 2.8, lineWidth: 2.5 },
        { color: 'rgba(234, 67, 53, 0.55)', speed: 1.1, freq: 0.020, phaseOff: 4.2, lineWidth: 2.5 },
        { color: 'rgba(124, 58, 237, 0.45)', speed: 0.95, freq: 0.018, phaseOff: 5.5, lineWidth: 2 },
      ];

      const centerY = height / 2;

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let x = 0; x <= width; x += 3) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * w.freq + phase * w.speed + w.phaseOff) * currentAmp * envelope;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSpeaking, isListening, volumeScale]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export const VoiceConsultationModal: React.FC<VoiceConsultationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  products,
  transactions,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<VoiceConsultationMessage[]>([]);
  const [voiceVolumeScale, setVoiceVolumeScale] = useState(1.0);
  const [activeVoiceName, setActiveVoiceName] = useState<string>('Bahasa Indonesia');
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [isSTTSupported, setIsSTTSupported] = useState<boolean>(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Stok Sambal Bawang sisa berapa?',
    'Produk apa yang stoknya menipis?',
    'Berapa total omzet toko saat ini?',
    'Apa produk yang paling laris?',
  ]);

  // Robust Intent & Engine Refs
  const isListeningDesiredRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const activeVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLiveInputRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const handleSendQueryRef = useRef<(text: string) => void>(() => {});

  // Check STT browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSTT = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      setIsSTTSupported(hasSTT);
    }
  }, []);

  // 1. Initialize Voices & Listen to dynamic voice list updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    speechSynthRef.current = window.speechSynthesis || null;

    const loadVoices = () => {
      if (!speechSynthRef.current) return;
      const allVoices = speechSynthRef.current.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      const indonesianVoice = findIndonesianVoice(allVoices);
      if (indonesianVoice) {
        activeVoiceRef.current = indonesianVoice;
        setActiveVoiceName(
          indonesianVoice.name.replace(/(Google|Microsoft|Natural|Online)\s*/gi, '').trim() || 'Bahasa Indonesia'
        );
      } else {
        activeVoiceRef.current = null;
        setActiveVoiceName('Bahasa Indonesia');
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // 2. Stop speech & listening on close or unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Initial welcome message with pure Indonesian pronunciation
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        const greeting: VoiceConsultationMessage = {
          id: 'greet-1',
          role: 'assistant',
          text: `Halo Juragan ${currentUser.name}! Saya asisten suara Juragan.AI untuk toko ${currentUser.storeName}.\nSilakan tanyakan sisa stok produk, omzet penjualan, atau konsultasi bisnis Anda.`,
          speechText: `Halo Juragan ${currentUser.name}! Saya asisten suara Juragan A I untuk toko ${currentUser.storeName}. Silakan tanyakan sisa stok produk atau omzet penjualan toko Anda.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          referencedProducts: products.filter((p) => p.stock <= (p.minStockAlert || 5)).slice(0, 2),
        };
        setMessages([greeting]);
        setTimeout(() => {
          speakText(greeting.speechText || greeting.text);
        }, 500);
      } else {
        // When reopening modal, immediately activate listening so user can speak right away
        setTimeout(() => {
          startListening();
        }, 300);
      }
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Speaking rhythm cadence simulator
  useEffect(() => {
    let animId: number;
    let angle = 0;

    if (isSpeaking) {
      const pulseRhythm = () => {
        angle += 0.08;
        const wave1 = Math.sin(angle * 3.4);
        const wave2 = Math.cos(angle * 1.9);
        const amplitude = Math.abs(wave1 * 0.65 + wave2 * 0.35);
        const dynamicScale = 1.05 + amplitude * 0.32;
        setVoiceVolumeScale(dynamicScale);

        animId = requestAnimationFrame(pulseRhythm);
      };

      animId = requestAnimationFrame(pulseRhythm);
    } else if (!isListening) {
      const idleBreathing = () => {
        angle += 0.035;
        const scale = 1.0 + Math.sin(angle) * 0.035;
        setVoiceVolumeScale(scale);
        animId = requestAnimationFrame(idleBreathing);
      };
      animId = requestAnimationFrame(idleBreathing);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSpeaking, isListening]);

  // Stop speaking and clear anti-pause keep-alive
  const stopSpeaking = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    activeUtteranceRef.current = null;

    if (speechSynthRef.current) {
      try {
        speechSynthRef.current.cancel();
      } catch {}
    }
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch {}
      audioPlayerRef.current = null;
    }
    setIsSpeaking(false);
    setVoiceVolumeScale(1.0);
  };

  // 3. Pure Indonesian Text-To-Speech (TTS)
  // Guarantees stable Indonesian playback on PC & Mobile without getting paused mid-sentence by Chrome GC
  const speakText = async (text: string) => {
    if (isMuted) return;

    const spokenClean = formatForIndonesianSpeech(text);
    if (!spokenClean) return;

    // Immediately stop any active speech or audio
    stopSpeaking();

    // In desktop browsers, resume any paused synthesis context
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {}
    }

    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const utterance = new SpeechSynthesisUtterance(spokenClean);
        // CRITICAL FIX: Keep active reference in ref to prevent Chrome garbage collection
        // from pausing speech mid-sentence!
        activeUtteranceRef.current = utterance;

        const allVoices = synth.getVoices();
        const voice = activeVoiceRef.current || findIndonesianVoice(allVoices);
        if (voice) {
          utterance.voice = voice;
          activeVoiceRef.current = voice;
        }

        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setVoiceVolumeScale(1.18);
        };

        utterance.onboundary = () => {
          setVoiceVolumeScale((prev) => Math.min(prev + 0.08, 1.45));
        };

        utterance.onend = () => {
          if (keepAliveTimerRef.current) {
            clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
          activeUtteranceRef.current = null;
          setIsSpeaking(false);
          setVoiceVolumeScale(1.0);

          // Once AI finishes speaking, seamlessly re-open the mic for user turn
          setTimeout(() => {
            if (isOpen) {
              startListening();
            }
          }, 350);
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          if (keepAliveTimerRef.current) {
            clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
          activeUtteranceRef.current = null;
          setIsSpeaking(false);
          setVoiceVolumeScale(1.0);

          setTimeout(() => {
            if (isOpen) {
              startListening();
            }
          }, 350);
        };

        // Anti-pause keepalive: Chrome bug causes synthesis to freeze after ~15s
        if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
        keepAliveTimerRef.current = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 5000);

        synth.speak(utterance);
        return;
      }
    } catch (err) {
      console.warn('SpeechSynthesis speak error:', err);
    }
  };

  // 4. Robust Speech-To-Text Recognition
  // Accurately transcribes live words directly into the text input without hardware locking
  const createSpeechRecognitionInstance = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; ++i) {
          const piece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalStr += piece;
          } else {
            interimStr += piece;
          }
        }

        const liveSpokenWords = (finalStr + ' ' + interimStr).trim();

        if (liveSpokenWords) {
          // AUTOMATICALLY & INSTANTLY reflect spoken words in the text input!
          setInputText(liveSpokenWords);
          currentLiveInputRef.current = liveSpokenWords;
          setTranscript(liveSpokenWords);
          setInterimTranscript(interimStr);
          setVoiceVolumeScale(1.15 + Math.min(liveSpokenWords.length * 0.01, 0.35));

          // Keep text input scrolled to latest word
          if (inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth;
          }

          // Reset silence timer whenever words are actively being spoken
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Automatically send query 2200ms after speech pauses
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningDesiredRef.current) {
              const textToSend = currentLiveInputRef.current.trim();
              if (textToSend && textToSend.length > 2) {
                stopListening();
                handleSendQueryRef.current(textToSend);
              }
            }
          }, 2200);
        }
      };

      recognition.onspeechend = () => {
        const textToSend = currentLiveInputRef.current.trim();
        if (textToSend && isListeningDesiredRef.current) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningDesiredRef.current) {
              const toSend = currentLiveInputRef.current.trim();
              if (toSend && toSend.length > 2) {
                stopListening();
                handleSendQueryRef.current(toSend);
              }
            }
          }, 2000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningDesiredRef.current = false;
          setIsListening(false);
          setMicPermissionDenied(true);
        }
      };

      recognition.onend = () => {
        // If listening is still desired, restart smoothly
        if (isListeningDesiredRef.current) {
          setTimeout(() => {
            if (isListeningDesiredRef.current) {
              try {
                recognition.start();
              } catch {
                try {
                  recognitionRef.current = createSpeechRecognitionInstance();
                  recognitionRef.current?.start();
                } catch {}
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      return recognition;
    } catch {
      return null;
    }
  }, []);

  const startListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    setTranscript('');
    setInterimTranscript('');
    setInputText('');
    currentLiveInputRef.current = '';
    isListeningDesiredRef.current = true;
    setIsListening(true);
    setMicPermissionDenied(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = createSpeechRecognitionInstance();
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Re-instantiate if instance was expired
          recognitionRef.current = createSpeechRecognitionInstance();
          recognitionRef.current?.start();
        }
      }
    } catch (err) {
      console.warn('Recognition start exception:', err);
    }

    // Auto-focus input so user sees cursor ready
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const stopListening = () => {
    isListeningDesiredRef.current = false;
    setIsListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      const pendingText = (currentLiveInputRef.current || inputText).trim();
      stopListening();
      if (pendingText) {
        handleSendQueryRef.current(pendingText);
      }
    } else {
      startListening();
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    stopListening();
    setInputText('');
    setTranscript('');
    setInterimTranscript('');
    currentLiveInputRef.current = '';

    const userMsg: VoiceConsultationMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = 'msg-' + (Date.now() + 1);
    const initialAiMsg: VoiceConsultationMessage = {
      id: aiMsgId,
      role: 'assistant',
      text: '',
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    // Immediately show user message and placeholder for AI streaming response
    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-voice-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          query: trimmed,
          stream: true,
          history: messages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
          products,
          transactions: transactions.slice(0, 30),
          storeProfile: {
            storeName: currentUser.storeName,
            ownerName: currentUser.name,
            category: 'Kuliner & Ritel UMKM',
            city: 'Indonesia',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // If ReadableStream is available, stream text chunks in real-time
      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedRaw = '';
        let speechToPlay = '';
        let hasReceivedAnyChunk = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data:')) continue;
            const dataStr = trimmedLine.replace(/^data:\s*/, '');
            if (!dataStr) continue;

            try {
              const eventData = JSON.parse(dataStr);
              if (eventData.type === 'chunk' && eventData.text) {
                hasReceivedAnyChunk = true;
                accumulatedRaw += eventData.text;

                // Live strip tags so user never sees raw metadata brackets
                const liveVisibleText = accumulatedRaw
                  .replace(/\[PRODUK:[\s\S]*$/i, '')
                  .replace(/\[SARAN:[\s\S]*$/i, '')
                  .trimStart();

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, text: liveVisibleText, isStreaming: true } : m
                  )
                );
              } else if (eventData.type === 'done') {
                const finalDisplay = eventData.displayText || accumulatedRaw;
                speechToPlay = eventData.speechText || finalDisplay;

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          text: finalDisplay,
                          speechText: eventData.speechText,
                          referencedProducts: eventData.referencedProducts,
                          isStreaming: false,
                        }
                      : m
                  )
                );

                if (eventData.suggestedFollowUps && eventData.suggestedFollowUps.length > 0) {
                  setSuggestedPrompts(eventData.suggestedFollowUps);
                }
              }
            } catch {
              // Ignore partial JSON chunk parse failures
            }
          }
        }

        // Ensure streaming indicator is finalized
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );

        if (speechToPlay || accumulatedRaw) {
          speakText(speechToPlay || accumulatedRaw);
          return;
        }

        if (!hasReceivedAnyChunk) {
          throw new Error('Stream kosong.');
        }
      } else {
        // Fallback for non-streamable environments
        const json = await response.json();
        if (json.success && json.data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: json.data.displayText || json.data.speechText,
                    speechText: json.data.speechText,
                    referencedProducts: json.data.referencedProducts,
                    isStreaming: false,
                  }
                : m
            )
          );

          if (json.data.suggestedFollowUps && json.data.suggestedFollowUps.length > 0) {
            setSuggestedPrompts(json.data.suggestedFollowUps);
          }

          speakText(json.data.speechText || json.data.displayText);
          return;
        }
        throw new Error('Respon tidak valid.');
      }
    } catch {
      // Local fallback in natural Indonesian with live store products
      const lower = trimmed.toLowerCase();
      let replySpeech = '';
      let replyDisplay = '';
      let refProds: Product[] = [];

      const matched = products.find((p) => lower.includes(p.name?.toLowerCase()));
      if (matched) {
        refProds = [matched];
        replySpeech = `Stok ${matched.name} saat ini tersisa ${matched.stock} ${matched.unit}. Harganya ${matched.sellingPrice.toLocaleString('id-ID')} rupiah.`;
        replyDisplay = `📦 **${matched.name}**\n- Sisa Stok: **${matched.stock} ${matched.unit}**\n- Batas Kritis: ${matched.minStockAlert} ${matched.unit}\n- Harga Jual: Rp${matched.sellingPrice.toLocaleString('id-ID')}`;
      } else if (lower.includes('stok') || lower.includes('habis')) {
        const low = products.filter((p) => p.stock <= (p.minStockAlert || 5));
        refProds = low;
        replySpeech =
          low.length > 0
            ? `Ada ${low.length} produk yang stoknya menipis, yaitu ${low.map((p) => p.name).join(', ')}. Segera jadwalkan restock ya Juragan.`
            : `Semua ${products.length} stok produk toko Anda saat ini dalam kondisi aman.`;
        replyDisplay =
          low.length > 0
            ? `⚠️ **Produk Menipis**:\n${low.map((p) => `• ${p.name}: ${p.stock} ${p.unit} (Kritis: ${p.minStockAlert})`).join('\n')}`
            : `✅ Semua ${products.length} produk memiliki stok yang aman.`;
      } else if (lower.includes('omzet') || lower.includes('penjualan')) {
        const total = transactions.reduce((acc, t) => acc + (t.totalPrice || 0), 0);
        replySpeech = `Total omzet penjualan toko saat ini tercatat sebesar ${total.toLocaleString('id-ID')} rupiah dari ${transactions.length} transaksi.`;
        replyDisplay = `📊 **Total Omzet**: Rp${total.toLocaleString('id-ID')} dari ${transactions.length} transaksi.`;
      } else {
        replySpeech = `Siap Juragan ${currentUser.name}. Saya pantau penjualan dan inventori toko ${currentUser.storeName} berjalan dengan lancar. Ada data spesifik yang ingin dicek?`;
        replyDisplay = `💡 Saya siap membantu memantau stok, mencatat omzet, atau merekomendasikan promo untuk toko Anda. Silakan tanyakan hal spesifik seperti "stok sambal sisa berapa?".`;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: replyDisplay,
                speechText: replySpeech,
                referencedProducts: refProds,
                isStreaming: false,
              }
            : m
        )
      );
      speakText(replySpeech);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    onClose();
  };

  handleSendQueryRef.current = handleSendQuery;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop with soft blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />

          {/* Modal Dialog (100% White Mode) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.25, ease: easeOutCurve }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200/90 overflow-hidden flex flex-col z-10"
          >
            {/* Top Bar (White Mode) */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 via-emerald-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                      Juragan Voice AI
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Bahasa Indonesia
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Toko: <strong className="text-zinc-800">{currentUser.storeName}</strong> ({products.length} produk terhubung)
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-medium text-zinc-600">
                  <Radio className="w-3 h-3 text-emerald-600" />
                  <span className="truncate max-w-[120px]">{activeVoiceName}</span>
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Nyalakan Suara AI' : 'Bisukan Suara AI'}
                  className={`p-2 rounded-xl border transition-all ${
                    isMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Stage: Dynamic Visual Waveform & Voice Circular Orb */}
            <div className="relative py-7 px-4 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-50/90 via-white to-zinc-50/50 border-b border-zinc-100 shrink-0">
              {/* Fluid Visual Wave Canvas across the stage */}
              <div className="absolute inset-0 pointer-events-none opacity-90">
                <WaveformVisualizer
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  volumeScale={voiceVolumeScale}
                />
              </div>

              {/* Outer Pulsing Soft Aura Rings */}
              <div
                className="absolute w-52 h-52 rounded-full pointer-events-none transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${voiceVolumeScale * 1.3})`,
                  background: isSpeaking
                    ? 'radial-gradient(circle, rgba(66, 133, 244, 0.18) 0%, rgba(52, 168, 83, 0.08) 55%, transparent 75%)'
                    : isListening
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(66, 133, 244, 0.1) 60%, transparent 80%)'
                    : 'radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 65%)',
                }}
              />

              <div
                className="absolute w-40 h-40 rounded-full pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  transform: `scale(${voiceVolumeScale * 1.15})`,
                  background: isSpeaking
                    ? 'radial-gradient(circle, rgba(66, 133, 244, 0.25) 0%, rgba(234, 67, 53, 0.12) 60%, transparent 75%)'
                    : isListening
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(52, 168, 83, 0.12) 0%, transparent 70%)',
                }}
              />

              {/* Center Voice Orb */}
              <motion.div
                animate={{
                  scale: voiceVolumeScale,
                  rotate: isSpeaking ? [0, 90, 180, 270, 360] : isListening ? [0, 45, 0] : 0,
                }}
                transition={{
                  scale: { duration: 0.08, ease: 'linear' },
                  rotate: { duration: isSpeaking ? 16 : 6, repeat: Infinity, ease: 'linear' },
                }}
                onClick={toggleListening}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer select-none group flex items-center justify-center z-10"
              >
                {/* Multi-gradient ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-gradient-to-tr from-blue-500 via-emerald-400 to-amber-400 shadow-[0_10px_35px_rgba(66,133,244,0.35)]'
                      : isListening
                      ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 shadow-[0_10px_35px_rgba(16,185,129,0.35)] animate-pulse'
                      : isLoading
                      ? 'bg-gradient-to-tr from-amber-400 via-purple-400 to-pink-500 shadow-[0_10px_30px_rgba(251,188,5,0.3)] animate-spin'
                      : 'bg-gradient-to-tr from-blue-500 via-emerald-500 to-teal-400 shadow-[0_8px_25px_rgba(16,185,129,0.25)] group-hover:shadow-[0_10px_35px_rgba(16,185,129,0.35)]'
                  }`}
                />

                {/* Inner Core: Crisp White Surface */}
                <div className="absolute inset-1.5 rounded-full bg-white shadow-inner flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                    </div>
                  ) : isSpeaking ? (
                    <div className="flex items-center gap-1 h-8">
                      {[0.4, 0.9, 0.6, 1.0, 0.7, 0.85, 0.4].map((h, i) => (
                        <motion.span
                          key={i}
                          animate={{
                            height: [`${h * 8}px`, `${h * 28}px`, `${h * 12}px`],
                          }}
                          transition={{
                            duration: 0.45 + (i % 3) * 0.15,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                          }}
                          className={`w-1 rounded-full shadow-xs ${
                            i % 4 === 0
                              ? 'bg-blue-500'
                              : i % 4 === 1
                              ? 'bg-emerald-500'
                              : i % 4 === 2
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      ))}
                    </div>
                  ) : isListening ? (
                    <div className="flex flex-col items-center justify-center text-emerald-600">
                      <Mic className="w-8 h-8 animate-pulse" />
                      <span className="text-[10px] font-bold mt-1 text-emerald-700">Mendengar...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700 group-hover:text-emerald-600 transition-colors">
                      <Mic className="w-8 h-8" />
                      <span className="text-[10px] font-bold mt-1 text-zinc-500 group-hover:text-emerald-600">
                        Bicara
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Status Indicator & Live Captions */}
              <div className="mt-4 z-10 text-center">
                {micPermissionDenied ? (
                  <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs">
                    <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <span>⚠️ Akses mikrofon diblokir oleh browser</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-normal">
                      Klik ikon gembok / izin mikrofon di bilah alamat browser untuk mengaktifkan suara.
                    </span>
                  </div>
                ) : !isSTTSupported ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium shadow-xs">
                    <span>Browser Anda belum mendukung input suara otomatis. Gunakan kolom teks di bawah.</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>AI sedang berbicara (Bahasa Indonesia)...</span>
                    <button
                      onClick={stopSpeaking}
                      className="ml-1 text-[11px] underline text-blue-800 hover:text-blue-900 font-bold"
                    >
                      Hentikan
                    </button>
                  </div>
                ) : isListening ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <span>Mikrofon Aktif — Kata terdeteksi otomatis</span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Otomatis kirim saat hening, atau klik tombol mic/bulatan untuk kirim
                    </span>

                    {inputText && (
                      <button
                        onClick={() => {
                          const textToSend = (currentLiveInputRef.current || inputText).trim();
                          if (textToSend) {
                            stopListening();
                            handleSendQuery(textToSend);
                          }
                        }}
                        className="mt-1 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1 rounded-lg shadow-2xs transition-all active:scale-98 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim Sekarang</span>
                      </button>
                    )}
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Menghubungkan & merangkai jawaban real-time...</span>
                  </div>
                ) : (
                  <button
                    onClick={startListening}
                    className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-semibold shadow-xs transition-all active:scale-98"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ketuk bulatan atau tombol mic untuk mulai bicara</span>
                  </button>
                )}
              </div>

              {/* Live speech preview */}
              {inputText && isListening && (
                <div className="mt-2.5 px-4 py-2 rounded-xl bg-white/95 border border-emerald-300 text-xs text-zinc-800 font-medium max-w-md text-center shadow-xs z-10 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">"{inputText}"</span>
                </div>
              )}
            </div>

            {/* Conversation Log: Soft Off-White Background */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 min-h-[160px] max-h-[320px] bg-zinc-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs font-medium shadow-xs'
                        : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {msg.text ? (
                        <>
                          <span>{msg.text}</span>
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-500 animate-pulse rounded-full align-middle" />
                          )}
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-zinc-400 py-0.5">
                          <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
                          <span className="italic">Merangkai respon...</span>
                        </span>
                      )}
                    </div>

                    {/* Referenced Store Products Card Grid in White Mode */}
                    {msg.referencedProducts && msg.referencedProducts.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-2">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3 h-3 text-emerald-600" />
                          <span>Data Database Toko:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.referencedProducts.map((p) => {
                            const isLow = p.stock <= (p.minStockAlert || 5);
                            return (
                              <div
                                key={p.id}
                                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                                  isLow
                                    ? 'bg-rose-50/70 border-rose-200'
                                    : 'bg-zinc-50 border-zinc-200'
                                }`}
                              >
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                                    <Package className="w-5 h-5 text-zinc-400" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-zinc-900 truncate">
                                    {p.name}
                                  </div>
                                  <div className="flex items-center justify-between mt-0.5 text-[11px]">
                                    <span
                                      className={`font-semibold ${
                                        isLow ? 'text-rose-600' : 'text-emerald-600'
                                      }`}
                                    >
                                      Stok: {p.stock} {p.unit}
                                    </span>
                                    <span className="text-zinc-500 font-medium">
                                      Rp{p.sellingPrice.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips: Crisp White Buttons */}
            <div className="px-5 py-2.5 bg-white border-t border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-zinc-400 shrink-0">
                Saran:
              </span>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(prompt)}
                  disabled={isLoading}
                  className="px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 border border-zinc-200 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Bottom Input Field: Clean White Surface */}
            <div className="p-3.5 bg-white border-t border-zinc-200/80 flex items-center gap-2">
              <button
                type="button"
                id="btn-mic-toggle-bottom"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-md animate-pulse ring-4 ring-rose-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                title={isListening ? 'Hentikan & Otomatis Kirim' : 'Bicara Sekarang'}
              >
                {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(inputText);
                }}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    id="input-voice-query"
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      currentLiveInputRef.current = e.target.value;
                    }}
                    placeholder={
                      isListening
                        ? 'Mendengarkan ucapan Anda... Kata otomatis masuk ke sini'
                        : 'Ketik atau klik tombol mic untuk bicara...'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden transition-all ${
                      isListening
                        ? 'bg-white border-2 border-emerald-500 shadow-xs ring-3 ring-emerald-50 pr-24 font-medium'
                        : 'bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-emerald-500'
                    }`}
                  />
                  {isListening && (
                    <div className="absolute right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100/90 border border-emerald-300 pointer-events-none shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        {inputText ? 'Transkrip Otomatis' : 'Mendengar'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30 transition-colors shadow-xs"
                  title="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
