import React, { useState, useEffect } from 'react';
import { X, Printer, Check, AlertCircle } from 'lucide-react';
import { PrinterItem, Department, PrinterColorType, PrinterStatus } from '../types';

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (printerData: Omit<PrinterItem, 'id' | 'updatedAt'>, editId?: string) => void;
  departments: Department[];
  editingPrinter?: PrinterItem | null;
}

const COLOR_TYPES: PrinterColorType[] = [
  'Monocromática (P&B)',
  'Colorida',
  'Térmica (Etiquetas)',
];

const STATUS_OPTIONS: PrinterStatus[] = [
  'Disponível no Estoque',
  'Alocada / Em Uso',
  'Em Manutenção',
  'Reserva Técnica',
];

export const PrinterModal: React.FC<PrinterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  editingPrinter,
}) => {
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('HP');
  const [colorType, setColorType] = useState<PrinterColorType>('Monocromática (P&B)');
  const [status, setStatus] = useState<PrinterStatus>('Disponível no Estoque');
  const [departmentId, setDepartmentId] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState<number>(1);
  const [serialNumber, setSerialNumber] = useState('');
  const [patrimonyNumber, setPatrimonyNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [suppliesNotes, setSuppliesNotes] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPrinter) {
      setModel(editingPrinter.model);
      setBrand(editingPrinter.brand);
      setColorType(editingPrinter.colorType);
      setStatus(editingPrinter.status);
      setDepartmentId(editingPrinter.departmentId || departments[0]?.id || '');
      setQuantityAvailable(editingPrinter.quantityAvailable);
      setSerialNumber(editingPrinter.serialNumber || '');
      setPatrimonyNumber(editingPrinter.patrimonyNumber || '');
      setIpAddress(editingPrinter.ipAddress || '');
      setSuppliesNotes(editingPrinter.suppliesNotes || '');
      setObservations(editingPrinter.observations || '');
    } else {
      setModel('');
      setBrand('HP');
      setColorType('Monocromática (P&B)');
      setStatus('Disponível no Estoque');
      const defaultDep = departments.find(d => d.code === 'CD') || departments[0];
      setDepartmentId(defaultDep ? defaultDep.id : '');
      setQuantityAvailable(1);
      setSerialNumber('');
      setPatrimonyNumber('');
      setIpAddress('');
      setSuppliesNotes('');
      setObservations('');
    }
    setError(null);
  }, [editingPrinter, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setError('Por favor, informe o modelo da impressora.');
      return;
    }

    onSave(
      {
        model: model.trim(),
        brand: brand.trim(),
        colorType,
        status,
        departmentId: departmentId || departments[0]?.id || '',
        quantityAvailable: Number(quantityAvailable) || 1,
        serialNumber: serialNumber.trim() || undefined,
        patrimonyNumber: patrimonyNumber.trim() || undefined,
        ipAddress: ipAddress.trim() || undefined,
        suppliesNotes: suppliesNotes.trim() || undefined,
        observations: observations.trim() || undefined,
      },
      editingPrinter?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingPrinter ? 'Editar Impressora' : 'Cadastrar Nova Impressora'}
              </h2>
              <p className="text-xs text-zinc-400">
                Especificação de modelo, cor de impressão e disponibilidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Model & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Modelo da Impressora *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ex: EcoTank L3250, LaserJet Pro M404dw, DCP-L2540DW..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Marca / Fabricante
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="ex: HP, Epson, Brother, Zebra"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Color Specification & Availability Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Especificação de Cor *
              </label>
              <select
                value={colorType}
                onChange={(e) => setColorType(e.target.value as PrinterColorType)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {COLOR_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Indica se a máquina imprime colorido, preto e branco ou térmico.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Status / Disponibilidade *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PrinterStatus)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Departamento / Loja Alocada
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Quantidade Disponível
              </label>
              <input
                type="number"
                min="1"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Identifiers (Patrimônio, Serial, IP) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Patrimônio
              </label>
              <input
                type="text"
                value={patrimonyNumber}
                onChange={(e) => setPatrimonyNumber(e.target.value)}
                placeholder="ex: PAT-IMP-099"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Número de Série
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="ex: VNC8K91204"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                IP na Rede
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="ex: 192.168.1.55"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Supplies */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Suprimentos / Tintas / Toners Compatíveis
            </label>
            <input
              type="text"
              value={suppliesNotes}
              onChange={(e) => setSuppliesNotes(e.target.value)}
              placeholder="ex: Toner HP 58A Preto / Garrafas Tinta T544 (Preto, Ciano, Magenta, Amarelo)"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: Instalada na gerência da Loja Acaraú; configurada com fila de impressão no servidor."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-950 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingPrinter ? 'Salvar Alterações' : 'Cadastrar Impressora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
