'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavItemKey } from '@/components/layout/Sidebar';
import { OverviewPlaceholder } from '@/components/dashboard/OverviewPlaceholder';
import { ProductsView, ProductItem } from '@/components/views/ProductsView';
import { LeftoverStockView } from '@/components/views/LeftoverStockView';
import { AlertsView } from '@/components/views/AlertsView';
import { SettingsView } from '@/components/views/SettingsView';
import { AboutView } from '@/components/views/AboutView';
import { VoiceCommandModal } from '@/components/voice/VoiceCommandModal';
import { CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

/**
 * 10 Reference Products totaling 401 stock units, exactly 2 low stock items (<= 20 units)
 * matching the TalkStock dashboard specification:
 * - Total Products: 10
 * - Low Stock Alerts: 2 (Toned Milk: 20, Premium Tea: 15.5)
 * - Total Stock: 401
 */
const INITIAL_PRODUCTS: ProductItem[] = [
  { id: '1', name: 'Basmati Rice', category: 'Grains & Staples', currentStock: 50, unit: 'kg', pricePerUnit: 95 },
  { id: '2', name: 'Refined Sugar', category: 'Grains & Staples', currentStock: 40, unit: 'kg', pricePerUnit: 44 },
  { id: '3', name: 'Sunflower Cooking Oil', category: 'Oils & Ghee', currentStock: 30, unit: 'liters', pricePerUnit: 140 },
  { id: '4', name: 'Toned Milk Packets', category: 'Dairy', currentStock: 20, unit: 'packets', pricePerUnit: 28 }, // Alert 1
  { id: '5', name: 'Premium Tea Powder', category: 'Beverages', currentStock: 15.5, unit: 'kg', pricePerUnit: 450 }, // Alert 2
  { id: '6', name: 'Bathing Soap', category: 'Personal Care', currentStock: 60, unit: 'pieces', pricePerUnit: 35 },
  { id: '7', name: 'Marie Biscuits', category: 'Snacks & Bakery', currentStock: 45, unit: 'packets', pricePerUnit: 20 },
  { id: '8', name: 'Toor Dal', category: 'Pulses', currentStock: 35.5, unit: 'kg', pricePerUnit: 165 },
  { id: '9', name: 'Whole Wheat Flour (Atta)', category: 'Grains & Staples', currentStock: 80, unit: 'kg', pricePerUnit: 42 },
  { id: '10', name: 'Washing Detergent Powder', category: 'Household', currentStock: 25, unit: 'packets', pricePerUnit: 110 },
];

const wordToNum: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
};

function extractQuantity(text: string): number | null {
  const lower = text.toLowerCase();

  // 1. Check for "to <number>" (e.g. "update rice count to 50", "set to 20")
  const toMatch = lower.match(/(?:to|set to)\s*(\d+(?:\.\d+)?)/);
  if (toMatch) {
    return parseFloat(toMatch[1]);
  }

  // 2. Direct number anywhere (e.g. "5kg", "5 kg", "50", "2.5")
  const match = text.match(/\d+(?:\.\d+)?/);
  if (match) {
    return parseFloat(match[0]);
  }

  // 3. English word numbers ("five", "ten", etc.)
  const words = lower.split(/[\s-]+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (wordToNum[w] !== undefined) {
      if (i + 1 < words.length && wordToNum[words[i + 1]] !== undefined && wordToNum[words[i + 1]] < 10) {
        return wordToNum[w] + wordToNum[words[i + 1]];
      }
      return wordToNum[w];
    }
  }
  return null;
}

/**
 * Text-to-speech audio feedback to verbally confirm voice commands
 */
function speakFeedback(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio playback error ignored safely
    }
  }
}

