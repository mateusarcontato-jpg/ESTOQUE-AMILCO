import React from 'react';
import { Package, Printer, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Product, PrinterItem, WithdrawalRecord } from '../types';

interface StatCardsProps {
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
  onFilterLowStock: () => void;
  onFilterAvailablePrinters: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  products,
  printers,
  withdrawals,
  onFilterLowStock,
  onFilterAvailablePrinters,
}) => {
  const totalProductUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  
  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;

  const availablePrintersCount = printers
    .filter(p => p.status === 'Disponível no Estoque')
    .reduce((acc, p) => acc + p.quantityAvailable, 0);

  const totalPrintersInUse = printers
    .filter(p => p.status === 'Alocada / Em Uso').length;

  const totalWithdrawalsCount = withdrawals.reduce((acc, w) => acc + w.quantity, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Products in Stock */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Total em Estoque (Geral)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalProductUnits}
            </span>
            <span className="text-xs text-zinc-500">
              unidades ({products.length} itens cadastrados)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Available Printers */}
      <div 
        onClick={onFilterAvailablePrinters}
        className="bg-zinc-900 border border-zinc-800 hover:border-red-800/60 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition"
      >
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Impressoras Disponíveis
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {availablePrintersCount}
            </span>
            <span className="text-xs text-zinc-400">
              prontas p/ alocar ({totalPrintersInUse} em uso)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400">
          <Printer className="w-5 h-5" />
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div 
        onClick={onFilterLowStock}
        className={`border rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition ${
          lowStockCount > 0
            ? 'bg-red-950/20 border-red-800/60 hover:bg-red-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Alertas de Baixo Estoque
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-red-400' : 'text-zinc-200'}`}>
              {lowStockCount}
            </span>
            <span className="text-xs text-zinc-500">
              {lowStockCount > 0 ? 'precisam reposição' : 'estoque regular'}
            </span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
          lowStockCount > 0 
            ? 'bg-red-950 border-red-700 text-red-400' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Total Withdrawals Logged */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Saídas Registradas
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalWithdrawalsCount}
            </span>
            <span className="text-xs text-zinc-500">
              peças entregues ({withdrawals.length} registros)
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
