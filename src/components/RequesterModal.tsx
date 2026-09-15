import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertCircle, Building2, Store } from 'lucide-react';
import { Requester, Department } from '../types';

interface RequesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requesterData: Omit<Requester, 'id' | 'createdAt'>, editId?: string) => void;
  departments: Department[];
  editingRequester?: Requester | null;
}

const COMMON_SECTIONS = [
  'Frente de Loja / Caixas',
  'Balcão de Vendas / Atendimento',
  'Gerência / Administrativo',
  'Estoque / Depósito Local',
  'Expedição / Logística',
  'Operações / Serraria / Corte',
  'Financeiro / Faturamento',
  'Controle de Qualidade',
];

export const RequesterModal: React.FC<RequesterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  editingRequester,
}) => {
  const [name, setName] = useState('');
  const [storeDepartmentId, setStoreDepartmentId] = useState('');
  const [storeSection, setStoreSection] = useState('Frente de Loja / Caixas');
  const [customSection, setCustomSection] = useState('');
  const [roleOrPosition, setRoleOrPosition] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRequester) {
      setName(editingRequester.name);
      setStoreDepartmentId(editingRequester.storeDepartmentId || departments[0]?.id || '');
      if (COMMON_SECTIONS.includes(editingRequester.storeSection)) {
        setStoreSection(editingRequester.storeSection);
        setCustomSection('');
      } else {
        setStoreSection('Outro');
        setCustomSection(editingRequester.storeSection);
      }
      setRoleOrPosition(editingRequester.roleOrPosition || '');
      setContact(editingRequester.contact || '');
      setNotes(editingRequester.notes || '');
    } else {
      setName('');
      setStoreDepartmentId(departments[0]?.id || '');
      setStoreSection('Frente de Loja / Caixas');
      setCustomSection('');
      setRoleOrPosition('');
      setContact('');
      setNotes('');
    }
    setError(null);
  }, [editingRequester, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do solicitante.');
      return;
    }

    const finalSection = storeSection === 'Outro' 
      ? customSection.trim() 
      : storeSection;

    if (!finalSection) {
      setError('Por favor, informe a qual parte ou setor da loja o solicitante pertence.');
      return;
    }

    const selectedDep = departments.find(d => d.id === storeDepartmentId);
    const storeDepartmentName = selectedDep ? selectedDep.name : 'Loja Geral';

    onSave(
      {
        name: name.trim(),
        storeDepartmentId: storeDepartmentId || departments[0]?.id || '',
        storeDepartmentName,
        storeSection: finalSection,
        roleOrPosition: roleOrPosition.trim() || undefined,
        contact: contact.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingRequester?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingRequester ? 'Editar Solicitante' : 'Cadastrar Novo Solicitante'}
              </h2>
              <p className="text-xs text-zinc-400">
                Colaborador autorizado a retirar materiais e sua área de atuação
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

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Nome do Solicitante / Colaborador *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Felipe Costa, Marcos Silveira, Amanda Souza..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Loja / Unidade Principal *
              </label>
              <select
                value={storeDepartmentId}
                onChange={(e) => setStoreDepartmentId(e.target.value)}
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

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Cargo / Função (Opcional)
              </label>
              <input
                type="text"
                value={roleOrPosition}
                onChange={(e) => setRoleOrPosition(e.target.value)}
                placeholder="ex: Operador de Caixa, Gerente, Vendedor..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Qual parte da loja ele pertence */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-red-400" />
              <span>Parte da Loja / Setor de Atuação *</span>
            </label>
            <select
              value={storeSection}
              onChange={(e) => setStoreSection(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
            >
              {COMMON_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
              <option value="Outro">Outro setor (especificar)...</option>
            </select>

            {storeSection === 'Outro' && (
              <input
                type="text"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                placeholder="Digite a parte da loja (ex: Sala de TI, Almoxarifado, Balcão 02...)"
                className="mt-2 w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-sm outline-none"
                required
              />
            )}
            <p className="text-[11px] text-zinc-500 mt-1">
              Especifica exatamente onde na loja o colaborador trabalha para direcionamento de materiais.
            </p>
          </div>

          {/* Contact / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Contato / Ramal / WhatsApp
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="ex: Ramal 204 ou (88) 99999-9999"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Responsável pelas trocas de bobinas na frente de caixa"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>
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
              <span>{editingRequester ? 'Salvar Alterações' : 'Cadastrar Solicitante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