function findMatchingProduct(text: string, productList: ProductItem[]): ProductItem | undefined {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // 1. Direct name match
  for (const p of productList) {
    if (lower.includes(p.name.toLowerCase())) return p;
  }

  // 2. Keyword mapping dictionary
  const map: { keywords: string[]; match: (p: ProductItem) => boolean }[] = [
    {
      keywords: ['rice', 'basmati', 'chawal'],
      match: (p) => p.name.toLowerCase().includes('rice') || p.id === '1',
    },
    {
      keywords: ['sugar', 'cheeni', 'shakar', 'sweet'],
      match: (p) => p.name.toLowerCase().includes('sugar') || p.id === '2',
    },
    {
      keywords: ['oil', 'cooking oil', 'sunflower', 'tel'],
      match: (p) => p.name.toLowerCase().includes('oil') || p.id === '3',
    },
    {
      keywords: ['milk', 'doodh', 'toned milk', 'dairy'],
      match: (p) => p.name.toLowerCase().includes('milk') || p.id === '4',
    },
    {
      keywords: ['tea', 'chai', 'tea powder', 'patti'],
      match: (p) => p.name.toLowerCase().includes('tea') || p.id === '5',
    },
    {
      keywords: ['soap', 'bathing soap', 'sabun', 'bath soap'],
      match: (p) => p.name.toLowerCase().includes('soap') || p.id === '6',
    },
    {
      keywords: ['biscuit', 'biscuits', 'marie', 'cookie', 'cookies'],
      match: (p) => p.name.toLowerCase().includes('biscuit') || p.id === '7',
    },
    {
      keywords: ['dal', 'toor', 'toor dal', 'pulses', 'lentil', 'lentils', 'arhar'],
      match: (p) => p.name.toLowerCase().includes('dal') || p.id === '8',
    },
    {
      keywords: ['wheat', 'atta', 'flour', 'gehun'],
      match: (p) => p.name.toLowerCase().includes('wheat') || p.name.toLowerCase().includes('atta') || p.id === '9',
    },
    {
      keywords: ['detergent', 'washing powder', 'surf', 'washing detergent', 'powder'],
      match: (p) => p.name.toLowerCase().includes('detergent') || p.id === '10',
    },
  ];

  for (const entry of map) {
    if (entry.keywords.some((kw) => lower.split(/\s+/).includes(kw) || lower.includes(kw))) {
      const found = productList.find(entry.match);
      if (found) return found;
    }
  }

  // 3. Sub-word match
  const tokens = lower.split(/\s+/);
  for (const p of productList) {
    const pTokens = p.name.toLowerCase().split(/\s+/);
    if (tokens.some((t) => t.length >= 4 && pTokens.some((pt) => pt.includes(t) || t.includes(pt)))) {
      return p;
    }
  }

  return undefined;
}

