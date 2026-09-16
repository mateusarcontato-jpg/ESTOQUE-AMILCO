import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Search, 
  Building2, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Palette,
  Layers,
  Wrench
} from 'lucide-react';
import { PrinterItem, Department, PrinterColorType, PrinterStatus } from '../types';

interface PrintersViewProps {
  printers: PrinterItem[];
  departments: Department[];
  onOpenNewPrinterModal: () => void;
  onEditPrinter: (printer: PrinterItem) => void;
  onDeletePrinter: (printerId: string) => void;
  onQuickTransfer: (printer: PrinterItem, newDepartmentId: string) => void;
  initialFilterAvailable?: boolean;
}

export const PrintersView: React.FC<PrintersViewProps> = ({
  printers,
  departments,
  onOpenNewPrinterModal,
  onEditPrinter,
  onDeletePrinter,
  onQuickTransfer,
  initialFilterAvailable = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialFilterAvailable ? 'Disponível no Estoque' : 'all'
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [transferringPrinter, setTransferringPrinter] = useState<PrinterItem | null>(null);
  const [transferTargetDep, setTransferTargetDep] = useState<string>('');

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach(d => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const filteredPrinters = useMemo(() => {
    return printers.filter((p) => {
      const matchesSearch =
        (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.suppliesNotes && p.suppliesNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.patrimonyNumber && p.patrimonyNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.serialNumber && p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesColor = selectedColor === 'all' || p.colorType === selectedColor;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || p.departmentId === selectedDepartment;

      return matchesSearch && matchesColor && matchesStatus && matchesDepartment;
    });
  }, [printers, searchTerm, selectedColor, selectedStatus, selectedDepartment]);

  // Quick stats
  const colorCount = printers.filter(p => p.colorType === 'Colorida').length;
  const monoCount = printers.filter(p => p.colorType === 'Monocromática (P&B)').length;
  const thermalCount = printers.filter(p => p.colorType === 'Térmica (Etiquetas)').length;
  const availableCount = printers.filter(p => p.status === 'Disponível no Estoque').length;

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringPrinter || !transferTargetDep) return;
    onQuickTransfer(transferringPrinter, transferTargetDep);
    setTransferringPrinter(null);
  };

  const getColorBadge = (colorType: PrinterColorType) => {
    switch (colorType) {
      case 'Colorida':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500/20 via-amber-500/20 to-blue-500/20 text-red-300 border border-red-500/40 shadow-xs">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Colorida (CMYK)</span>
          </span>
        );
      case 'Monocromática (P&B)':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>Monocromática (P&B)</span>
          </span>
        );
      case 'Térmica (Etiquetas)':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-950/60 text-yellow-300 border border-yellow-800/60">
            <Layers className="w-3.5 h-3.5" />
            <span>Térmica / Etiquetas</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'Disponível no Estoque':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>Disponível</span>
          </span>
        );
      case 'Alocada / Em Uso':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md">
            <Building2 className="w-3 h-3" />
            <span>Em Uso / Alocada</span>
          </span>
        );
      case 'Em Manutenção':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
            <Wrench className="w-3 h-3" />
            <span>Em Manutenção</span>
          </span>
        );
      case 'Reserva Técnica':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" />
            <span>Reserva Técnica</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Color Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Disponíveis no CD</p>
            <p className="text-xl font-bold text-white">{availableCount} impressoras</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600/30 to-amber-600/30 border border-red-500/40 flex items-center justify-center text-red-300 shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Modelos Coloridos</p>
            <p className="text-xl font-bold text-white">{colorCount} cadastrados</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Modelos P&B (Mono)</p>
            <p className="text-xl font-bold text-white">{monoCount} cadastrados</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-950/70 border border-yellow-800/60 flex items-center justify-center text-yellow-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Térmicas / Etiquetas</p>
            <p className="text-xl font-bold text-white">{thermalCount} cadastrados</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar modelo, toner, patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Color Type Filter */}
          <div>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Todas as Cores (Colorida & P&B)</option>
              <option value="Colorida">🌈 Apenas Coloridas</option>
              <option value="Monocromática (P&B)">⬛ Apenas Monocromáticas (P&B)</option>
              <option value="Térmica (Etiquetas)">🏷️ Apenas Térmicas / Etiquetas</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Todos os Status de Disponibilidade</option>
              <option value="Disponível no Estoque">✅ Disponível no Estoque</option>
              <option value="Alocada / Em Uso">🏢 Alocada / Em Uso</option>
              <option value="Em Manutenção">🔧 Em Manutenção</option>
              <option value="Reserva Técnica">📦 Reserva Técnica</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Todos os Departamentos / Lojas</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printers Table / Card Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Controle Especializado de Impressoras ({filteredPrinters.length} listadas)
            </h2>
          </div>

          <button
            onClick={onOpenNewPrinterModal}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Nova Impressora</span>
          </button>
        </div>

        {filteredPrinters.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Printer className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-bold text-zinc-300">
              {printers.length === 0 ? 'Nenhuma impressora cadastrada ainda.' : 'Nenhuma impressora encontrada para os filtros atuais.'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-5">
              {printers.length === 0
                ? 'Cadastre as impressoras especificando o modelo, se é colorida ou monocromática (P&B), e a unidade (ACARAÚ, PREÁ, CD, SERRARIA).'
                : 'Tente alterar os filtros de cor, status ou o termo digitado na busca.'}
            </p>
            <button
              onClick={onOpenNewPrinterModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeira Impressora</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Modelo & Fabricante</th>
                  <th className="py-3 px-4">Especificação de Cor</th>
                  <th className="py-3 px-4">Disponibilidade</th>
                  <th className="py-3 px-4">Departamento Alocado</th>
                  <th className="py-3 px-4">Suprimentos / Detalhes</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredPrinters.map((printer) => {
                  const depName = departmentMap.get(printer.departmentId) || 'Não especificado';

                  return (
                    <tr 
                      key={printer.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      {/* Model & Brand */}
                      <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100">{printer.brand} {printer.model}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                          {printer.patrimonyNumber && (
                            <span className="font-mono bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-300">
                              {printer.patrimonyNumber}
                            </span>
                          )}
                          {printer.serialNumber && <span>S/N: {printer.serialNumber}</span>}
                          {printer.ipAddress && <span className="text-zinc-500">IP: {printer.ipAddress}</span>}
                        </div>
                      </td>

                      {/* Color Type */}
                      <td className="py-3.5 px-4">
                        {getColorBadge(printer.colorType)}
                      </td>

                      {/* Availability Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(printer.status)}
                        {printer.status === 'Disponível no Estoque' && (
                          <span className="block text-[10px] text-zinc-500 mt-0.5">
                            Qtd: {printer.quantityAvailable} un
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-zinc-300">
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-200 bg-zinc-800/70 px-2 py-0.5 rounded border border-zinc-700/50">
                          <Building2 className="w-3 h-3 text-red-400" />
                          <span>{depName}</span>
                        </div>
                      </td>

                      {/* Supplies & Observations */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {printer.suppliesNotes ? (
                          <div className="text-[11px] text-zinc-300 font-medium line-clamp-1">
                            {printer.suppliesNotes}
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                        {printer.observations && (
                          <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                            {printer.observations}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Transfer / Reallocate */}
                          <button
                            onClick={() => {
                              setTransferringPrinter(printer);
                              setTransferTargetDep(printer.departmentId);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Mover / Alocar impressora para outro departamento (LOJA ACARAÚ, PREÁ, CD, SERRARIA...)"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">Mudar Loja</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditPrinter(printer)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                            title="Editar impressora"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeletePrinter(printer.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Excluir impressora"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Quick Transfer / Reallocation */}
      {transferringPrinter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-red-400" />
              <span>Transferir / Alocar Impressora</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Defina o novo departamento de destino para a impressora{' '}
              <strong className="text-white">{transferringPrinter.brand} {transferringPrinter.model}</strong> ({transferringPrinter.colorType}).
            </p>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Novo Departamento / Loja
                </label>
                <select
                  value={transferTargetDep}
                  onChange={(e) => setTransferTargetDep(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTransferringPrinter(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Salvar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
