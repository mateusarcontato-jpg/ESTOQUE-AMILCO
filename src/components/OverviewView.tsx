import React from 'react';
import { 
  Package, 
  Printer, 
  ArrowUpRight, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Clock, 
  Plus, 
  MinusCircle, 
  CheckCircle2, 
  Layers, 
  Store,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Product, PrinterItem, WithdrawalRecord, Department } from '../types';

interface OverviewViewProps {
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
  departments: Department[];
  onOpenWithdrawalModal: () => void;
  onOpenProductModal: () => void;
  onOpenReportModal?: () => void;
  onNavigateTab: (tab: 'products' | 'printers' | 'withdrawals' | 'departments' | 'requesters') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  products,
  printers,
  withdrawals,
  departments,
  onOpenWithdrawalModal,
  onOpenProductModal,
  onOpenReportModal,
  onNavigateTab,
}) => {
  // Calculations for Indices / Stat Cards
  const totalProductsCount = products.length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.quantity, 0);

  const totalPrintersCount = printers.reduce((acc, pr) => acc + (pr.quantityAvailable || 1), 0);
  const monoPrintersCount = printers
    .filter(p => p.colorType === 'Monocromática (P&B)')
    .reduce((acc, pr) => acc + (pr.quantityAvailable || 1), 0);
  const colorPrintersCount = printers
    .filter(p => p.colorType === 'Colorida')
    .reduce((acc, pr) => acc + (pr.quantityAvailable || 1), 0);

  const totalWithdrawalsCount = withdrawals.length;
  const totalUnitsWithdrawn = withdrawals.reduce((acc, w) => acc + w.quantity, 0);

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const lowStockCount = lowStockProducts.length;

  // Department withdrawals summary
  const departmentStats = departments.map(dept => {
    const deptWithdrawals = withdrawals.filter(w => w.destinationDepartmentId === dept.id);
    const totalItems = deptWithdrawals.reduce((acc, w) => acc + w.quantity, 0);
    return {
      department: dept,
      itemsWithdrawn: totalItems,
      withdrawalsCount: deptWithdrawals.length,
    };
  });

  const maxDepartmentItems = Math.max(1, ...departmentStats.map(d => d.itemsWithdrawn));

  // Available printers preview (up to 4)
  const availablePrinters = printers.filter(
    p => p.status === 'Disponível no Estoque' || p.quantityAvailable > 0
  );

  // Recent withdrawals (last 5)
  const recentWithdrawals = withdrawals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner with Black-to-Red Gradient */}
      <div className="relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/70 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/90 border border-red-800/80 text-[11px] font-semibold text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Painel de Controle T.I.</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gerenciamento de Estoque & Destinos
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Monitore produtos, retiradas para lojas (<span className="text-zinc-200">Acaraú, Preá, CD, Serraria</span>) e a disponibilidade de impressoras por cor e modelo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-300 hover:text-white text-xs sm:text-sm font-bold border border-red-900/60 hover:border-red-700 shadow-md transition cursor-pointer"
                title="Emitir relatório geral em PDF"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>Emitir Relatório PDF</span>
              </button>
            )}

            <button
              onClick={onOpenWithdrawalModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/60 border border-red-500/40 transition cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>Registrar Retirada</span>
            </button>

            <button
              onClick={onOpenProductModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs sm:text-sm font-bold border border-zinc-700/80 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Cadastrar Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sleek KPI Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Itens */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total de Itens
            </span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalProductsCount}
            </span>
            <span className="text-xs text-zinc-400">produtos ativos</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Volume total: <strong className="text-zinc-200">{totalUnitsInStock}</strong> unidades</span>
          </div>
        </div>

        {/* Impressoras em Estoque */}
        <div 
          onClick={() => onNavigateTab('printers')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-red-900/60 rounded-2xl p-5 shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
              Impressoras em Estoque
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 group-hover:scale-105 transition">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalPrintersCount}
            </span>
            <span className="text-xs text-zinc-400">aparelhos</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium text-[11px] border border-zinc-700">
              {monoPrintersCount} Mono (P&B)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 font-medium text-[11px] border border-red-800/80">
              {colorPrintersCount} Coloridas
            </span>
          </div>
        </div>

        {/* Retiradas Realizadas */}
        <div 
          onClick={() => onNavigateTab('withdrawals')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Retiradas Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalWithdrawalsCount}
            </span>
            <span className="text-xs text-zinc-400">solicitações</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Total despachado: <strong className="text-zinc-200">{totalUnitsWithdrawn}</strong> itens enviados
          </p>
        </div>

        {/* Alerta de Reposição */}
        <div 
          onClick={() => onNavigateTab('products')}
          className={`rounded-2xl p-5 shadow-sm transition cursor-pointer group border ${
            lowStockCount > 0 
              ? 'bg-zinc-900/90 border-red-900/80 hover:border-red-600' 
              : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
              Alerta de Reposição
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 group-hover:scale-105 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
            <span className="text-xs text-zinc-400">itens no limite mínimo</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-red-400/90">
            {lowStockCount > 0 ? 'Requer atenção do suporte TI' : 'Estoque seguro'}
          </p>
        </div>
      </div>

      {/* 3. Middle Section: Destino das Retiradas por Loja & Impressoras Disponíveis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Destino das Retiradas por Departamento */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-800/80 flex items-center justify-center text-red-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Destino das Retiradas por Departamento
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('departments')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Gerenciar Lojas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Quantidade total de produtos enviados para cada unidade
            </p>

            <div className="space-y-4">
              {departmentStats.map(stat => {
                const percentage = maxDepartmentItems > 0 
                  ? Math.round((stat.itemsWithdrawn / maxDepartmentItems) * 100) 
                  : 0;

                return (
                  <div key={stat.department.id} className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                          {stat.department.name}
                        </span>
                        {stat.department.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950/80 border border-red-800/60 text-red-300 uppercase">
                            Unidade Principal
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-300 font-semibold">
                        <span className="text-white">{stat.itemsWithdrawn}</span> itens retirados{' '}
                        <span className="text-zinc-500 font-normal">({stat.withdrawalsCount} baixas)</span>
                      </div>
                    </div>

                    {/* Glowing Red Progress Bar */}
                    <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-red-600/50"
                        style={{ width: `${Math.max(percentage, stat.itemsWithdrawn > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Impressoras Disponíveis */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-800/80 flex items-center justify-center text-red-400">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Impressoras Disponíveis
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('printers')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Modelos e especificações de cores prontas para envio imediato:
            </p>

            {availablePrinters.length === 0 ? (
              <div className="py-10 text-center text-zinc-500">
                <Printer className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Nenhuma impressora disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePrinters.slice(0, 4).map(printer => (
                  <div 
                    key={printer.id}
                    className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-bold text-white leading-tight">
                        {printer.brand} {printer.model}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/90 border border-red-800 text-red-300 whitespace-nowrap">
                        {printer.quantityAvailable} disp.
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Cor: <strong className="text-zinc-200">{printer.colorType}</strong></span>
                      <span className="text-zinc-500 truncate max-w-[130px]">
                        {printer.suppliesNotes || 'Pronta para uso'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-800/80">
            <button
              onClick={() => onNavigateTab('printers')}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-zinc-700"
            >
              <span>Módulo de Impressoras Completo</span>
              <ChevronRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Últimas Retiradas Registradas */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/30">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Últimas Retiradas Registradas
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Histórico recente de baixas e movimentações da equipe de TI
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('withdrawals')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <span>Ver Histórico Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentWithdrawals.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-xs">Nenhuma retirada registrada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Data / Hora</th>
                  <th className="py-3 px-5">Produto</th>
                  <th className="py-3 px-5">Quantidade</th>
                  <th className="py-3 px-5">Destino (Departamento)</th>
                  <th className="py-3 px-5">Solicitante</th>
                  <th className="py-3 px-5">Técnico T.I.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {recentWithdrawals.map(w => {
                  const formattedDate = new Date(w.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={w.id} className="hover:bg-zinc-800/30 transition">
                      <td className="py-3 px-5 text-zinc-400 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-5 font-bold text-white">
                        {w.itemName}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black bg-red-950/80 text-red-300 border border-red-800/80">
                          -{w.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="font-semibold text-zinc-200">
                          {w.destinationDepartmentName}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-zinc-300">
                        {w.requesterName}
                        {w.requesterSection && (
                          <span className="block text-[11px] text-zinc-500">
                            ({w.requesterSection})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-zinc-400">
                        {w.technicianName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
