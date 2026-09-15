import React, { useState, useMemo } from 'react';
import { 
  User, 
  Search, 
  Building2, 
  Store, 
  Edit3, 
  Trash2, 
  Plus, 
  MinusCircle, 
  Phone, 
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Requester, Department, WithdrawalRecord } from '../types';

interface RequestersViewProps {
  requesters: Requester[];
  departments: Department[];
  withdrawals: WithdrawalRecord[];
  onOpenNewRequesterModal: () => void;
  onEditRequester: (requester: Requester) => void;
  onDeleteRequester: (requesterId: string) => void;
  onQuickWithdrawalForRequester: (requester: Requester) => void;
}

export const RequestersView: React.FC<RequestersViewProps> = ({
  requesters,
  departments,
  withdrawals,
  onOpenNewRequesterModal,
  onEditRequester,
  onDeleteRequester,
  onQuickWithdrawalForRequester,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const sections = useMemo(() => {
    const set = new Set<string>();
    requesters.forEach(r => {
      if (r.storeSection) set.add(r.storeSection);
    });
    return Array.from(set);
  }, [requesters]);

  const filteredRequesters = useMemo(() => {
    return requesters.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.storeSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.roleOrPosition && r.roleOrPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.contact && r.contact.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDep = selectedDepartment === 'all' || r.storeDepartmentId === selectedDepartment;
      const matchesSection = selectedSection === 'all' || r.storeSection === selectedSection;

      return matchesSearch && matchesDep && matchesSection;
    });
  }, [requesters, searchTerm, selectedDepartment, selectedSection]);

  return (
    <div className="space-y-4">
      {/* Top Banner & KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Colaboradores Cadastrados</p>
            <p className="text-xl font-bold text-white">{requesters.length} solicitantes</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
            <Store className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Setores Mapeados nas Lojas</p>
            <p className="text-xl font-bold text-white">{sections.length} áreas identificadas</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
            <Building2 className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase">Lojas Vinculadas</p>
            <p className="text-xl font-bold text-white">{departments.length} unidades</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome, setor da loja, cargo..."
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
              <option value="all">Todas as Lojas / Unidades</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Todas as Partes / Setores da Loja</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Solicitantes Autorizados & Setores da Loja ({filteredRequesters.length} cadastrados)
            </h2>
          </div>

          <button
            onClick={onOpenNewRequesterModal}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Novo Solicitante</span>
          </button>
        </div>

        {filteredRequesters.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-bold text-zinc-300">
              {requesters.length === 0 ? 'Nenhum solicitante cadastrado ainda.' : 'Nenhum solicitante encontrado com os filtros atuais.'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-5">
              {requesters.length === 0
                ? 'Cadastre os colaboradores das lojas (gerentes, caixas, operadores) e especifique a qual parte da loja eles pertencem.'
                : 'Tente alterar os filtros de busca para encontrar o colaborador.'}
            </p>
            <button
              onClick={onOpenNewRequesterModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Solicitante</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Solicitante / Colaborador</th>
                  <th className="py-3 px-4">Loja / Unidade</th>
                  <th className="py-3 px-4">Parte da Loja / Setor</th>
                  <th className="py-3 px-4">Contato / Ramal</th>
                  <th className="py-3 px-4">Retiradas Vinculadas</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredRequesters.map((req) => {
                  const reqWithdrawals = withdrawals.filter(
                    w => w.requesterId === req.id || w.requesterName.toLowerCase().includes(req.name.toLowerCase())
                  );

                  return (
                    <tr key={req.id} className="hover:bg-zinc-800/30 transition group">
                      {/* Name and Role */}
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-100">{req.name}</span>
                            {req.roleOrPosition && (
                              <span className="block text-[11px] text-zinc-400">
                                {req.roleOrPosition}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Store Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-200 bg-zinc-800/80 border border-zinc-700 px-2 py-0.5 rounded">
                          <Building2 className="w-3 h-3 text-red-400" />
                          <span>{req.storeDepartmentName}</span>
                        </span>
                      </td>

                      {/* Store Section (Qual parte da loja ele pertence) */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/60 text-red-300 border border-red-800/60 shadow-xs">
                          <Store className="w-3 h-3 text-red-400" />
                          <span>{req.storeSection}</span>
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-zinc-400">
                        {req.contact ? (
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            <span>{req.contact}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Total Withdrawals */}
                      <td className="py-3.5 px-4">
                        <span className="text-zinc-300 font-semibold text-xs">
                          {reqWithdrawals.length} baixas
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick withdrawal for this person */}
                          <button
                            onClick={() => onQuickWithdrawalForRequester(req)}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Lançar retirada diretamente para este colaborador"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Lançar Saída</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditRequester(req)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                            title="Editar colaborador"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteRequester(req.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Excluir colaborador"
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
    </div>
  );
};
