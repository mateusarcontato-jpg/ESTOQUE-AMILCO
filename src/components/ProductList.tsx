import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MinusCircle, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Building2,
  Plus
} from 'lucide-react';
import { Product, Department, Category } from '../types';

interface ProductListProps {
  products: Product[];
  departments: Department[];
  onOpenNewProductModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickWithdrawal: (product: Product) => void;
  filterOnlyLowStock?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  departments,
  onOpenNewProductModal,
  onEditProduct,
  onDeleteProduct,
  onQuickWithdrawal,
  filterOnlyLowStock = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'ok'>(
    filterOnlyLowStock ? 'low' : 'all'
  );

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach(d => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.patrimonyCode && item.patrimonyCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'all' || item.locationDepartmentId === selectedDepartment;

      const isLowStock = item.quantity <= item.minQuantity;
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'low' ? isLowStock :
        !isLowStock;

      return matchesSearch && matchesCategory && matchesDepartment && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedDepartment, statusFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [products]);

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar item, cabo, patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-zinc-300 outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
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

          {/* Stock Level Filter */}
          <div className="flex gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded-lg transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('low')}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                statusFilter === 'low'
                  ? 'bg-red-950/80 text-red-300 border border-red-800'
                  : 'text-zinc-400 hover:text-red-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Baixo</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ok')}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded-lg transition cursor-pointer ${
                statusFilter === 'ok'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Normal
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Inventário Geral de Materiais ({filteredProducts.length} itens listados)
            </h2>
          </div>
          <button
            onClick={onOpenNewProductModal}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Novo Item</span>
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-bold text-zinc-300">
              {products.length === 0 ? 'O estoque está zerado e pronto para uso!' : 'Nenhum item encontrado com os filtros atuais.'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-5">
              {products.length === 0
                ? 'Cadastre os materiais de T.I. da sua empresa (cabos, periféricos, peças, etc.) para iniciar o controle.'
                : 'Tente alterar os filtros ou limpar o termo digitado na busca.'}
            </p>
            <button
              onClick={onOpenNewProductModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Item / Especificação</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Saldo em Estoque</th>
                  <th className="py-3 px-4">Localização / Base</th>
                  <th className="py-3 px-4">Patrimônio</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredProducts.map((product) => {
                  const isLow = product.quantity <= product.minQuantity;
                  const isZero = product.quantity === 0;
                  const depName = departmentMap.get(product.locationDepartmentId) || 'Não especificado';

                  return (
                    <tr 
                      key={product.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                        <div className="font-semibold text-zinc-100 flex items-center gap-2">
                          <span>{product.name}</span>
                          {isLow && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950/90 text-red-400 border border-red-800/70 inline-flex items-center gap-1"
                              title={`Estoque baixo! Mínimo configurado: ${product.minQuantity} ${product.unit}`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {isZero ? 'ESGOTADO' : 'BAIXO'}
                            </span>
                          )}
                        </div>
                        {product.notes && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                            {product.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-sm font-bold ${
                            isZero ? 'text-red-500' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {product.quantity}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {product.unit} (mín: {product.minQuantity})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/40">
                          <Building2 className="w-3 h-3 text-red-400" />
                          <span>{depName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                        {product.patrimonyCode || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Withdrawal button */}
                          <button
                            onClick={() => onQuickWithdrawal(product)}
                            disabled={isZero}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Registrar retirada imediata deste item para uma loja/departamento"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Retirar</span>
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                            title="Editar informações do produto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Excluir item do inventário"
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
