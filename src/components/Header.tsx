import React from 'react';
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
  ShoppingBag
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
  onOpenRequesterModal?: () => void;
  onOpenPurchaseModal?: () => void;
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
  onOpenPrinterModal,
  onOpenWithdrawalModal,
  onOpenDepartmentModal,
  onOpenRequesterModal,
  onOpenPurchaseModal,
  onOpenReportModal,
  onLogout,
  onManualSync,
  productsCount = 0,
  lowStockCount = 0,
  purchasesCount = 0,
  isCloudConnected = true,
  isSyncing = false,
}) => {
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

        {/* Navigation Tabs Bar - Stretched & perfectly aligned with the panel below */}
        <div className="flex items-center w-full gap-1.5 sm:gap-2 border-t border-zinc-800/80 pt-2 pb-1.5 text-xs">
          {/* 1. Visão Geral */}
          <button
            onClick={() => onTabChange('overview')}
            title="Visão Geral do Sistema"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="truncate">Visão Geral</span>
          </button>

          {/* 2. Estoque */}
          <button
            onClick={() => onTabChange('products')}
            title="Produtos & Estoque"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span className="truncate">Estoque</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white shrink-0">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* 3. Impressoras */}
          <button
            onClick={() => onTabChange('printers')}
            title="Impressoras (Cores & Modelos)"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'printers'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="truncate">Impressoras</span>
          </button>

          {/* 4. Retiradas */}
          <button
            onClick={() => onTabChange('withdrawals')}
            title="Retiradas & Destinos"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span className="truncate">Retiradas</span>
          </button>

          {/* 5. Departamentos */}
          <button
            onClick={() => onTabChange('departments')}
            title="Departamentos & Lojas"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Departamentos</span>
          </button>

          {/* 6. Solicitantes */}
          <button
            onClick={() => onTabChange('requesters')}
            title="Solicitantes & Setores"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'requesters'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Solicitantes</span>
          </button>

          {/* 7. Compras do Mês */}
          <button
            onClick={() => onTabChange('purchases')}
            title="Compras do Mês & Pedidos com Fornecedores"
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-red-950/90 text-red-300 border border-red-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">Compras do Mês</span>
          </button>
        </div>
      </div>
    </header>
  );
};
