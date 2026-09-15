import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Package, 
  Printer, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { Department, Product, PrinterItem, WithdrawalRecord } from '../types';

interface DepartmentsViewProps {
  departments: Department[];
  onAddDepartment: (name: string, code?: string) => void;
  onDeleteDepartment: (id: string) => void;
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = newDepName.trim();
    if (!trimmed) {
      setError('Por favor, informe o nome do novo departamento ou loja.');
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
    setTimeout(() => setSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Registration Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Cadastrar Novo Departamento / Loja / Unidade
            </h2>
            <p className="text-xs text-zinc-400">
              Adicione novas filiais ou setores da empresa para alocação e retirada de produtos
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Nome da Loja / Setor / Departamento *
            </label>
            <input
              type="text"
              placeholder="ex: LOJA JERICOACOARA, SETOR FINANCEIRO, FILIAL CAMOCIM..."
              value={newDepName}
              onChange={(e) => setNewDepName(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-sm outline-none uppercase font-semibold placeholder:font-normal placeholder:normal-case placeholder:text-zinc-600"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Sigla / Código (Opcional)
            </label>
            <input
              type="text"
              placeholder="ex: JER, FIN, CAM"
              maxLength={6}
              value={newDepCode}
              onChange={(e) => setNewDepCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-sm outline-none uppercase font-mono placeholder:font-normal"
            />
          </div>

          <div className="sm:col-span-12 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-950 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Novo Departamento</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grid of registered departments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Unidades e Departamentos Registrados</span>
            <span className="text-xs font-normal text-zinc-400">
              ({departments.length} cadastrados no sistema)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dep) => {
            const productCount = products.filter(p => p.locationDepartmentId === dep.id).length;
            const printerCount = printers.filter(pr => pr.departmentId === dep.id).length;
            const withdrawalCount = withdrawals.filter(w => w.destinationDepartmentId === dep.id).length;

            return (
              <div
                key={dep.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-sm transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-red-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {dep.code && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {dep.code}
                        </span>
                      )}
                      {dep.isDefault ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/70 border border-red-900/40 px-2 py-0.5 rounded">
                          Padrão
                        </span>
                      ) : (
                        <button
                          onClick={() => onDeleteDepartment(dep.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                          title="Remover departamento customizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white tracking-tight">
                    {dep.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Destino para remessa de estoque e impressoras
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Produtos alocados</span>
                    </span>
                    <strong className="text-zinc-200">{productCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-red-400" />
                      <span>Impressoras instaladas</span>
                    </span>
                    <strong className="text-zinc-200">{printerCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Retiradas enviadas</span>
                    </span>
                    <strong className="text-zinc-200">{withdrawalCount}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
