import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  Search, 
  Download, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Package, 
  Printer,
  MinusCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { WithdrawalRecord, Department } from '../types';

interface HistoryViewProps {
  withdrawals: WithdrawalRecord[];
  departments: Department[];
  onOpenWithdrawalModal: () => void;
  onOpenReportModal?: () => void;
  onEditWithdrawal?: (record: WithdrawalRecord) => void;
  onDeleteWithdrawal?: (record: WithdrawalRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  withdrawals,
  departments,
  onOpenWithdrawalModal,
  onOpenReportModal,
  onEditWithdrawal,
  onDeleteWithdrawal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const defaultEnd = now.toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  const filteredRecords = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesSearch =
        w.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.ticketOrReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.destinationDepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.targetPrinterName && w.targetPrinterName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDep = selectedDepartment === 'all' || w.destinationDepartmentId === selectedDepartment;
      const matchesType = selectedType === 'all' || w.itemType === selectedType;

      let matchesPeriod = true;
      if (periodFilter === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        matchesPeriod = w.date.startsWith(todayStr);
      } else if (periodFilter === '7days') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = new Date(w.date) >= sevenDaysAgo;
      } else if (periodFilter === '30days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        matchesPeriod = new Date(w.date) >= thirtyDaysAgo;
      } else if (periodFilter === 'custom') {
        if (startDate && w.date.slice(0, 10) < startDate) matchesPeriod = false;
        if (endDate && w.date.slice(0, 10) > endDate) matchesPeriod = false;
      }

      return matchesSearch && matchesDep && matchesType && matchesPeriod;
    });
  }, [withdrawals, searchTerm, selectedDepartment, selectedType, periodFilter, startDate, endDate]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Data / Hora',
      'Tipo',
      'Item',
      'Impressora Vinculada',
      'Quantidade',
      'Departamento de Destino',
      'Quem Retirou / Solicitante',
      'Técnico T.I. Responsável',
      'Motivo / Chamado',
    ];

    const rows = filteredRecords.map((r) => [
      new Date(r.date).toLocaleString('pt-BR'),
      r.itemType === 'printer' ? 'Impressora' : 'Material / Produto',
      `"${r.itemName.replace(/"/g, '""')}"`,
      `"${(r.targetPrinterName || '-').replace(/"/g, '""')}"`,
      r.quantity,
      `"${r.destinationDepartmentName.replace(/"/g, '""')}"`,
      `"${r.requesterName.replace(/"/g, '""')}"`,
      `"${r.technicianName.replace(/"/g, '""')}"`,
      `"${r.ticketOrReason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_retiradas_ti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Export Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por item, solicitante, chamado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Destino: Todas as Lojas</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  Destino: {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Tipo: Todos os Itens</option>
              <option value="product">Apenas Produtos / Materiais</option>
              <option value="printer">Apenas Impressoras</option>
            </select>
          </div>

          {/* Period Filter with Calendar */}
          <div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Período: Todo o Histórico</option>
              <option value="today">Período: Somente Hoje</option>
              <option value="7days">Período: Últimos 7 dias</option>
              <option value="30days">Período: Últimos 30 dias</option>
              <option value="custom">📅 Período Específico...</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-950 transition cursor-pointer border border-red-500/40"
                title="Gerar e baixar relatório detalhado em PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Emitir PDF</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Exportar dados em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Custom Calendar Date Pickers */}
        {periodFilter === 'custom' && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>Filtrar por data:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">De:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Até:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white outline-none cursor-pointer"
              />
            </div>
            <span className="text-xs text-red-400 font-medium ml-auto">
              {filteredRecords.length} resultado(s) no período
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Histórico de Retiradas e Destinos ({filteredRecords.length} registros)
            </h2>
          </div>

          <button
            onClick={onOpenWithdrawalModal}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Nova Retirada</span>
          </button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Nenhum registro de retirada encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Data e Hora</th>
                  <th className="py-3 px-4">Item Retirado</th>
                  <th className="py-3 px-4">Qtd</th>
                  <th className="py-3 px-4">Destino (Departamento/Loja)</th>
                  <th className="py-3 px-4">Quem Retirou / Solicitante</th>
                  <th className="py-3 px-4">Técnico TI</th>
                  <th className="py-3 px-4">Motivo / Chamado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition group">
                    <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                      <div className="flex items-center gap-1.5">
                        {record.itemType === 'printer' ? (
                          <Printer className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        )}
                        <span className="text-zinc-100 font-semibold">{record.itemName}</span>
                      </div>
                      {record.targetPrinterName && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800/90 text-red-300 border border-red-900/60 shadow-xs">
                            <Printer className="w-2.5 h-2.5 text-red-400" />
                            <span>Para: {record.targetPrinterName}</span>
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-red-400 whitespace-nowrap">
                      -{record.quantity}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-200 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3 text-red-400" />
                        <span>{record.destinationDepartmentName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-bold text-zinc-200">{record.requesterName}</span>
                      </div>
                      {record.requesterSection && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/90 text-red-300 border border-red-800/80">
                          {record.requesterSection}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {record.technicianName}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 max-w-xs">
                      <span className="line-clamp-2 text-[11px]">
                        {record.ticketOrReason}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {onEditWithdrawal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditWithdrawal(record);
                            }}
                            title="Editar esta saída (quantidade, item, destino ou solicitante)"
                            className="px-2.5 py-1.5 bg-zinc-800/90 hover:bg-amber-950/90 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-700/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                            <span>Editar</span>
                          </button>
                        )}
                        {onDeleteWithdrawal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWithdrawal(record);
                            }}
                            title="Excluir retirada e devolver itens ao estoque"
                            className="px-2.5 py-1.5 bg-zinc-800/90 hover:bg-red-950/90 text-zinc-300 hover:text-red-300 border border-zinc-700/80 hover:border-red-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Excluir</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
