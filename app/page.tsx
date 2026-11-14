'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Mic,
  Square,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  Package,
  Layers,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Volume2,
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

export default function ShopkeeperInventoryApp() {
  // Inventory state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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

  // 2. Audio Recording (MediaRecorder API)
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

  const handleAIResponse = useCallback((data: ProcessVoiceResponse) => {
    if (!data.proposedChanges || data.proposedChanges.length === 0) {
      showFeedback(
        'info',
        `Heard: "${data.transcript}", but no catalog inventory changes were matched.`
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
  }, [showFeedback]);

  // 3. Process Audio with /api/process-voice
  const processAudio = async (audioBlob: Blob) => {
    try {
      setProcessingAI(true);
      showFeedback('info', 'Analyzing speech with AI parser...');

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

  // 4. Process Text fallback
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

  // 5. Review Card item edit / delete handlers
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

  // 6. Confirm changes -> calls /api/inventory/confirm
  const handleConfirmUpdates = async () => {
    if (!reviewData || reviewData.changes.length === 0) return;

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

      // Instantly update inventory state with fresh data from server
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

  // 7. Computed Categories & Filtered Inventory
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
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

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
    return logs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 8);
  }, [products]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                STOCKS
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                  Shopkeeper Voice AI
                </span>
              </h1>
              <p className="text-xs text-slate-400">Speak in Hindi, English, or Hinglish</p>
            </div>
          </div>

          <button
            onClick={fetchInventory}
            disabled={loadingProducts}
            title="Refresh Inventory"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loadingProducts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 transition-all shadow-lg ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            )}
            <p className="text-sm font-medium flex-1">{feedback.message}</p>
          </div>
        )}

        {/* SECTION 1: VOICE RECORDER & TEXT FALLBACK */}
        <section className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl text-center relative overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" /> Tap to Record Voice Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Example: <span className="italic text-slate-300">&ldquo;Sold 5 packets of milk and 2 kg sugar, added 10 bags of rice&rdquo;</span>
            </p>
          </div>

          {/* Large Touch Target Microphone Button */}
          <div className="flex flex-col items-center justify-center py-3">
            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                  <div className="absolute -inset-3 rounded-full border-2 border-rose-500/40 animate-pulse" />
                </>
              )}

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={processingAI}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all shadow-2xl relative z-10 active:scale-95 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-400/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 ring-4 ring-emerald-500/20 hover:ring-emerald-500/40'
                } ${processingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-10 h-10 mb-1 fill-white" />
                    <span className="text-xs uppercase tracking-wider">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10 mb-1" />
                    <span className="text-xs uppercase tracking-wider">Record</span>
                  </>
                )}
              </button>
            </div>

            {/* Recording Timer & Waveform Effect */}
            {isRecording ? (
              <div className="mt-4 flex items-center gap-2 text-rose-400 font-mono text-base font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Recording: {formatSeconds(recordingTime)}
              </div>
            ) : processingAI ? (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium text-sm animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                AI is parsing inventory changes...
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-400">Tap to start speaking, tap again to process</div>
            )}
          </div>

          {/* Quick Voice Prompt Examples */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Try saying:</span>
            {[
              'Sold 2 packets of milk',
              'Sold 1.5 kg sugar',
              'Restocked 20 kg rice',
              'Sold 3 soaps and 1 tea',
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTextInput(sample)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition-colors"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>

          {/* Text Input Fallback */}
          <form onSubmit={handleTextSubmit} className="mt-5 pt-4 border-t border-slate-700/60 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type here (e.g. 5 milk sale, 10 rice restock)..."
              disabled={processingAI || isRecording}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || processingAI}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm text-white flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </section>

        {/* SECTION 2: CONFIRMATION MODAL / REVIEW CARD (CRUCIAL STEP) */}
        {reviewData && (
          <section className="bg-slate-800 border-2 border-emerald-500/60 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> AI Review Card
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Confirm Inventory Updates
                </h3>
              </div>
              <button
                onClick={() => setReviewData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                title="Cancel Review"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Transcript Preview */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700 flex items-start gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-slate-300">What the AI heard: </span>
                <span className="text-emerald-300 italic font-medium">&ldquo;{reviewData.transcript}&rdquo;</span>
              </div>
            </div>

            {/* Unrecognized items alert */}
            {reviewData.unrecognizedItems.length > 0 && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Unrecognized items:</strong> {reviewData.unrecognizedItems.join(', ')} (not found in current catalog).
                </span>
              </div>
            )}

            {/* Proposed Changes List / Table */}
            {reviewData.changes.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                No matching product changes to confirm.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewData.changes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Product & Action Badge */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-base">{item.productName}</span>
                        <button
                          type="button"
                          onClick={() => toggleAction(idx)}
                          title="Click to toggle SALE / RESTOCK"
                          className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border cursor-pointer ${
                            item.action === 'SALE'
                              ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                          }`}
                        >
                          {item.action === 'SALE' ? (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-rose-400" /> -{item.quantity} {item.unit} SALE
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> +{item.quantity} {item.unit} RESTOCK
                            </>
                          )}
                        </button>
                      </div>

                      {/* Stock projection */}
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Current: <strong className="text-slate-200">{item.currentStock} {item.unit}</strong></span>
                        <span>→</span>
                        <span>
                          New Projected:{' '}
                          <strong
                            className={
                              item.newProjectedStock < 0
                                ? 'text-rose-400'
                                : item.newProjectedStock < 10
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {item.newProjectedStock} {item.unit}
                          </strong>
                        </span>
                        {item.newProjectedStock < 0 && (
                          <span className="text-rose-400 font-bold text-xs">(Insufficient Stock!)</span>
                        )}
                      </div>
                    </div>

                    {/* Stepper Quantity & Delete Row */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                        <button
                          type="button"
                          onClick={() => updateChangeQuantity(idx, Math.max(0.5, item.quantity - 1))}
                          className="p-2 hover:bg-slate-700 text-slate-300 rounded-l-lg"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={item.quantity}
                          onChange={(e) => updateChangeQuantity(idx, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-transparent text-center font-bold text-sm text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateChangeQuantity(idx, item.quantity + 1)}
                          className="p-2 hover:bg-slate-700 text-slate-300 rounded-r-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs text-slate-400 w-10">{item.unit}</span>

                      <button
                        type="button"
                        onClick={() => removeChangeItem(idx)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons: Confirm & Cancel */}
            <div className="pt-3 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmUpdates}
                disabled={confirmingUpdates || reviewData.changes.length === 0}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
              >
                {confirmingUpdates ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Committing to Database...
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
                className="py-3 px-5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* SECTION 3: LIVE INVENTORY DASHBOARD */}
        <section className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" /> Live Inventory
              </h2>
              <p className="text-xs text-slate-400">
                {products.length} Products in Catalog • Auto-refreshed upon voice updates
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Stock Table / Grid */}
          {loadingProducts ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Loading store catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No products found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="divide-y divide-slate-700/60 rounded-xl overflow-hidden border border-slate-700 bg-slate-900/60">
              {filteredProducts.map((p) => {
                const isLowStock = p.currentStock <= 20;
                const isCriticalStock = p.currentStock <= 10;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {p.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        ₹{p.pricePerUnit.toFixed(2)} / {p.unit}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          {p.currentStock}{' '}
                          <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                        </div>
                        {isCriticalStock ? (
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700/60">
                            Low Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] text-emerald-400">
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

        {/* SECTION 4: RECENT CONFIRMED VOICE TRANSACTIONS */}
        <section className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Recent Voice Transactions
            </h2>
            <span className="text-xs text-slate-400">Audit Trail</span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No recent transactions recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => {
                const isRestock = log.actionType === 'RESTOCK';

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isRestock
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                            : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                        }`}
                      >
                        {isRestock ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate">
                          {log.productName} ({log.actionType})
                        </div>
                        <div className="text-slate-400 truncate italic">
                          &ldquo;{log.rawTranscript}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div
                        className={`font-bold font-mono text-sm ${
                          isRestock ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