export default function TalkStockApp() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');
  // Static initial inventory of 10 items totaling 401 stock units
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const hasExecutedRef = useRef<boolean>(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Quick Action 1: Reset Demo (Restores static initial baseline)
  const handleResetDemo = useCallback(() => {
    setLoadingReset(true);
    setTimeout(() => {
      setProducts(INITIAL_PRODUCTS);
      setSpeechFeedback(null);
      setSpeechError(null);
      setLiveTranscript('');
      setLoadingReset(false);
      speakFeedback('Inventory data reset to initial baseline.');
      showToast('Demo inventory data reset to initial 10 products (401 total units, 2 alerts)!', 'success');
    }, 350);
  }, [showToast]);

  // Quick Action 2: Refresh (Purely refreshes the current view statically)
  const handleRefresh = useCallback(() => {
    setLoadingRefresh(true);
    setTimeout(() => {
      setLoadingRefresh(false);
      showToast('Dashboard refreshed with latest stock values!', 'info');
    }, 300);
  }, [showToast]);

  // Quick Action 3: Settings
  const handleOpenSettings = () => {
    setActiveTab('settings');
  };

  // Core Command Processor for both live microphone and sample buttons
  const executeCommand = useCallback((commandText: string) => {
    const raw = commandText.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();

    // 1. Reset command
    if (lower.includes('reset') && (lower.includes('demo') || lower.includes('inventory') || lower.includes('data') || lower.includes('stock'))) {
      handleResetDemo();
      return;
    }

    // 2. Restock all command
    if (lower.includes('restock all') || lower.includes('replenish all') || lower.includes('stock all') || lower.includes('sab restock')) {
      setProducts((prev) =>
        prev.map((item) =>
          item.currentStock <= 20 ? { ...item, currentStock: item.currentStock + 25 } : item
        )
      );
      const msg = 'Restocked all low inventory items above minimum threshold.';
      setSpeechFeedback(msg);
      speakFeedback(msg);
      showToast('Voice update: All low stock items restocked successfully!', 'success');
      return;
    }

    // 3. Match product
    const targetProduct = findMatchingProduct(raw, products);

    if (!targetProduct) {
      setSpeechFeedback(`Recognized: "${raw}" (No matching product)`);
      showToast(`Heard: "${raw}". Mention products like rice, milk, sugar, oil, or tea.`, 'alert');
      return;
    }

    const qty = extractQuantity(raw);

    // 1. SET / UPDATE EXACT COUNT ACTION (explicit set/update keywords)
    if (
      lower.includes('update') ||
      lower.includes('set to') ||
      lower.includes('count to') ||
      lower.includes('change to') ||
      lower.includes('make it') ||
      lower.includes('set ')
    ) {
      const targetQty = qty !== null ? qty : targetProduct.currentStock;
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, currentStock: targetQty } : p))
      );
      const msg = `Updated ${targetProduct.name} stock count to ${targetQty} ${targetProduct.unit}.`;
      setSpeechFeedback(msg);
      speakFeedback(msg);
      showToast(msg, 'success');
      return;
    }

    // 2. ADD / RESTOCK ACTION
    if (
      lower.includes('add') ||
      lower.includes('restock') ||
      lower.includes('bought') ||
      lower.includes('buy') ||
      lower.includes('plus') ||
      lower.includes('received') ||
      lower.includes('receive') ||
      lower.includes('purchase') ||
      lower.includes('aaya') ||
      lower.includes('replenish')
    ) {
      const addition = qty !== null ? qty : 20;
      const newStock = targetProduct.currentStock + addition;
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, currentStock: newStock } : p))
      );
      const msg = `Restocked +${addition} ${targetProduct.unit} of ${targetProduct.name}. New count: ${newStock} ${targetProduct.unit}.`;
      setSpeechFeedback(msg);
      speakFeedback(msg);
      showToast(msg, 'success');
      return;
    }

    // 3. DEDUCT / SUBTRACT / SELL / LEFT ACTION (e.g. "5kg rice left", "sold 5 milk", "deduct 5")
    if (
      lower.includes('left') ||
      lower.includes('sold') ||
      lower.includes('sell') ||
      lower.includes('sale') ||
      lower.includes('minus') ||
      lower.includes('deduct') ||
      lower.includes('remove') ||
      lower.includes('subtract') ||
      lower.includes('bik gaya') ||
      lower.includes('becha') ||
      lower.includes('reduce') ||
      lower.includes('less') ||
      lower.includes('used') ||
      lower.includes('taken')
    ) {
      const deduction = qty !== null ? qty : 5;
      const newStock = Math.max(0, targetProduct.currentStock - deduction);
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, currentStock: newStock } : p))
      );
      const msg = `Subtracted ${deduction} ${targetProduct.unit} from ${targetProduct.name}. New stock: ${newStock} ${targetProduct.unit}.`;
      setSpeechFeedback(msg);
      speakFeedback(msg);
      showToast(msg, 'success');
      return;
    }

    // 4. Fallback: if a number was mentioned without a specific verb (e.g. "rice 45")
    if (qty !== null) {
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, currentStock: qty } : p))
      );
      const msg = `Updated ${targetProduct.name} stock count to ${qty} ${targetProduct.unit}.`;
      setSpeechFeedback(msg);
      speakFeedback(msg);
      showToast(msg, 'success');
      return;
    }
  }, [products, handleResetDemo, showToast]);

  // Keep a ref to the latest executeCommand function to avoid stale closures in event listeners
  const executeCommandRef = useRef(executeCommand);
  useEffect(() => {
    executeCommandRef.current = executeCommand;
  }, [executeCommand]);

  // Audio capture function for real-time visualizer
  const startAudioMeter = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (err) {
      console.warn('Audio meter init error:', err);
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    stopAudioMeter();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const startListening = useCallback(() => {
    stopListening();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

    // Start Audio Level Meter
    startAudioMeter();

    if (!SpeechRecognition) {
      setIsListening(true);
      setSpeechError('Browser speech engine unavailable or blocked. You can tap the sample commands or type below.');
      showToast('Speech recognition not supported in this browser.', 'alert');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      latestTranscriptRef.current = '';
      hasExecutedRef.current = false;
      setLiveTranscript('');
      setSpeechError(null);

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your inventory command clearly.', 'info');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const phrase = (final || interim).trim();
        if (phrase) {
          latestTranscriptRef.current = phrase;
          setLiveTranscript(phrase);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // Auto-apply command 1.4s after user finishes speaking
          silenceTimerRef.current = setTimeout(() => {
            if (!hasExecutedRef.current && latestTranscriptRef.current.trim()) {
              hasExecutedRef.current = true;
              executeCommandRef.current(latestTranscriptRef.current.trim());
              stopListening();
            }
          }, 1400);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Click the lock/site settings icon in your browser address bar to allow microphone.');
          showToast('Microphone blocked. Please grant microphone permission.', 'alert');
          stopListening();
        } else if (event.error === 'network') {
          setSpeechError('Google speech recognition network service unreachable. You can tap any sample command or use the text box.');
          showToast('Speech service network error.', 'alert');
          stopListening();
        } else if (event.error === 'no-speech') {
          // Keep listening
        } else {
          setSpeechError(`Voice notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (!hasExecutedRef.current && latestTranscriptRef.current.trim()) {
          hasExecutedRef.current = true;
          executeCommandRef.current(latestTranscriptRef.current.trim());
        }
        stopListening();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Microphone start error';
      setSpeechError(errMsg);
      showToast(errMsg, 'alert');
      stopListening();
    }
  }, [stopListening, showToast]);

  // Main Toggle: opens modal and activates microphone
  const handleToggleVoice = (openModal = true) => {
    if (openModal) {
      setIsVoiceModalOpen(true);
    }
    if (isListening) {
      if (!hasExecutedRef.current && latestTranscriptRef.current.trim()) {
        hasExecutedRef.current = true;
        executeCommandRef.current(latestTranscriptRef.current.trim());
      }
      stopListening();
      showToast('Microphone paused.', 'info');
    } else {
      startListening();
    }
  };

  // Example Prompt Click (Simulates, executes, and speaks response)
  const handleSelectExample = (command: string) => {
    setLiveTranscript(command);
    stopListening();
    executeCommand(command);
  };

  // Manual Adjust in Products view
  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
          : item
      )
    );
    showToast('Stock quantity updated.', 'info');
  };

  // One-click Restock All Low Stock Items in Alerts view
  const handleRestockAll = () => {
    setProducts((prev) =>
      prev.map((item) =>
        item.currentStock <= 20
          ? { ...item, currentStock: item.currentStock + 25 }
          : item
      )
    );
    const msg = 'All low stock items have been successfully restocked! Alerts cleared.';
    speakFeedback(msg);
    showToast(msg, 'success');
  };

  // Calculated Metric Totals
  const totalProductsCount = products.length;
  // Low stock threshold is <= 20 units (Milk: 20, Tea: 15.5 -> Exactly 2 initial alerts)
  const lowStockCount = products.filter((p) => p.currentStock <= 20).length;
  const totalStockSum = Math.round(products.reduce((acc, p) => acc + p.currentStock, 0));

  return (
    <AppLayout
      activeItem={activeTab}
      onSelectItem={setActiveTab}
      alertsCount={lowStockCount}
      isListening={isListening}
      onOpenVoice={() => handleToggleVoice(true)}
    >
      {activeTab !== 'products' && (
        <AppHeader
          title={
            activeTab === 'home'
              ? 'Welcome to TalkStock'
              : activeTab === 'leftover'
              ? 'Leftover Stock'
              : activeTab === 'alerts'
              ? 'Inventory Alerts'
              : activeTab === 'settings'
              ? 'Application Settings'
              : 'About TalkStock'
          }
          subtitle={
            activeTab === 'home'
              ? 'Manage your business inventory with the power of voice.'
              : activeTab === 'leftover'
              ? 'Review end-of-day leftover stock and surplus inventory.'
              : activeTab === 'alerts'
              ? 'Real-time alerts for low stock and depleted items.'
              : activeTab === 'settings'
              ? 'Configure voice models, currency, and notifications.'
              : 'Voice-first inventory intelligence for modern businesses.'
          }
        />
      )}

      {/* Floating Action / Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold select-none ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : toastMessage.type === 'alert'
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : toastMessage.type === 'alert' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0 animate-pulse" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Dedicated Interactive Voice Assistant Modal Dialog */}
      <VoiceCommandModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          stopListening();
        }}
        isListening={isListening}
        liveTranscript={liveTranscript}
        speechFeedback={speechFeedback}
        speechError={speechError}
        audioLevel={audioLevel}
        onToggleMic={() => handleToggleVoice(false)}
        onExecuteCommand={(cmd) => {
          executeCommand(cmd);
          stopListening();
        }}
      />

      {/* View routing based on active sidebar tab */}
      {activeTab === 'home' && (
        <OverviewPlaceholder
          totalProductsCount={totalProductsCount}
          lowStockCount={lowStockCount}
          totalStockSum={totalStockSum}
          onResetDemo={handleResetDemo}
          onRefresh={handleRefresh}
          onOpenSettings={handleOpenSettings}
          onVoiceCommand={() => handleToggleVoice(true)}
          onViewDetails={() => setActiveTab('products')}
          isListening={isListening}
          liveTranscript={liveTranscript}
          speechFeedback={speechFeedback}
          speechError={speechError}
          onMicClick={() => handleToggleVoice(true)}
          onSelectExample={handleSelectExample}
          onManualSubmit={executeCommand}
          loadingReset={loadingReset}
          loadingRefresh={loadingRefresh}
        />
      )}

      {activeTab === 'products' && (
        <ProductsView
          products={products}
          loading={false}
          onRefresh={handleRefresh}
          onAdjustStock={handleAdjustStock}
          onAddProduct={(newProd) => {
            const item: ProductItem = {
              ...newProd,
              id: `prod-${Date.now()}`,
            };
            setProducts((prev) => [item, ...prev]);
            showToast(`Added new product: ${newProd.name}`, 'success');
          }}
        />
      )}

      {activeTab === 'leftover' && (
        <LeftoverStockView
          products={products}
          onGoToProducts={() => setActiveTab('products')}
        />
      )}

      {activeTab === 'alerts' && (
        <AlertsView
          products={products}
          onRestockItem={(id, amount) => handleAdjustStock(id, amount)}
          onRestockAll={handleRestockAll}
        />
      )}

      {activeTab === 'settings' && <SettingsView />}

      {activeTab === 'about' && <AboutView />}
    </AppLayout>
  );
}
