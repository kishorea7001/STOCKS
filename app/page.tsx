'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Mic,
  Square,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Package,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Volume2,
  Home,
  Box,
  Gift,
  Bell,
  Settings,
  Info,
  Sun,
  TrendingUp,
  History,
  X,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface TransactionLog {
  id: string;
  productId: string;
  actionType: 'SALE' | 'RESTOCK' | 'ADJUSTMENT';
  quantityChanged: number;
  rawTranscript: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  pricePerUnit: number;
  updatedAt: string;
  transactions?: TransactionLog[];
}

interface ProposedChange {
  productId: string;
  productName: string;
  action: 'SALE' | 'RESTOCK';
  quantity: number;
  unit: string;
  currentStock: number;
  newProjectedStock: number;
  confidence: number;
}

interface ProcessVoiceResponse {
  transcript: string;
  proposedChanges: ProposedChange[];
  unrecognizedItems?: string[];
  error?: string;
}

export default function TalkStockDashboard() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'alerts' | 'history'>('home');

  // Inventory state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingAI, setProcessingAI] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text fallback input
  const [textInput, setTextInput] = useState('');

  // Confirmation Modal / Review Card state
  const [reviewData, setReviewData] = useState<{
    transcript: string;
    changes: ProposedChange[];
    unrecognizedItems: string[];
  } | null>(null);
  const [confirmingUpdates, setConfirmingUpdates] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showFeedback = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  }, []);

  // 1. Fetch inventory on demand
  const fetchInventory = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      showFeedback('error', 'Could not load inventory items.');
    } finally {
      setLoadingProducts(false);
    }
  }, [showFeedback]);

  // Initial load
  useEffect(() => {
    let active = true;

    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch((err) => {
        console.error('Initial inventory fetch error:', err);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Reset Demo Data Action
  const handleResetDemoData = async () => {
    const confirmed = window.confirm(
      'Reset all store inventory back to initial hackathon demo stock levels (10 items)?'
    );
    if (!confirmed) return;

    try {
      setResettingDemo(true);
      setReviewData(null);
      const res = await fetch('/api/inventory/reset', { method: 'POST' });
      const data = await res.json();

      if (data.success && Array.isArray(data.inventory)) {
        setProducts(data.inventory);
        showFeedback('success', '✓ Demo inventory reset! 10 items restored to initial stock.');
      } else {
        throw new Error(data.error || 'Failed to reset demo data');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error resetting demo data';
      showFeedback('error', msg);
    } finally {
      setResettingDemo(false);
    }
  };

  // 3. Audio Recording (MediaRecorder API with empty audio guard)
  const startRecording = async () => {
    try {
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        // Edge case: Empty or accidental micro-tap
        if (audioBlob.size < 500 || recordingTime < 1) {
          showFeedback('info', 'Recording was too short or silent. Please tap and speak clearly.');
          return;
        }

        await processAudio(audioBlob);
      };

      recorder.start(250);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone access denied:', err);
      showFeedback(
        'error',
        'Microphone access denied. Please grant microphone permissions or use the text box below.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleAIResponse = useCallback(
    (data: ProcessVoiceResponse) => {
      if (!data.proposedChanges || data.proposedChanges.length === 0) {
        const heardMsg = data.transcript ? `"${data.transcript}"` : 'ambient sound';
        showFeedback(
          'info',
          `Heard: ${heardMsg}. No catalog items detected. Try saying: "Update rice count to 50".`
        );
        if (data.unrecognizedItems && data.unrecognizedItems.length > 0) {
          setReviewData({
            transcript: data.transcript,
            changes: [],
            unrecognizedItems: data.unrecognizedItems,
          });
        }
        return;
      }

      setReviewData({
        transcript: data.transcript,
        changes: data.proposedChanges,
        unrecognizedItems: data.unrecognizedItems || [],
      });
    },
    [showFeedback]
  );

  // 4. Process Audio with /api/process-voice
  const processAudio = async (audioBlob: Blob) => {
    try {
      setProcessingAI(true);
      showFeedback('info', 'Decoding voice note with AI...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch('/api/process-voice', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessVoiceResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process voice recording.');
      }

      handleAIResponse(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing audio';
      showFeedback('error', msg);
    } finally {
      setProcessingAI(false);
    }
  };

  // 5. Process Text fallback
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || processingAI) return;

    try {
      setProcessingAI(true);
      setFeedback(null);
      const res = await fetch('/api/process-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput.trim() }),
      });

      const data: ProcessVoiceResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process text input.');
      }

      handleAIResponse(data);
      setTextInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing text';
      showFeedback('error', msg);
    } finally {
      setProcessingAI(false);
    }
  };

  // 6. Review Card item handlers
  const updateChangeQuantity = (index: number, newQty: number) => {
    if (!reviewData) return;
    if (newQty <= 0) return;

    const updated = [...reviewData.changes];
    const item = updated[index];
    const diff = item.action === 'SALE' ? -newQty : newQty;
    const newStock = Number((item.currentStock + diff).toFixed(3));

    updated[index] = {
      ...item,
      quantity: newQty,
      newProjectedStock: newStock,
    };

    setReviewData({ ...reviewData, changes: updated });
  };

  const capToAvailableStock = (index: number) => {
    if (!reviewData) return;
    const updated = [...reviewData.changes];
    const item = updated[index];
    const maxQty = Math.max(0, item.currentStock);

    updated[index] = {
      ...item,
      quantity: maxQty,
      newProjectedStock: 0,
    };

    setReviewData({ ...reviewData, changes: updated });
  };

  const toggleAction = (index: number) => {
    if (!reviewData) return;
    const updated = [...reviewData.changes];
    const item = updated[index];
    const newAction = item.action === 'SALE' ? 'RESTOCK' : 'SALE';
    const diff = newAction === 'SALE' ? -item.quantity : item.quantity;

    updated[index] = {
      ...item,
      action: newAction,
      newProjectedStock: Number((item.currentStock + diff).toFixed(3)),
    };

    setReviewData({ ...reviewData, changes: updated });
  };

  const removeChangeItem = (index: number) => {
    if (!reviewData) return;
    const updated = reviewData.changes.filter((_, i) => i !== index);
    setReviewData({ ...reviewData, changes: updated });
  };

  const hasInsufficientStock = useMemo(() => {
    if (!reviewData) return false;
    return reviewData.changes.some(
      (item) => item.action === 'SALE' && item.quantity > item.currentStock
    );
  }, [reviewData]);

  // 7. Confirm changes -> calls /api/inventory/confirm
  const handleConfirmUpdates = async () => {
    if (!reviewData || reviewData.changes.length === 0 || confirmingUpdates) return;

    if (hasInsufficientStock) {
      showFeedback(
        'error',
        'Cannot confirm: Some items exceed available stock. Adjust quantities before updating.'
      );
      return;
    }

    try {
      setConfirmingUpdates(true);
      const payload = {
        transcript: reviewData.transcript,
        changes: reviewData.changes.map((c) => ({
          productId: c.productId,
          action: c.action,
          quantity: c.quantity,
        })),
      };

      const res = await fetch('/api/inventory/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update inventory.');
      }

      showFeedback(
        'success',
        `✓ ${data.summary?.message || 'Inventory updated successfully!'}`
      );

      if (Array.isArray(data.inventory)) {
        setProducts(data.inventory);
      } else {
        await fetchInventory();
      }

      setReviewData(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error confirming changes';
      showFeedback('error', msg);
    } finally {
      setConfirmingUpdates(false);
    }
  };

  // Metrics calculations
  const productTypesCount = products.length;

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.currentStock <= 20);
  }, [products]);

  const leftoverStockTotal = useMemo(() => {
    return Math.round(products.reduce((acc, p) => acc + p.currentStock, 0));
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesAlerts = activeTab === 'alerts' ? product.currentStock <= 20 : true;
      return matchesSearch && matchesCategory && matchesAlerts;
    });
  }, [products, searchQuery, selectedCategory, activeTab]);

  // Extract recent logs across all products
  const recentLogs = useMemo(() => {
    const logs: Array<TransactionLog & { productName?: string }> = [];
    products.forEach((p) => {
      if (p.transactions) {
        p.transactions.forEach((t) => {
          logs.push({ ...t, productName: p.name });
        });
      }
    });
    return logs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [products]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F7FC] text-slate-800 font-sans selection:bg-blue-100">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* LEFT SIDEBAR (Dark Navy Glass with Rounded Gradient Nav)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between p-5 md:min-h-screen shrink-0 border-r border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Logo Header: 3D Cube with Mic inside */}
          <div className="flex items-center space-x-3.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B132B] rounded-[14px] flex items-center justify-center relative">
                {/* 3D Box & Mic Hybrid Icon */}
                <Box className="w-6 h-6 text-blue-400" />
                <Mic className="w-3 h-3 text-white absolute" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                TalkStock
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Smart Inventory,
                <br />
                Powered by Voice
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>Leftover Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
          </nav>
        </div>

        {/* Bottom Online Status Card */}
        <div className="relative z-10 pt-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold text-white block">Online</span>
              <span className="text-slate-400 text-[11px]">Ready to help!</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-5 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
        {/* Top Header Bar: Greeting + Illustration + Profile */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-base sm:text-lg">
              <span>Hello!</span>
              <span className="text-xl">👋</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
              Welcome to <span className="text-blue-600">TalkStock</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your business inventory with the power of voice.
            </p>
          </div>

          {/* Right Header Controls: Reset Demo + Store Icon + Profile */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Reset Demo Data Pill */}
            <button
              onClick={handleResetDemoData}
              disabled={resettingDemo}
              title="Reset inventory to initial demo data"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all hover:shadow"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-500 ${resettingDemo ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Sun / Theme button */}
            <button className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-colors">
              <Sun className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              R
            </div>
          </div>

          {/* Decorative 3D Store Canopy Illustration in background */}
          <div className="hidden lg:block absolute right-32 top-[-10px] pointer-events-none opacity-20">
            <svg width="180" height="90" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 25C10 25 30 10 80 10C130 10 150 25 150 25L140 45C140 45 125 50 80 50C35 50 20 45 20 45L10 25Z" fill="#3B82F6" />
              <path d="M25 45L20 70H140L135 45" stroke="#2563EB" strokeWidth="4" />
            </svg>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all shadow-md ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            ) : (
              <Sparkles className="w-5 h-5 flex-shrink-0 text-blue-600" />
            )}
            <p className="text-sm font-medium flex-1">{feedback.message}</p>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* HERO VOICE BAR (Tap to Speak + Audio Waveform)                */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-[0_12px_40px_rgba(37,99,235,0.06)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Glowing Circular Mic Button */}
            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center shrink-0">
                {/* Concentric ambient glowing rings */}
                <div
                  className={`absolute inset-0 rounded-full transition-all ${
                    isRecording
                      ? 'bg-rose-500/20 scale-150 animate-ping'
                      : 'bg-blue-500/10 scale-125'
                  }`}
                />
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center p-2.5 transition-all ${
                    isRecording ? 'bg-rose-100' : 'bg-blue-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={processingAI || confirmingUpdates}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 shadow-blue-500/30'
                    } ${processingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isRecording ? (
                      <Square className="w-6 h-6 fill-white" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Example Prompt */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {isRecording ? (
                    <span className="text-rose-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                      Listening... ({formatSeconds(recordingTime)})
                    </span>
                  ) : processingAI ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Decoding voice note with AI...
                    </span>
                  ) : (
                    'Tap to Speak'
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Say something like:
                </p>

                {/* Example pill chip that pre-fills and tests */}
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTextInput('Update rice count to 50')}
                    className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors"
                  >
                    &ldquo;Update rice count to 50&rdquo;
                  </button>

                  <button
                    type="button"
                    onClick={() => setTextInput('Sold 5 packets of milk and 2 kg sugar')}
                    className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    &ldquo;Sold 5 packets of milk and 2 kg sugar&rdquo;
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Soundwave Graphic Bars */}
            <div className="flex items-center justify-end gap-1.5 h-12 px-2 shrink-0 self-center">
              {[4, 8, 14, 22, 32, 40, 28, 18, 10, 16, 26, 36, 24, 12, 6].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: isRecording ? `${Math.min(48, Math.max(8, (h * (1 + (i % 3))) % 44))}px` : `${h}px`,
                  }}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isRecording
                      ? 'bg-gradient-to-t from-rose-500 to-indigo-500 animate-pulse'
                      : 'bg-gradient-to-t from-blue-400 via-indigo-400 to-purple-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Text Input Fallback Bar */}
          <form onSubmit={handleTextSubmit} className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type voice command manually here (e.g. Sold 2 packets of milk)..."
                disabled={processingAI || isRecording || confirmingUpdates}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!textInput.trim() || processingAI || confirmingUpdates}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CONFIRMATION REVIEW CARD MODAL (Crucial Step)                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        {reviewData && (
          <section className="bg-white rounded-3xl p-6 border-2 border-blue-500 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  <Sparkles className="w-3.5 h-3.5" /> AI Review Card
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Confirm Inventory Updates
                </h3>
              </div>
              <button
                onClick={() => setReviewData(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transcript Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold text-slate-700">What the AI heard: </span>
                <span className="text-blue-700 italic font-semibold">&ldquo;{reviewData.transcript}&rdquo;</span>
              </div>
            </div>

            {/* Insufficient Stock Warning Banner */}
            {hasInsufficientStock && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <strong>Insufficient Stock Alert:</strong> One or more items exceed current store stock. Please reduce the quantity or click &ldquo;Cap to available&rdquo; below.
                </div>
              </div>
            )}

            {/* Unrecognized items alert */}
            {reviewData.unrecognizedItems.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Unrecognized items:</strong> {reviewData.unrecognizedItems.join(', ')} (not found in catalog).
                </span>
              </div>
            )}

            {/* Proposed Changes Rows */}
            {reviewData.changes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No matching product changes to confirm.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewData.changes.map((item, idx) => {
                  const isExceedingStock = item.action === 'SALE' && item.quantity > item.currentStock;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl bg-slate-50/70 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isExceedingStock
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-slate-900 text-base">{item.productName}</span>
                          <button
                            type="button"
                            onClick={() => toggleAction(idx)}
                            title="Click to toggle SALE / RESTOCK"
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                              item.action === 'SALE'
                                ? 'bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {item.action === 'SALE' ? (
                              <>
                                <ArrowDownRight className="w-3 h-3 text-rose-600" /> -{item.quantity} {item.unit} SALE
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-emerald-600" /> +{item.quantity} {item.unit} RESTOCK
                              </>
                            )}
                          </button>
                        </div>

                        {/* Stock projection */}
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                          <span>Current: <strong className="text-slate-800">{item.currentStock} {item.unit}</strong></span>
                          <span>→</span>
                          <span>
                            New Projected:{' '}
                            <strong
                              className={
                                isExceedingStock
                                  ? 'text-rose-600 font-bold'
                                  : item.newProjectedStock < 10
                                  ? 'text-amber-600 font-bold'
                                  : 'text-emerald-600 font-bold'
                              }
                            >
                              {item.newProjectedStock} {item.unit}
                            </strong>
                          </span>
                          {isExceedingStock && (
                            <button
                              type="button"
                              onClick={() => capToAvailableStock(idx)}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-800 font-bold"
                            >
                              Cap to available ({item.currentStock} {item.unit})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stepper Quantity & Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateChangeQuantity(idx, Math.max(0.5, item.quantity - 1))}
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-l-xl"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={item.quantity}
                            onChange={(e) => updateChangeQuantity(idx, parseFloat(e.target.value) || 0)}
                            className="w-14 bg-transparent text-center font-bold text-sm text-slate-800 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateChangeQuantity(idx, item.quantity + 1)}
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-r-xl"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs text-slate-500 w-10 font-medium">{item.unit}</span>

                        <button
                          type="button"
                          onClick={() => removeChangeItem(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmUpdates}
                disabled={confirmingUpdates || reviewData.changes.length === 0 || hasInsufficientStock}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 font-bold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
              >
                {confirmingUpdates ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Updating ledger...
                  </>
                ) : hasInsufficientStock ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-200" />
                    Fix Insufficient Stock to Confirm
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm &amp; Update Stock
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setReviewData(null)}
                disabled={confirmingUpdates}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* THREE METRICS ROW (Product Types, Low Stock, Leftover Stock)  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Product Types */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Types</p>
                <h4 className="text-3xl font-black text-slate-900 mt-0.5">{productTypesCount}</h4>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Low Stock Alerts (Warm Peach / Orange Gradient) */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 rounded-3xl p-6 border border-amber-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700/70 uppercase tracking-wider">Low Stock Alerts</p>
                <h4 className="text-3xl font-black text-slate-900 mt-0.5">{lowStockProducts.length}</h4>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-amber-100/60 flex justify-end">
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Leftover Stock (Mint / Green Soft Gradient) */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 rounded-3xl p-6 border border-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700/70 uppercase tracking-wider">Leftover Stock</p>
                <h4 className="text-3xl font-black text-slate-900 mt-0.5">{leftoverStockTotal}</h4>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-emerald-100/60 flex justify-end">
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BOTTOM SECTION: Business Overview Chart & Recent Activity     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Business Overview Wave Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">Business Overview</h3>
              </div>

              {/* Filter Dropdown */}
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <span>This Month</span>
                <span>▾</span>
              </div>
            </div>

            {/* Custom SVG Wave Chart exactly like design */}
            <div className="h-56 relative w-full pt-4">
              {/* Tooltip Badge at Sun point */}
              <div className="absolute right-6 top-2 z-10 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 shadow-sm flex items-center gap-1">
                <span>120 items</span>
              </div>

              <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="0" y1="0" x2="500" y2="0" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#E2E8F0" strokeWidth="1" />

                {/* Area Gradient Fill */}
                <path
                  d="M 0,100 C 50,100 60,70 100,70 C 140,70 160,95 200,95 C 240,95 260,50 300,50 C 340,50 360,75 400,75 C 440,75 460,30 500,30 L 500,150 L 0,150 Z"
                  fill="url(#chartGradient)"
                />

                {/* Smooth Curve Stroke */}
                <path
                  d="M 0,100 C 50,100 60,70 100,70 C 140,70 160,95 200,95 C 240,95 260,50 300,50 C 340,50 360,75 400,75 C 440,75 460,30 500,30"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Circle Dots on Data Points */}
                <circle cx="100" cy="70" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="200" cy="95" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="300" cy="50" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="400" cy="75" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="500" cy="30" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="3" />
              </svg>

              {/* Days of Week Labels */}
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Activity Items List */}
              <div className="space-y-4 pt-2">
                {recentLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No recent activities recorded.
                  </div>
                ) : (
                  recentLogs.map((log) => {
                    const isRestock = log.actionType === 'RESTOCK';

                    return (
                      <div key={log.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isRestock ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-semibold text-slate-800 truncate">
                            {log.productName}:{' '}
                            <span className="font-normal text-slate-500">
                              {isRestock ? `+${log.quantityChanged}` : log.quantityChanged} units
                            </span>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                Inspect complete product catalog →
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PRODUCT CATALOG TABLE (When clicking Products or Manage)     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'products' || activeTab === 'alerts') && (
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {activeTab === 'alerts' ? 'Low Stock Alerts' : 'Complete Inventory'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Showing {filteredProducts.length} items • Real-time database sync
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Table */}
            {loadingProducts ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading catalog items...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No products found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-2xl overflow-hidden border border-slate-100 bg-white">
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= 20;

                  return (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-base">{p.name}</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                            {p.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          ₹{p.pricePerUnit.toFixed(2)} / {p.unit}
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">
                            {p.currentStock}{' '}
                            <span className="text-xs font-semibold text-slate-400">{p.unit}</span>
                          </div>
                          {isLow ? (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
