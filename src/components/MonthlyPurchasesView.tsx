import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  FileText, 
  ExternalLink, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit, 
  Filter, 
  Building2, 
  Truck,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { MonthlyPurchase, Department, PurchaseStatus } from '../types';
import { generatePurchasesReportPDF } from '../utils/purchasesPdfGenerator';

interface MonthlyPurchasesViewProps {
  purchases: MonthlyPurchase[];
  departments: Department[];
  onOpenNewPurchaseModal: () => void;
  onEditPurchase: (purchase: MonthlyPurchase) => void;
  onDeletePurchase: (purchaseId: string) => void;
  onMarkAsDelivered: (purchase: MonthlyPurchase) => void;
  currentTechnicianName?: string;
}

export const MonthlyPurchasesView: React.FC<MonthlyPurchasesViewProps> = ({
  purchases,
  departments,
  onOpenNewPurchaseModal,
  onEditPurchase,
  onDeletePurchase,
  onMarkAsDelivered,
  currentTechnicianName = 'Responsável T.I.',
}) => {
  // Current month string 'YYYY-MM'
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract all unique months available in purchases + current month
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthStr);
    purchases.forEach(p => {
      if (p.purchaseDate && p.purchaseDate.length >= 7) {
        set.add(p.purchaseDate.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [purchases, currentMonthStr]);

  // Format month for label (e.g. '2026-09' -> 'Setembro / 2026')
  const formatMonthLabel = (mStr: string) => {
    if (mStr === 'all') return 'Todas as Compras';
    const [y, m] = mStr.split('-');
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      // Month
      if (selectedMonth !== 'all') {
        if (!p.purchaseDate.startsWith(selectedMonth)) return false;
      }
      // Status
      if (selectedStatus !== 'all') {
        if (p.status !== selectedStatus) return false;
      }
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchItem = p.itemName.toLowerCase().includes(query);
        const matchVendor = (p.storeOrVendor || '').toLowerCase().includes(query);
        const matchUrl = (p.purchaseUrl || '').toLowerCase().includes(query);
        const matchNotes = (p.notes || '').toLowerCase().includes(query);
        const matchTracking = (p.trackingCode || '').toLowerCase().includes(query);
        if (!matchItem && !matchVendor && !matchUrl && !matchNotes && !matchTracking) {
          return false;
        }
      }
      return true;
    });
  }, [purchases, selectedMonth, selectedStatus, searchTerm]);

  // Metrics calculation
  const totalAmount = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + (p.totalPrice || (p.quantity * p.unitPrice)), 0);
  }, [filteredPurchases]);

  const deliveredCount = useMemo(() => {
    return filteredPurchases.filter(p => p.status === 'Entregue').length;
  }, [filteredPurchases]);

  const pendingCount = useMemo(() => {
    return filteredPurchases.filter(p => p.status !== 'Entregue' && p.status !== 'Cancelado').length;
  }, [filteredPurchases]);

  const totalItemsCount = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + p.quantity, 0);
  }, [filteredPurchases]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  // PDF Trigger
  const handleExportPDF = () => {
    generatePurchasesReportPDF({
      monthFilter: selectedMonth,
      statusFilter: selectedStatus,
      technicianName: currentTechnicianName,
      purchases,
      departments,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions Bar */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-2xl text-red-400 shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">
                  Compras do Mês
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60">
                  {formatMonthLabel(selectedMonth)}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Preenchimento manual de fornecedor, links dos sites, cálculo automático de valor total e controle de chegada
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* PDF Report Export Button */}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition cursor-pointer shadow-sm"
              title="Baixar relatório completo das compras do mês em PDF formatado"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Puxar PDF de Compras</span>
            </button>

            {/* New Purchase Button */}
            <button
              onClick={onOpenNewPurchaseModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-950 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Compra</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Total Investido no Mês
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-red-400">
              {formatBRL(totalAmount)}
            </span>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Pedidos Cadastrados
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-zinc-100">
              {filteredPurchases.length} <span className="text-xs font-medium text-zinc-400">({totalItemsCount} peças)</span>
            </span>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Chegou / Entregue
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
              {deliveredCount} <span className="text-xs font-medium text-zinc-400">pedidos</span>
            </span>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
              A Caminho / Pendentes
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-400">
              {pendingCount} <span className="text-xs font-medium text-zinc-400">pedidos</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por item, fornecedor, link ou código de rastreio..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-600 transition placeholder:text-zinc-500"
          />
        </div>

        {/* Month Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">Todas as Compras</option>
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-zinc-900">
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">Todos</option>
              <option value="Entregue" className="bg-zinc-900">Chegou / Entregue</option>
              <option value="Pendente / A caminho" className="bg-zinc-900">A caminho / Pendente</option>
              <option value="Cancelado" className="bg-zinc-900">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">
              Nenhuma compra encontrada
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-5">
              {purchases.length === 0
                ? 'Você ainda não cadastrou compras para este mês. Clique no botão abaixo para começar a registrar seus pedidos.'
                : 'Nenhum registro corresponde aos filtros ou à busca selecionada.'}
            </p>
            <button
              onClick={onOpenNewPurchaseModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeira Compra</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Comprado</th>
                  <th className="py-3 px-3">Onde foi Comprado</th>
                  <th className="py-3 px-3">Link do Site</th>
                  <th className="py-3 px-3 text-center">Qtd</th>
                  <th className="py-3 px-3 text-right">Vl. Unitário</th>
                  <th className="py-3 px-3 text-right">Valor Final</th>
                  <th className="py-3 px-3 text-center">Data Compra</th>
                  <th className="py-3 px-3 text-center">Quando Chegou</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPurchases.map((purchase) => {
                  const finalVal = purchase.totalPrice || (purchase.quantity * purchase.unitPrice);
                  const isDelivered = purchase.status === 'Entregue';

                  return (
                    <tr 
                      key={purchase.id} 
                      className="hover:bg-zinc-850/50 transition group"
                    >
                      {/* Item */}
                      <td className="py-3.5 px-4 font-bold text-zinc-100">
                        <div className="flex flex-col">
                          <span>{purchase.itemName}</span>
                          {purchase.destinationDepartmentName && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-normal mt-0.5">
                              <Building2 className="w-2.5 h-2.5 text-zinc-500" />
                              Destino: {purchase.destinationDepartmentName}
                            </span>
                          )}
                          {purchase.trackingCode && (
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono mt-0.5">
                              <Truck className="w-2.5 h-2.5" />
                              Rastreio: {purchase.trackingCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Onde foi comprado (Manual) */}
                      <td className="py-3.5 px-3 font-medium text-zinc-300">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700/60">
                          {purchase.storeOrVendor || 'Manual'}
                        </span>
                      </td>

                      {/* URL do Site */}
                      <td className="py-3.5 px-3">
                        {purchase.purchaseUrl ? (
                          <a
                            href={purchase.purchaseUrl.startsWith('http') ? purchase.purchaseUrl : `https://${purchase.purchaseUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 transition group-hover:border-red-800/60 max-w-[170px] truncate"
                            title={purchase.purchaseUrl}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0 text-red-400" />
                            <span className="truncate">
                              {purchase.purchaseUrl.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0]}
                            </span>
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">Compra direta / Física</span>
                        )}
                      </td>

                      {/* Quantidade */}
                      <td className="py-3.5 px-3 text-center font-bold text-zinc-200">
                        {purchase.quantity}
                      </td>

                      {/* Valor Unitário */}
                      <td className="py-3.5 px-3 text-right text-zinc-300 font-mono">
                        {formatBRL(purchase.unitPrice)}
                      </td>

                      {/* Valor Final (Total) */}
                      <td className="py-3.5 px-3 text-right font-bold text-red-400 font-mono text-sm">
                        {formatBRL(finalVal)}
                      </td>

                      {/* Data da Compra */}
                      <td className="py-3.5 px-3 text-center text-zinc-400 font-medium">
                        {formatDateBR(purchase.purchaseDate)}
                      </td>

                      {/* Quando Chegou */}
                      <td className="py-3.5 px-3 text-center">
                        {isDelivered ? (
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {purchase.arrivalDate ? formatDateBR(purchase.arrivalDate) : 'Entregue'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              A caminho
                            </span>
                            <button
                              onClick={() => onMarkAsDelivered(purchase)}
                              className="text-[10px] font-bold text-zinc-300 hover:text-emerald-300 bg-zinc-800 hover:bg-emerald-950/80 border border-zinc-700 hover:border-emerald-700/80 px-2 py-0.5 rounded-md transition cursor-pointer"
                              title="Clique quando a encomenda chegar na empresa para registrar a data de hoje automaticamente"
                            >
                              ✓ Chegou Hoje
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {purchase.status === 'Entregue' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            Entregue
                          </span>
                        ) : purchase.status === 'Cancelado' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Cancelado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
                            Em trânsito
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditPurchase(purchase)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
                            title="Editar dados da compra"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePurchase(purchase.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                            title="Excluir compra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Footer Total */}
              <tfoot className="bg-zinc-950 font-bold border-t-2 border-zinc-800 text-zinc-200">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-xs uppercase tracking-wider text-zinc-400">
                    Total do Período ({filteredPurchases.length} compras)
                  </td>
                  <td className="py-3 px-3 text-center text-zinc-200">
                    {totalItemsCount}
                  </td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-red-400 text-sm font-extrabold font-mono">
                    {formatBRL(totalAmount)}
                  </td>
                  <td colSpan={4} className="py-3 px-4 text-right">
                    <button
                      onClick={handleExportPDF}
                      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar este resumo em PDF
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
