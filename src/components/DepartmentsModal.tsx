import React, { useState } from 'react';
import { Building2, Plus, Trash2, Check, AlertCircle, Package, Printer, ArrowUpRight, X } from 'lucide-react';
import { Department, Product, PrinterItem, WithdrawalRecord } from '../types';

interface DepartmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onAddDepartment: (name: string, code?: string) => void;
  onDeleteDepartment: (id: string) => void;
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
}

export const DepartmentsModal: React.FC<DepartmentsModalProps> = ({
  isOpen,
  onClose,
  departments,
  onAddDepartment,
  onDeleteDepartment,
  products,
  printers,
  withdrawals,
}) => {
  const [newDepName, setNewDepName] = useState('');
  const [newDepCode, setNewDepCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = newDepName.trim();
    if (!trimmed) {
      setError('Por favor, digite o nome do departamento ou loja.');
      return;
    }

    const alreadyExists = departments.some(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setError(`O departamento "${trimmed}" já está cadastrado.`);
      return;
    }

    onAddDepartment(trimmed, newDepCode.trim().toUpperCase() || undefined);
    setSuccess(`Departamento "${trimmed}" cadastrado com sucesso!`);
    setNewDepName('');
    setNewDepCode('');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Departamentos, Lojas e Unidades
              </h2>
              <p className="text-xs text-zinc-400">
                Cadastre e gerencie destinos para alocação de produtos e impressoras
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

        <div className="p-6 space-y-6">
          {/* Add Department Form */}
          <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-400" />
              <span>Cadastrar Novo Departamento / Loja</span>
            </h3>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">
                  Nome da Loja / Departamento *
                </label>
                <input
                  type="text"
                  placeholder="ex: LOJA JERICOACOARA, MATRIZ ADM, FILIAL 05..."
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-xs outline-none uppercase"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">
                  Sigla (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ex: JER, ADM"
                  maxLength={6}
                  value={newDepCode}
                  onChange={(e) => setNewDepCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-xs outline-none uppercase"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-950 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Departamento</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Departments List */}
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
              Departamentos Cadastrados ({departments.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {departments.map((dep) => {
                const productCount = products.filter(p => p.locationDepartmentId === dep.id).length;
                const printerCount = printers.filter(pr => pr.departmentId === dep.id).length;
                const withdrawalCount = withdrawals.filter(w => w.destinationDepartmentId === dep.id).length;

                return (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{dep.name}</span>
                          {dep.code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {dep.code}
                            </span>
                          )}
                          {dep.isDefault && (
                            <span className="text-[10px] text-red-400 font-semibold bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/40">
                              Padrão
                            </span>
                          )}
                        </div>
                      </div>

                      {!dep.isDefault && (
                        <button
                          onClick={() => onDeleteDepartment(dep.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 transition cursor-pointer"
                          title="Excluir este departamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1" title="Itens estocados">
                        <Package className="w-3 h-3 text-zinc-500" />
                        {productCount} itens
                      </span>
                      <span className="flex items-center gap-1" title="Impressoras alocadas">
                        <Printer className="w-3 h-3 text-red-400" />
                        {printerCount} imp.
                      </span>
                      <span className="flex items-center gap-1" title="Saídas destinadas">
                        <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                        {withdrawalCount} saídas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
