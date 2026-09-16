import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  LayoutGrid,
  Package, 
  Printer, 
  ArrowUpRight, 
  Building2, 
  LogOut, 
  Server, 
  Plus, 
  MinusCircle,
  Users,
  FileText,
  Cloud,
  CloudOff,
  RefreshCw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserSession } from '../types';

export type ActiveTab = 'overview' | 'products' | 'printers' | 'withdrawals' | 'departments' | 'requesters' | 'purchases';

interface HeaderProps {
  user: UserSession;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProductModal: () => void;
  onOpenPrinterModal: () => void;
  onOpenWithdrawalModal: () => void;
  onOpenDepartmentModal: () => void;
  onOpenReportModal: () => void;
  onLogout: () => void;
  onManualSync?: () => void;
  productsCount?: number;
  lowStockCount?: number;
  purchasesCount?: number;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenProductModal,
  onOpenWithdrawalModal,
  onOpenReportModal,
  onLogout,
  onManualSync,
  productsCount = 0,
  lowStockCount = 0,
  isCloudConnected = true,
  isSyncing = false,
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const hoverScrollTimerRef = useRef<number | null>(null);

  const checkScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  // Update scroll indicator on mount, resize and scroll
  useEffect(() => {
    checkScroll();
    const el = tabsContainerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkScroll, { passive: true });

    // Enable horizontal scrolling with mouse wheel
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    // Initial check after render
    const t = setTimeout(checkScroll, 100);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkScroll);
      el.removeEventListener('wheel', onWheel);
      if (hoverScrollTimerRef.current) cancelAnimationFrame(hoverScrollTimerRef.current);
    };
  }, [checkScroll]);

  // Keep active tab visible when changed
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTab]);

  const scrollByAmount = (amount: number) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Hover auto-scroll near the right or left edge of the tabs bar
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const edgeZone = 80; // 80px zone on each side

    if (x > rect.width - edgeZone && canScrollRight) {
      const speed = Math.max(4, Math.min(14, ((x - (rect.width - edgeZone)) / edgeZone) * 14));
      el.scrollLeft += speed;
    } else if (x < edgeZone && canScrollLeft) {
      const speed = Math.max(4, Math.min(14, ((edgeZone - x) / edgeZone) * 14));
      el.scrollLeft -= speed;
    }
  };
  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-950 border border-red-500/50 flex items-center justify-center shadow-lg shadow-red-950/70">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-wider">
                  ESTOQUE T.I.
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/80">
                  Corporativo
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Controle de Produtos, Retiradas & Impressoras
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-300 hover:text-white transition cursor-pointer border border-red-900/60 hover:border-red-700 shadow-sm"
              title="Emitir relatório em PDF detalhado e objetivo"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span className="hidden md:inline">Emitir</span> PDF
            </button>

            <button
              onClick={onOpenWithdrawalModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-950/60 transition cursor-pointer border border-red-500/40"
              title="Registrar saída de item do estoque"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Nova Retirada</span>
            </button>

            <button
              onClick={onOpenProductModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white transition cursor-pointer border border-zinc-700"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Novo</span> Produto
            </button>

            {/* Cloud Realtime Sync Status Indicator */}
            <button 
              type="button"
              onClick={onManualSync}
              className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer hover:opacity-90 active:scale-95 ${
                isCloudConnected 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
              }`}
              title="Clique para forçar sincronização com o banco de dados Firebase agora"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : isCloudConnected ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="truncate">
                {isSyncing ? 'Sincronizando...' : isCloudConnected ? 'Nuvem Conectada' : 'Modo Offline'}
              </span>
              <RefreshCw className={`w-3 h-3 text-zinc-400 hover:text-white ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block" />

            {/* User Session */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-200">
                  {user.name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Responsável pelo Estoque T.I.
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar with dynamic scroll & hover navigation */}
        <div className="relative border-t border-zinc-800/80 pt-2 pb-1 group/tabs">
          {/* Left scroll chevron button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount(-200)}
              onMouseEnter={() => {
                const step = () => {
                  if (tabsContainerRef.current) {
                    tabsContainerRef.current.scrollLeft -= 8;
                    hoverScrollTimerRef.current = requestAnimationFrame(step);
                  }
                };
                hoverScrollTimerRef.current = requestAnimationFrame(step);
              }}
              onMouseLeave={() => {
                if (hoverScrollTimerRef.current) cancelAnimationFrame(hoverScrollTimerRef.current);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-zinc-900/95 hover:bg-red-950 text-zinc-300 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-sm transition cursor-pointer"
              title="Rolar abas para a esquerda"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right scroll chevron button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount(200)}
              onMouseEnter={() => {
                const step = () => {
                  if (tabsContainerRef.current) {
                    tabsContainerRef.current.scrollLeft += 8;
                    hoverScrollTimerRef.current = requestAnimationFrame(step);
                  }
                };
                hoverScrollTimerRef.current = requestAnimationFrame(step);
              }}
              onMouseLeave={() => {
                if (hoverScrollTimerRef.current) cancelAnimationFrame(hoverScrollTimerRef.current);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-red-950/90 hover:bg-red-900 text-red-200 hover:text-white border border-red-700/80 shadow-xl backdrop-blur-sm transition cursor-pointer"
              title="Rolar abas para a direita (Ver Compras do Mês)"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Tabs Container with sleek custom scrollbar & hover scroll */}
          <div
            ref={tabsContainerRef}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 text-xs tabs-scrollbar scroll-smooth select-none px-1"
          >
            {/* 1. Visão Geral */}
            <button
              data-active={activeTab === 'overview'}
              onClick={() => onTabChange('overview')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            {/* 2. Produtos & Estoque */}
            <button
              data-active={activeTab === 'products'}
              onClick={() => onTabChange('products')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produtos & Estoque</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* 3. Impressoras (Cores & Modelos) */}
            <button
              data-active={activeTab === 'printers'}
              onClick={() => onTabChange('printers')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'printers'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Impressoras (Cores & Modelos)</span>
            </button>

            {/* 4. Retiradas & Destinos */}
            <button
              data-active={activeTab === 'withdrawals'}
              onClick={() => onTabChange('withdrawals')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'withdrawals'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Retiradas & Destinos</span>
            </button>

            {/* 5. Departamentos & Lojas */}
            <button
              data-active={activeTab === 'departments'}
              onClick={() => onTabChange('departments')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Departamentos & Lojas</span>
            </button>

            {/* 6. Solicitantes & Setores */}
            <button
              data-active={activeTab === 'requesters'}
              onClick={() => onTabChange('requesters')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'requesters'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Solicitantes & Setores</span>
            </button>

            {/* 7. Compras do Mês */}
            <button
              data-active={activeTab === 'purchases'}
              onClick={() => onTabChange('purchases')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'purchases'
                  ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Compras do Mês</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
