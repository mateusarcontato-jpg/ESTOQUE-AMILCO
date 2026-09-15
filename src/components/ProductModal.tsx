import React, { useState, useEffect } from 'react';
import { X, Package, Check, AlertCircle } from 'lucide-react';
import { Product, Department, Category } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'updatedAt'>, editId?: string) => void;
  departments: Department[];
  editingProduct?: Product | null;
}

const CATEGORIES: Category[] = [
  'Impressoras e Suprimentos',
  'Cabos e Conectividade',
  'Periféricos',
  'Redes e Roteadores',
  'Hardware e Peças',
  'Acessórios TI',
  'Outros',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  editingProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Periféricos');
  const [quantity, setQuantity] = useState<number>(1);
  const [minQuantity, setMinQuantity] = useState<number>(3);
  const [unit, setUnit] = useState('un');
  const [locationDepartmentId, setLocationDepartmentId] = useState('');
  const [patrimonyCode, setPatrimonyCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setQuantity(editingProduct.quantity);
      setMinQuantity(editingProduct.minQuantity);
      setUnit(editingProduct.unit);
      setLocationDepartmentId(editingProduct.locationDepartmentId || departments[0]?.id || '');
      setPatrimonyCode(editingProduct.patrimonyCode || '');
      setNotes(editingProduct.notes || '');
    } else {
      setName('');
      setCategory('Periféricos');
      setQuantity(1);
      setMinQuantity(3);
      setUnit('un');
      // Default to CD or first department
      const defaultDep = departments.find(d => d.code === 'CD') || departments[0];
      setLocationDepartmentId(defaultDep ? defaultDep.id : '');
      setPatrimonyCode('');
      setNotes('');
    }
    setError(null);
  }, [editingProduct, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe a descrição ou nome do item.');
      return;
    }

    if (quantity < 0) {
      setError('A quantidade não pode ser negativa.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unit: unit.trim() || 'un',
        locationDepartmentId: locationDepartmentId || departments[0]?.id || '',
        patrimonyCode: patrimonyCode.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingProduct?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingProduct ? 'Editar Item de Estoque' : 'Cadastrar Novo Item no Estoque'}
              </h2>
              <p className="text-xs text-zinc-400">
                Informações de controle e armazenamento do item
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Nome / Descrição do Item *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Cabo HDMI 2.0 3 metros, Mouse USB Dell, Switch 8p..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl text-white text-sm outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Localização / Departamento Base
              </label>
              <select
                value={locationDepartmentId}
                onChange={(e) => setLocationDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Quantidade Atual *
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                <option value="un">un (Unidade)</option>
                <option value="cx">cx (Caixa)</option>
                <option value="kit">kit (Conjunto)</option>
                <option value="m">m (Metros)</option>
                <option value="pct">pct (Pacote)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Patrimônio / Código de Barras (Opcional)
            </label>
            <input
              type="text"
              value={patrimonyCode}
              onChange={(e) => setPatrimonyCode(e.target.value)}
              placeholder="ex: PAT-TI-0092"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Observações / Especificação Técnica
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Cabo blindado categoria 6, padrão Furukawa. Guardado na prateleira B2 do CD."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
