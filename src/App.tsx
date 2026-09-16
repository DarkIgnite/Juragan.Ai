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
  Home,
  User,
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Dark Mode Theme State & Persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('juragan_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('juragan_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (
    newProdData: Omit<Product, 'id' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                ...newProdData,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        ...newProdData,
        id: 'prod-' + Date.now(),
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setEditingProduct(null);
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
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header with Minimalist Profile Menu & Google Sign-In */}
      <Header
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
        onOpenApiSetup={() => setIsApiModalOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
        onOpenVoiceConsultation={handleOpenVoiceConsultation}
        apiConnected={apiConnected}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddProduct={handleOpenAddProduct}
        onOpenAddSale={() => setIsSaleModalOpen(true)}
      />

      {/* Main Content Area - Uncrowded, Breathable Social Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-10">
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
                onOpenAddProduct={handleOpenAddProduct}
                onOpenAddSale={() => setIsSaleModalOpen(true)}
                onOpenVoiceConsultation={handleOpenVoiceConsultation}
              />
            )}

            {activeTab === 'advisor' && !isAdmin && (
              <AiAdvisorView
                currentUser={currentUser}
                products={userProducts}
                transactions={userTransactions}
                onNavigateToContent={() => setActiveTab('content')}
                onOpenAddProduct={handleOpenAddProduct}
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
                onOpenAddProduct={handleOpenAddProduct}
                onEditProduct={handleEditProduct}
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
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        userId={currentUser.id}
        productToEdit={editingProduct}
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

      {/* Mobile Bottom Navigation Bar (Instagram & Facebook Native Style) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800/90 py-1.5 px-3 flex items-center justify-around shadow-lg transition-colors"
      >
        <button
          id="btn-mobile-nav-home"
          onClick={() => setActiveTab(isAdmin ? 'admin-overview' : 'dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            activeTab === 'dashboard' || activeTab === 'admin-overview'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 hover:dark:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        <button
          id="btn-mobile-nav-products"
          onClick={() => {
            setProductFilter('all');
            setHighlightProductId(undefined);
            setActiveTab('products');
          }}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            activeTab === 'products'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 hover:dark:text-zinc-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Katalog</span>
        </button>

        {/* Center Raised Voice AI Button (Instagram Story gradient style) */}
        <button
          id="btn-mobile-nav-voice"
          onClick={handleOpenVoiceConsultation}
          className="-mt-5 p-1 rounded-full bg-white dark:bg-zinc-900 shadow-md border border-zinc-100 dark:border-zinc-800 focus:outline-none active:scale-95 transition-transform"
          title="Tanya Suara Juragan AI"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
        </button>

        <button
          id="btn-mobile-nav-transactions"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            activeTab === 'transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 hover:dark:text-zinc-200'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Riwayat</span>
        </button>

        <button
          id="btn-mobile-nav-profile"
          onClick={() => setIsRoleModalOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 hover:dark:text-zinc-200"
          title="Ganti Toko / Profil"
        >
          {currentUser.photoUrl ? (
            <img
              src={currentUser.photoUrl}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">Profil</span>
        </button>
      </nav>

      {/* Floating Voice Assistant Trigger (Desktop Only) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40">
        <button
          id="btn-floating-voice-ai"
          onClick={handleOpenVoiceConsultation}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-900 dark:text-zinc-100 shadow-lg hover:shadow-xl border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 group transition-all duration-200 active:scale-[0.97]"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-4 h-4 rounded-full bg-blue-400/30 animate-ping" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
              <span>Tanya Juragan AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Konsultasi &amp; Cek Stok Suara
            </div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 mb-14 md:mb-0 transition-colors">
        <p>
          <strong className="text-zinc-800 dark:text-zinc-200">Juragan.AI</strong> — AI Business Companion untuk UMKM Mikro &amp; Kecil Indonesia
        </p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
          Simpel, Cepat, Terintegrasi, &amp; Bebas Glitch.
        </p>
      </footer>
    </div>
  );
}
