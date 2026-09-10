import React, { useState, useEffect } from 'react';
import { UserAccount, Product, SaleTransaction } from './types';
import { SEED_USERS, SEED_PRODUCTS, SEED_TRANSACTIONS } from './data/seedData';
import { Header } from './components/Header';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { SetupApiModal } from './components/SetupApiModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ProductManagementModal } from './components/ProductManagementModal';
import { SaleTransactionModal } from './components/SaleTransactionModal';
import { VoiceConsultationModal } from './components/VoiceConsultationModal';
import { JuraganDashboardView } from './components/JuraganDashboardView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { AiContentGeneratorView } from './components/AiContentGeneratorView';
import { ProductListView } from './components/ProductListView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { AdminDashboardView } from './components/AdminDashboardView';
import {
  LayoutDashboard,
  Sparkles,
  Share2,
  Package,
  ReceiptText,
  ShieldCheck,
  Mic,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

export default function App() {
  // Local storage initialization for persistent state across session
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('juragan_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const savedId = localStorage.getItem('juragan_current_user_id');
    const matched = users.find((u) => u.id === savedId);
    return matched || users[0];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('juragan_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved products lack imageUrls, merge seed images
        const hasImages = parsed.some((p: Product) => Boolean(p.imageUrl));
        if (hasImages) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return SEED_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('juragan_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [productFilter, setProductFilter] = useState<'all' | 'low-stock'>('all');
  const [highlightProductId, setHighlightProductId] = useState<string | undefined>(undefined);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleOpenVoiceConsultation = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {}
    }
    setIsVoiceModalOpen(true);
  };
  const [apiConnected, setApiConnected] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('juragan_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('juragan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('juragan_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('juragan_current_user_id', currentUser.id);
  }, [currentUser]);

  // Test Firebase Firestore connection & listen to Firebase Auth changes
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser((prev) => ({
          ...prev,
          isGoogleLinked: true,
          googleEmail: fbUser.email || prev.googleEmail,
          name: fbUser.displayName || prev.name,
          photoUrl: fbUser.photoURL || prev.photoUrl,
          firebaseUid: fbUser.uid,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Check health and Gemini API key status from server
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiConnected(Boolean(data.hasGeminiKey));
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  const isAdmin = currentUser.role === 'admin';

  // Filter products and transactions based on active role
  const userProducts = isAdmin
    ? products
    : products.filter((p) => p.userId === currentUser.id);

  const userTransactions = isAdmin
    ? transactions
    : transactions.filter((t) => t.userId === currentUser.id);

  // Google Login Handlers
  const handleLinkGoogle = (
    googleEmail: string,
    name: string,
    photoUrl?: string,
    firebaseUid?: string
  ) => {
    const updatedUser: UserAccount = {
      ...currentUser,
      isGoogleLinked: true,
      googleEmail,
      name: name || currentUser.name,
      photoUrl: photoUrl || currentUser.photoUrl,
      firebaseUid: firebaseUid || currentUser.firebaseUid,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  const handleUnlinkGoogle = () => {
    const updatedUser: UserAccount = {
      ...currentUser,
      isGoogleLinked: false,
      googleEmail: undefined,
      photoUrl: undefined,
      firebaseUid: undefined,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  // Handlers
  const handleSaveProduct = (newProdData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: 'prod-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSaveTransaction = (newTxData: Omit<SaleTransaction, 'id'>) => {
    const newTx: SaleTransaction = {
      ...newTxData,
      id: 'tx-' + Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Automatically reduce product inventory
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === newTxData.productId) {
          return {
            ...p,
            stock: Math.max(0, p.stock - newTxData.quantity),
            updatedAt: newTxData.date,
          };
        }
        return p;
      })
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: u.status === 'verified' ? 'active' : 'verified',
          };
        }
        return u;
      })
    );
  };

  const handleInspectStore = (targetUser: UserAccount) => {
    setCurrentUser(targetUser);
    setActiveTab('dashboard');
  };

  const handleNavigateToProducts = (filter: 'all' | 'low-stock' = 'all', highlightId?: string) => {
    setProductFilter(filter);
    setHighlightProductId(highlightId);
    setActiveTab('products');
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header with Minimalist Profile Menu & Google Sign-In */}
      <Header
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
        onOpenApiSetup={() => setIsApiModalOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
        onOpenVoiceConsultation={handleOpenVoiceConsultation}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (Apple-style segmented control) */}
        <div className="flex items-center justify-between overflow-x-auto pb-1 border-b border-zinc-200/80 gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/70 rounded-2xl shrink-0">
            {isAdmin ? (
              <>
                <button
                  id="tab-admin-overview"
                  onClick={() => setActiveTab('admin-overview')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'admin-overview' || activeTab === 'dashboard'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Ringkasan Platform &amp; Audit AI</span>
                </button>

                <button
                  id="tab-admin-products"
                  onClick={() => {
                    setProductFilter('all');
                    setHighlightProductId(undefined);
                    setActiveTab('products');
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'products'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-zinc-600" />
                  <span>Semua Produk UMKM</span>
                </button>

                <button
                  id="tab-admin-transactions"
                  onClick={() => setActiveTab('transactions')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'transactions'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ReceiptText className="w-4 h-4 text-zinc-600" />
                  <span>Semua Transaksi Platform</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-juragan-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dashboard</span>
                </button>

                <button
                  id="tab-juragan-advisor"
                  onClick={() => setActiveTab('advisor')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'advisor'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Advisor</span>
                </button>

                <button
                  id="tab-juragan-content"
                  onClick={() => setActiveTab('content')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'content'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Konten</span>
                </button>

                <button
                  id="tab-juragan-products"
                  onClick={() => {
                    setProductFilter('all');
                    setHighlightProductId(undefined);
                    setActiveTab('products');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'products'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Produk &amp; Stok</span>
                </button>

                <button
                  id="tab-juragan-transactions"
                  onClick={() => setActiveTab('transactions')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all tactile-btn ${
                    activeTab === 'transactions'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ReceiptText className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Riwayat Penjualan</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Voice Consultation Trigger in Tab Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-voice-consultation-tab"
              onClick={handleOpenVoiceConsultation}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-800 shadow-xs border border-zinc-200 active:scale-[0.98] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span>Konsultasi Suara</span>
            </button>
          </div>
        </div>

        {/* Dynamic Views Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (isAdmin ? '-admin' : '-' + currentUser.id)}
            initial={{ opacity: 0, transform: 'translateY(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-6px)' }}
            transition={{ duration: 0.16, ease: easeOutCurve }}
          >
            {isAdmin && (activeTab === 'admin-overview' || activeTab === 'dashboard') && (
              <AdminDashboardView
                users={users}
                allProducts={products}
                allTransactions={transactions}
                onInspectStore={handleInspectStore}
                onToggleUserStatus={handleToggleUserStatus}
              />
            )}

            {!isAdmin && activeTab === 'dashboard' && (
              <JuraganDashboardView
                currentUser={currentUser}
                products={userProducts}
                transactions={userTransactions}
                onNavigateToAdvisor={() => setActiveTab('advisor')}
                onNavigateToContent={() => setActiveTab('content')}
                onNavigateToProducts={handleNavigateToProducts}
                onNavigateToTransactions={() => setActiveTab('transactions')}
                onOpenAddProduct={() => setIsProductModalOpen(true)}
                onOpenAddSale={() => setIsSaleModalOpen(true)}
              />
            )}

            {activeTab === 'advisor' && !isAdmin && (
              <AiAdvisorView
                currentUser={currentUser}
                products={userProducts}
                transactions={userTransactions}
                onNavigateToContent={() => setActiveTab('content')}
                onOpenAddProduct={() => setIsProductModalOpen(true)}
                onOpenAddSale={() => setIsSaleModalOpen(true)}
                onOpenVoiceConsultation={handleOpenVoiceConsultation}
              />
            )}

            {activeTab === 'content' && !isAdmin && (
              <AiContentGeneratorView
                currentUser={currentUser}
                products={userProducts}
              />
            )}

            {activeTab === 'products' && (
              <ProductListView
                products={userProducts}
                initialFilter={productFilter}
                highlightProductId={highlightProductId}
                onOpenAddProduct={() => setIsProductModalOpen(true)}
                onOpenAddSaleForProduct={(p) => setIsSaleModalOpen(true)}
                onGenerateContentForProduct={(p) => setActiveTab('content')}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionHistoryView
                transactions={userTransactions}
                onOpenAddSale={() => setIsSaleModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setActiveTab('dashboard');
        }}
      />

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        currentUser={currentUser}
        onLinkGoogle={handleLinkGoogle}
        onUnlinkGoogle={handleUnlinkGoogle}
      />

      <SetupApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiConnected={apiConnected}
      />

      <ProductManagementModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        userId={currentUser.id}
        onSaveProduct={handleSaveProduct}
      />

      <SaleTransactionModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        userId={currentUser.id}
        products={userProducts}
        onSaveTransaction={handleSaveTransaction}
      />

      <VoiceConsultationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentUser={currentUser}
        products={userProducts}
        transactions={userTransactions}
      />

      {/* Floating Voice Assistant Trigger (White Mode) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="btn-floating-voice-ai"
          onClick={handleOpenVoiceConsultation}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md text-zinc-900 shadow-lg hover:shadow-xl border border-zinc-200/90 hover:border-zinc-300 group transition-all duration-200 active:scale-[0.97]"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-4 h-4 rounded-full bg-blue-400/30 animate-ping" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold flex items-center gap-1.5 text-zinc-900">
              <span>Tanya Juragan AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">
              Konsultasi &amp; Cek Stok Suara
            </div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500">
        <p>
          <strong>Juragan.AI</strong> — AI Business Companion untuk UMKM Mikro &amp; Kecil Indonesia
        </p>
        <p className="text-[11px] text-zinc-400 mt-1">
          Simpel, Cepat, Terintegrasi, &amp; Bebas Glitch.
        </p>
      </footer>
    </div>
  );
}
