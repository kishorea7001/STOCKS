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
  BarChart2,
  X,
  ArrowRight,
  PlusCircle,
  Zap,
  MessageSquare,
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

type ModalType = 'none' | 'products' | 'alerts' | 'leftover' | 'history' | 'settings' | 'about';

export default function TalkStockExactUI() {
  // Navigation / Modal state
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'leftover' | 'alerts' | 'settings' | 'about'>('home');
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  // Inventory state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // New Product Form state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Grains & Staples');
  const [newProductStock, setNewProductStock] = useState('20');
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [newProductPrice, setNewProductPrice] = useState('50');
  const [creatingProduct, setCreatingProduct] = useState(false);

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

  const openView = (type: ModalType) => {
    setActiveModal(type);
    if (type !== 'none' && type !== 'history') {
      setActiveTab(type);
    }
  };

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

  // Quick Restock an item directly from Alerts modal
  const handleQuickRestock = async (productId: string, currentStock: number, unit: string) => {
    try {
      const restockQty = 10;
      const res = await fetch(`/api/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: currentStock + restockQty,
          rawTranscript: `Quick Restock: +${restockQty} ${unit}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restock');

      showFeedback('success', `✓ Restocked +${restockQty} ${unit} successfully!`);
      await fetchInventory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error during restock';
      showFeedback('error', msg);
    }
  };

  // Create new product form submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    try {
      setCreatingProduct(true);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName.trim(),
          category: newProductCategory,
          currentStock: parseFloat(newProductStock) || 0,
          unit: newProductUnit,
          pricePerUnit: parseFloat(newProductPrice) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      showFeedback('success', `✓ Added new product: ${data.data.name}`);
      setNewProductName('');
      setShowAddProductForm(false);
      await fetchInventory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error creating product';
      showFeedback('error', msg);
    } finally {
      setCreatingProduct(false);
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

  const totalValuation = useMemo(() => {
    return Math.round(products.reduce((acc, p) => acc + p.currentStock * p.pricePerUnit, 0));
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
      const matchesAlerts = activeModal === 'alerts' ? product.currentStock <= 20 : true;
      return matchesSearch && matchesCategory && matchesAlerts;
    });
  }, [products, searchQuery, selectedCategory, activeModal]);

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
      .slice(0, 10);
  }, [products]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-800 font-sans p-0 sm:p-2 md:p-4 flex flex-col items-center justify-center">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* WINDOW FRAME (Matching exact desktop app window in figure)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1240px] bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-700/40 overflow-hidden flex flex-col">
        {/* Dark OS Window Title Bar */}
        <div className="bg-[#111827] text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs select-none border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
              T
            </div>
            <span className="font-semibold text-slate-200">TalkStock</span>
          </div>

          {/* Window action controls */}
          <div className="flex items-center gap-3 text-slate-400">
            <span className="w-3 h-0.5 bg-slate-400 inline-block cursor-pointer hover:bg-white" />
            <span className="w-2.5 h-2.5 border border-slate-400 inline-block cursor-pointer hover:border-white" />
            <span className="text-sm leading-none cursor-pointer hover:text-white">✕</span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* APP BODY (Left Sidebar + Right Dashboard)                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row bg-[#F8FAFD] min-h-[760px]">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* LEFT SIDEBAR (Soft Ice-Blue Glass matching the image)        */}
          {/* ───────────────────────────────────────────────────────────── */}
          <aside className="w-full md:w-60 bg-[#EEF3FA] border-r border-[#DDE5F2] flex flex-col justify-between p-5 shrink-0">
            <div className="space-y-6">
              {/* Logo Header: 3D Blue Cube + TalkStock */}
              <div
                className="flex items-center space-x-3 cursor-pointer pt-1"
                onClick={() => {
                  setActiveTab('home');
                  setActiveModal('none');
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="#3B82F6" fillOpacity="0.15" stroke="#2563EB" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M24 4V24M24 24L42 14M24 24L6 14" stroke="#2563EB" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M24 24V44" stroke="#2563EB" strokeWidth="3"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#0F172A] leading-tight">
                    TalkStock
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                    Smart Inventory,
                    <br />
                    Powered by Voice
                  </p>
                </div>
              </div>

              {/* Sidebar Nav Links */}
              <nav className="space-y-1 pt-1">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setActiveModal('none');
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeTab === 'home' && activeModal === 'none'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => openView('products')}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeModal === 'products'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span>Products</span>
                </button>

                <button
                  onClick={() => openView('leftover')}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeModal === 'leftover'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Leftover Stock</span>
                </button>

                <button
                  onClick={() => openView('alerts')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeModal === 'alerts'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Bell className="w-4 h-4" />
                    <span>Alerts</span>
                  </div>
                  {lowStockProducts.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-black flex items-center justify-center">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => openView('settings')}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeModal === 'settings'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => openView('about')}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    activeModal === 'about'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </button>
              </nav>
            </div>

            {/* Lower Sidebar: Voice Ready Card & Light Mode Toggle */}
            <div className="space-y-3 pt-6">
              {/* Voice Ready Card - Organized sideways */}
              <div
                onClick={isRecording ? stopRecording : startRecording}
                className="bg-white/90 hover:bg-white rounded-2xl p-3.5 border border-blue-100 shadow-2xs flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isRecording ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse text-rose-600' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-800 leading-tight">
                    {isRecording ? 'Listening...' : 'Voice Ready'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                    {isRecording ? `${formatSeconds(recordingTime)} elapsed` : 'Say something...'}
                  </div>
                  {/* Animated sound waves sideways */}
                  <div className="flex items-center gap-0.5 h-3 mt-1.5">
                    {[6, 12, 18, 10, 16, 8, 14, 6].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          height: isRecording ? `${Math.min(12, Math.max(3, (h * 1.3) % 12))}px` : `${Math.round(h * 0.55)}px`,
                        }}
                        className={`w-0.5 rounded-full transition-all duration-200 ${isRecording ? 'bg-rose-500' : 'bg-blue-500'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Light Mode Dropdown Button */}
              <button
                onClick={() => showFeedback('info', 'Active theme: Light Mode')}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-3.5 rounded-2xl border border-slate-200/80 text-xs font-bold flex items-center justify-between shadow-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </div>
                <span className="text-slate-400 text-[10px]">▾</span>
              </button>
            </div>
          </aside>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* MAIN DASHBOARD CONTENT AREA                                   */}
          {/* ───────────────────────────────────────────────────────────── */}
          <main className="flex-1 p-5 sm:p-7 space-y-5 overflow-y-auto max-w-5xl">
            {/* Top Greeting Bar */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Welcome to TalkStock
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Manage your business inventory with the power of voice.
                </p>
              </div>

              {/* Top Right Green Online Status Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>

            {/* Horizontal Navigation Tabs (Icons Organized Sideways in a Row) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setActiveModal('none');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'home' && activeModal === 'none'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => openView('products')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'products'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Products ({productTypesCount})</span>
              </button>

              <button
                onClick={() => openView('leftover')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'leftover'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Leftover Stock</span>
              </button>

              <button
                onClick={() => openView('alerts')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'alerts'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts</span>
                {lowStockProducts.length > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => openView('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'history'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => openView('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'settings'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => openView('about')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModal === 'about'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>About</span>
              </button>
            </div>

            {/* Global Feedback Banner */}
            {feedback && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all shadow-sm ${
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
                <p className="text-xs sm:text-sm font-medium flex-1">{feedback.message}</p>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* ROW 1: THREE METRICS CARDS (ICONS ORGANIZED SIDEWAYS)         */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Products - Icon on Left, Text on Right */}
              <div
                onClick={() => openView('products')}
                className="bg-gradient-to-br from-[#EEF5FF] to-[#E2EDFE] rounded-2xl p-4.5 border border-blue-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/90 border border-blue-200/80 shadow-2xs flex items-center justify-center shrink-0 text-blue-600">
                    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="#3B82F6" fillOpacity="0.25" stroke="#2563EB" strokeWidth="3" strokeLinejoin="round"/>
                      <path d="M24 4V24M24 24L42 14M24 24L6 14" stroke="#2563EB" strokeWidth="3" strokeLinejoin="round"/>
                      <path d="M24 24V44" stroke="#2563EB" strokeWidth="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Total Products</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-0.5">{productTypesCount}</div>
                  </div>
                </div>
                <div className="text-blue-600 text-xs font-bold flex items-center gap-0.5 opacity-80 hover:opacity-100">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Low Stock Alerts - Icon on Left, Text on Right */}
              <div
                onClick={() => openView('alerts')}
                className="bg-gradient-to-br from-[#EEFAF3] to-[#E0F7EB] rounded-2xl p-4.5 border border-emerald-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-2xs flex items-center justify-center shrink-0 text-emerald-600">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Low Stock Alerts</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-0.5">{lowStockProducts.length}</div>
                  </div>
                </div>
                <div className="text-emerald-700 text-xs font-bold flex items-center gap-0.5 opacity-80 hover:opacity-100">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: Leftover Stock - Icon on Left, Text on Right */}
              <div
                onClick={() => openView('leftover')}
                className="bg-gradient-to-br from-[#F5EFFE] to-[#EBE2FC] rounded-2xl p-4.5 border border-purple-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/90 border border-purple-200/80 shadow-2xs flex items-center justify-center shrink-0 text-purple-600">
                    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="#A855F7" fillOpacity="0.3" stroke="#9333EA" strokeWidth="3" strokeLinejoin="round"/>
                      <path d="M24 4V24M24 24L42 14M24 24L6 14" stroke="#9333EA" strokeWidth="3" strokeLinejoin="round"/>
                      <path d="M24 24V44" stroke="#9333EA" strokeWidth="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Leftover Stock</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-0.5">{leftoverStockTotal}</div>
                  </div>
                </div>
                <div className="text-purple-700 text-xs font-bold flex items-center gap-0.5 opacity-80 hover:opacity-100">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* ROW 2: QUICK ACTIONS (ICONS ORGANIZED SIDEWAYS)               */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Quick Actions</span>
                </div>
                <button
                  onClick={() => openView('history')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>See All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 4 Colored Action Buttons - Icons on Left, Text on Right */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Reset Demo */}
                <button
                  onClick={handleResetDemoData}
                  disabled={resettingDemo}
                  className="bg-[#EAF2FD]/90 hover:bg-[#EAF2FD] text-blue-900 border border-blue-200/70 rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/90 border border-blue-200/70 flex items-center justify-center shrink-0 shadow-2xs text-[#2563EB]">
                    <RotateCcw className={`w-4.5 h-4.5 ${resettingDemo ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">Reset Demo</span>
                    <span className="text-[10px] text-blue-600 font-semibold block">Restore stock</span>
                  </div>
                </button>

                {/* 2. Refresh */}
                <button
                  onClick={fetchInventory}
                  disabled={loadingProducts}
                  className="bg-[#EAF8F1]/90 hover:bg-[#EAF8F1] text-emerald-900 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/90 border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs text-[#059669]">
                    <RefreshCw className={`w-4.5 h-4.5 ${loadingProducts ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">Refresh</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Sync SQLite</span>
                  </div>
                </button>

                {/* 3. Settings */}
                <button
                  onClick={() => openView('settings')}
                  className="bg-[#F3EDFD]/90 hover:bg-[#F3EDFD] text-purple-900 border border-purple-200/70 rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/90 border border-purple-200/70 flex items-center justify-center shrink-0 shadow-2xs text-[#7C3AED]">
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">Settings</span>
                    <span className="text-[10px] text-purple-600 font-semibold block">Config &amp; AI</span>
                  </div>
                </button>

                {/* 4. Voice Command */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={processingAI || confirmingUpdates}
                  className="bg-[#ECF4FE]/90 hover:bg-[#ECF4FE] text-sky-900 border border-sky-200/70 rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-sm active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/90 border border-sky-200/70 flex items-center justify-center shrink-0 shadow-2xs text-[#2563EB]">
                    <Mic className={`w-4.5 h-4.5 ${isRecording ? 'animate-pulse text-rose-600' : ''}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">
                      {isRecording ? 'Stop Mic' : 'Voice Command'}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold block">Speak now</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* ROW 3: HERO VOICE BAR (Tap to Speak + Speech Bubble)          */}
            {/* ───────────────────────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-blue-100/50 via-sky-50/30 to-indigo-50/40 rounded-3xl p-5 border border-blue-200/70 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Concentric Circle Mic Button */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div
                    className={`w-18 h-18 rounded-full flex items-center justify-center p-2 transition-all ${
                      isRecording ? 'bg-rose-100' : 'bg-blue-100/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={processingAI || confirmingUpdates}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'
                          : 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-500/30'
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-5 h-5 fill-white" />
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Text prompts & speech bubble */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    {isRecording ? (
                      <span className="text-rose-600 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        Listening... ({formatSeconds(recordingTime)})
                      </span>
                    ) : processingAI ? (
                      <span className="text-blue-600 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Decoding voice note with AI...
                      </span>
                    ) : (
                      'Tap to Speak'
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Say natural voice commands or click an example prompt below:
                  </p>

                  {/* Interactive suggestion chips organized sideways */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTextInput('Update rice count to 50')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 border border-blue-200/80 shadow-2xs text-xs font-semibold cursor-pointer transition-all hover:border-blue-400 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>&ldquo;Update rice count to 50&rdquo;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextInput('Sold 5 packets of milk')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-600 border border-blue-200/80 shadow-2xs text-xs font-semibold cursor-pointer transition-all hover:border-emerald-400 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>&ldquo;Sold 5 packets of milk&rdquo;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextInput('2 kg sugar left')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-purple-600 border border-blue-200/80 shadow-2xs text-xs font-semibold cursor-pointer transition-all hover:border-purple-400 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>&ldquo;2 kg sugar left&rdquo;</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Text fallback input */}
              <form onSubmit={handleTextSubmit} className="mt-3.5 pt-3 border-t border-blue-200/60 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Or type inventory command here (e.g. 'Sold 5 packets milk and 2 kg sugar')..."
                  disabled={processingAI || isRecording || confirmingUpdates}
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || processingAI || confirmingUpdates}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </section>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* REVIEW CARD (When speech has proposed changes)               */}
            {/* ───────────────────────────────────────────────────────────── */}
            {reviewData && (
              <section className="bg-white rounded-3xl p-5 border-2 border-blue-500 shadow-xl space-y-4 animate-in fade-in duration-150">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      <Sparkles className="w-3 h-3" /> AI Review Card
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Confirm Inventory Updates
                    </h3>
                  </div>
                  <button
                    onClick={() => setReviewData(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-start gap-2.5">
                  <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">Heard: </span>
                    <span className="text-blue-700 italic font-semibold">&ldquo;{reviewData.transcript}&rdquo;</span>
                  </div>
                </div>

                {hasInsufficientStock && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>One or more items exceed current stock. Reduce quantity before confirming.</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {reviewData.changes.map((item, idx) => {
                    const isExceedingStock = item.action === 'SALE' && item.quantity > item.currentStock;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl bg-slate-50 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isExceedingStock ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-extrabold text-slate-900 text-sm">{item.productName}</span>
                            <button
                              type="button"
                              onClick={() => toggleAction(idx)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border cursor-pointer ${
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
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Current: {item.currentStock} {item.unit}</span>
                            <span>→</span>
                            <span className="font-bold text-slate-800">
                              New: {item.newProjectedStock} {item.unit}
                            </span>
                            {isExceedingStock && (
                              <button
                                type="button"
                                onClick={() => capToAvailableStock(idx)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 font-bold"
                              >
                                Cap to {item.currentStock}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateChangeQuantity(idx, Math.max(0.5, item.quantity - 1))}
                              className="p-1.5 hover:bg-slate-100 text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              value={item.quantity}
                              onChange={(e) => updateChangeQuantity(idx, parseFloat(e.target.value) || 0)}
                              className="w-12 bg-transparent text-center font-bold text-xs text-slate-800 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateChangeQuantity(idx, item.quantity + 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChangeItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmUpdates}
                    disabled={confirmingUpdates || hasInsufficientStock}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {confirmingUpdates ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating ledger...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm &amp; Update Stock
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewData(null)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* ROW 4: DASHBOARD OVERVIEW & RECENT ACTIVITY (SIDE-BY-SIDE)    */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Dashboard Overview Chart (2 Cols) */}
              <section className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <span>Dashboard Overview</span>
                  </div>

                  <div
                    onClick={() => showFeedback('info', 'Filter: This Month view')}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-slate-50"
                  >
                    <span>This Month</span>
                    <span className="text-[10px]">▾</span>
                  </div>
                </div>

                {/* Exact Smooth Curve Line Chart with Y-axis & X-axis */}
                <div className="h-44 relative w-full pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 580 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="dashboardAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Label Numbers */}
                    <text x="22" y="24" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="end">100</text>
                    <text x="22" y="74" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="end">50</text>
                    <text x="22" y="124" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="end">0</text>

                    {/* Horizontal grid lines */}
                    <line x1="30" y1="20" x2="570" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="30" y1="70" x2="570" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="30" y1="120" x2="570" y2="120" stroke="#E2E8F0" strokeWidth="1.5" />

                    {/* Area fill */}
                    <path
                      d="M 50,78 C 90,68 105,50 135,50 C 170,50 190,18 222,18 C 255,18 275,42 308,42 C 340,42 360,70 395,70 C 428,70 450,58 482,58 C 515,58 535,32 560,32 L 560,120 L 50,120 Z"
                      fill="url(#dashboardAreaGradient)"
                    />

                    {/* Smooth curved blue stroke */}
                    <path
                      d="M 50,78 C 90,68 105,50 135,50 C 170,50 190,18 222,18 C 255,18 275,42 308,42 C 340,42 360,70 395,70 C 428,70 450,58 482,58 C 515,58 535,32 560,32"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Circle points on line matching each day */}
                    <circle cx="50" cy="78" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="135" cy="50" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="222" cy="18" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="308" cy="42" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="395" cy="70" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="482" cy="58" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="560" cy="32" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />

                    {/* Weekday Axis aligned under each circle */}
                    <text x="50" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Mon</text>
                    <text x="135" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Tue</text>
                    <text x="222" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Wed</text>
                    <text x="308" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Thu</text>
                    <text x="395" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Fri</text>
                    <text x="482" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Sat</text>
                    <text x="560" y="142" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">Sun</text>
                  </svg>
                </div>
              </section>

              {/* Right Column: Recent Activity Feed (Sideways items) */}
              <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Recent Activity</span>
                    </div>
                    <button
                      onClick={() => openView('history')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  {/* Sideways Activity Items */}
                  <div className="space-y-2.5 pt-2">
                    {recentLogs.slice(0, 4).map((log, i) => (
                      <div
                        key={log.id || i}
                        onClick={() => openView('history')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            log.actionType === 'SALE' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`} />
                          <div className="truncate">
                            <span className="font-bold text-slate-800">{log.productName || 'Product'}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">
                              {log.actionType === 'SALE' ? `-${log.quantityChanged}` : `+${log.quantityChanged}`}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {recentLogs.length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No recent activity yet. Speak a voice note to start!
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openView('products')}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open Full Inventory</span>
                </button>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE MODALS (Open instantly on button clicks)          */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. PRODUCTS MANAGEMENT MODAL */}
      {activeModal === 'products' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Product Management</h3>
                  <p className="text-xs text-slate-500">{products.length} Products registered in catalog</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddProductForm(!showAddProductForm)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{showAddProductForm ? 'Close Form' : 'Add Item'}</span>
                </button>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inline Add Product Form */}
            {showAddProductForm && (
              <form onSubmit={handleCreateProduct} className="p-4 my-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">Add New Inventory Item</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    placeholder="Product Name"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks & Bakery">Snacks & Bakery</option>
                    <option value="Oils & Ghee">Oils & Ghee</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household">Household</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unit (kg/packets)"
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProduct || !newProductName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {creatingProduct ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Search & Filter */}
            <div className="py-3 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                      selectedCategory === c
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{p.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                        {p.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">₹{p.pricePerUnit.toFixed(2)} / {p.unit}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-base font-black text-slate-900">
                        {p.currentStock} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                      </div>
                      {p.currentStock <= 20 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600">In Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LOW STOCK ALERTS MODAL */}
      {activeModal === 'alerts' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-200 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Low Stock Alerts</h3>
                  <p className="text-xs text-amber-700 font-medium">{lowStockProducts.length} items need replenishment</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  🎉 No low stock alerts! All items have adequate inventory.
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-xs text-amber-800 font-medium">
                        Only <span className="font-extrabold">{p.currentStock} {p.unit}</span> left!
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(p.id, p.currentStock, p.unit)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Restock (+10)</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. LEFTOVER STOCK MODAL */}
      {activeModal === 'leftover' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Leftover Stock &amp; Valuation</h3>
                  <p className="text-xs text-emerald-700 font-medium">Total store merchandise summary</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Units</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{leftoverStockTotal} units</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Valuation</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalValuation.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Distribution</h4>
                {products.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="font-extrabold text-blue-600">{p.currentStock} {p.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">App Settings</h3>
                  <p className="text-xs text-slate-500">Configure speech parsing and preferences</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">AI Speech Engine</span>
                <p className="text-slate-500">Google Gemini 2.5 Flash (Multimodal Audio &amp; Text)</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Supported Languages</span>
                <p className="text-slate-500">Bilingual English, Hindi, and colloquial Hinglish (e.g. &ldquo;aadha kilo&rdquo;, &ldquo;becha&rdquo;)</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Low Stock Threshold</span>
                <p className="text-slate-500">Items with ≤ 20 units automatically trigger amber/red badges</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Database Engine</span>
                <p className="text-slate-500">Local SQLite with Prisma ORM (Atomic $transaction enabled)</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABOUT MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">About TalkStock</h3>
                  <p className="text-xs text-slate-500">Smart Inventory, Powered by Voice</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">TalkStock</strong> enables local shopkeepers and retail vendors to manage stock hands-free through spoken natural voice commands.
              </p>
              <p>
                Whether you speak in English, Hindi, or mixed Hinglish (*&ldquo;Sold 5 packets of milk and 2 kg sugar&rdquo;*), the AI extracts exact transaction types, matches the items against your live catalog, checks stock limits, and updates your inventory in an atomic database transaction.
              </p>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 font-medium">
                💡 Built for local hackathon speed using Next.js App Router, Prisma ORM, SQLite, and Gemini 2.5 Flash.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RECENT ACTIVITY / TRANSACTION HISTORY MODAL */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Recent Activity &amp; Logs</h3>
                  <p className="text-xs text-slate-500">Live audit feed of voice &amp; manual inventory actions</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 flex-1 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No transaction logs yet. Try speaking a command to log activity!
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.productName || 'Product'}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.actionType === 'SALE'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {log.actionType === 'SALE' ? `-${log.quantityChanged} SALE` : `+${log.quantityChanged} RESTOCK`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">&ldquo;{log.rawTranscript}&rdquo;</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
