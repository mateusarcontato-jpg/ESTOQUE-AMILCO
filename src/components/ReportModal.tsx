import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { Product, PrinterItem, WithdrawalRecord, Department, Requester } from '../types';
import { generateStockReportPDF, PDFReportOptions } from '../utils/pdfGenerator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
  departments: Department[];
  requesters?: Requester[];
  currentTechnicianName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  products,
  printers,
  withdrawals,
  departments,
  requesters = [],
  currentTechnicianName,
}) => {
  const [reportType, setReportType] = useState<PDFReportOptions['reportType']>('complete');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [technicianName, setTechnicianName] = useState<string>(currentTechnicianName);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate live preview counts
  let previewWithdrawals = withdrawals;
  if (periodFilter === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10);
    previewWithdrawals = previewWithdrawals.filter(w => w.date.startsWith(todayStr));
  } else if (periodFilter === '7days') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    previewWithdrawals = previewWithdrawals.filter(w => new Date(w.date) >= sevenDaysAgo);
  } else if (periodFilter === '30days') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    previewWithdrawals = previewWithdrawals.filter(w => new Date(w.date) >= thirtyDaysAgo);
  }

  if (departmentFilter !== 'all') {
    previewWithdrawals = previewWithdrawals.filter(w => w.destinationDepartmentId === departmentFilter);
  }

  let previewProducts = products;
  if (departmentFilter !== 'all') {
    previewProducts = previewProducts.filter(p => p.departmentId === departmentFilter);
  }

  let previewPrinters = printers;
  if (departmentFilter !== 'all') {
    previewPrinters = previewPrinters.filter(p => p.departmentId === departmentFilter);
  }

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generateStockReportPDF({
        reportType,
        departmentFilter,
        periodFilter,
        technicianName: technicianName.trim() || 'Responsável T.I.',
        products,
        printers,
        withdrawals,
        departments,
        requesters,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar relatório PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/40 flex items-center justify-center text-white shadow-md shadow-red-950/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Emitir Relatório em PDF</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/80">
                  A4 Profissional
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Documento detalhado, limpo e objetivo com assinatura e dados consolidados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Tipo de Relatório */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Tipo de Relatório Desejado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setReportType('complete')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  reportType === 'complete'
                    ? 'bg-red-950/40 border-red-500/80 text-white shadow-sm'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers className={`w-4 h-4 ${reportType === 'complete' ? 'text-red-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold">Completo (Geral)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Estoque, impressoras por cor e histórico de retiradas com solicitantes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('withdrawals')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  reportType === 'withdrawals'
                    ? 'bg-red-950/40 border-red-500/80 text-white shadow-sm'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className={`w-4 h-4 ${reportType === 'withdrawals' ? 'text-red-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold">Retiradas & Solicitantes</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Saídas com nome do colaborador, parte da loja atendida e chamados.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('stock')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  reportType === 'stock'
                    ? 'bg-red-950/40 border-red-500/80 text-white shadow-sm'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Package className={`w-4 h-4 ${reportType === 'stock' ? 'text-red-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold">Posição do Estoque</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Saldos atuais, estoques mínimos e itens com reposição necessária.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('printers')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  reportType === 'printers'
                    ? 'bg-red-950/40 border-red-500/80 text-white shadow-sm'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Printer className={`w-4 h-4 ${reportType === 'printers' ? 'text-red-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold">Impressoras (Cores & Modelos)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Aparelhos Mono vs Coloridos, números de patrimônio e status.
                </p>
              </button>
            </div>
          </div>

          {/* Filtros: Unidade e Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-400" />
                <span>Filtrar por Unidade / Loja</span>
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none cursor-pointer"
              >
                <option value="all">Todas as Unidades (Consolidado)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>Período das Retiradas</span>
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none cursor-pointer"
              >
                <option value="all">Todo o Histórico Disponível</option>
                <option value="today">Somente Hoje</option>
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
              </select>
            </div>
          </div>

          {/* Técnico Emitente */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>Nome do Responsável / Técnico T.I. no Relatório</span>
            </label>
            <input
              type="text"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder="ex: Mateus - Suporte T.I."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          {/* Sumário do que será impresso */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-400">
            <span className="font-bold text-zinc-200 block mb-1">Prévia do Conteúdo no PDF:</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              <span>• <strong>{previewWithdrawals.length}</strong> saídas/retiradas registradas</span>
              <span>• <strong>{previewProducts.length}</strong> itens de estoque</span>
              <span>• <strong>{previewPrinters.reduce((s, p) => s + p.quantityAvailable, 0)}</strong> impressoras disponíveis</span>
            </div>
          </div>

          {/* Feedback de sucesso */}
          {isSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Arquivo PDF gerado e baixado com sucesso! Verifique a pasta de downloads do seu computador.</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            Fechar
          </button>
          
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Gerando Relatório...' : 'Baixar Relatório em PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
