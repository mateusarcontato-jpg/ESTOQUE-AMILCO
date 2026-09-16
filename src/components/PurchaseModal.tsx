import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  Truck, 
  Building2, 
  FileText,
  Calculator,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MonthlyPurchase, PurchaseStatus, Department } from '../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseData: Omit<MonthlyPurchase, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  departments: Department[];
  editingPurchase?: MonthlyPurchase | null;
  currentTechnicianName?: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  editingPurchase,
  currentTechnicianName = 'Técnico T.I.',
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [itemName, setItemName] = useState('');
  const [storeOrVendor, setStoreOrVendor] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [status, setStatus] = useState<PurchaseStatus>('Pendente / A caminho');
  const [destinationDepartmentId, setDestinationDepartmentId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-calculated total price: quantity * unitPrice
  const calculatedTotalPrice = Math.max(0, (quantity || 0) * (unitPrice || 0));

  useEffect(() => {
    if (editingPurchase) {
      setItemName(editingPurchase.itemName);
      setStoreOrVendor(editingPurchase.storeOrVendor || '');
      setPurchaseUrl(editingPurchase.purchaseUrl || '');
      setQuantity(editingPurchase.quantity);
      setUnitPrice(editingPurchase.unitPrice);
      setPurchaseDate(editingPurchase.purchaseDate);
      const isDelivered = editingPurchase.status === 'Entregue';
      setHasArrived(isDelivered);
      setArrivalDate(editingPurchase.arrivalDate || (isDelivered ? today : ''));
      setStatus(editingPurchase.status);
      setDestinationDepartmentId(editingPurchase.destinationDepartmentId || '');
      setTrackingCode(editingPurchase.trackingCode || '');
      setNotes(editingPurchase.notes || '');
    } else {
      setItemName('');
      setStoreOrVendor('');
      setPurchaseUrl('');
      setQuantity(1);
      setUnitPrice(0);
      setPurchaseDate(today);
      setHasArrived(false);
      setArrivalDate('');
      setStatus('Pendente / A caminho');
      setDestinationDepartmentId('');
      setTrackingCode('');
      setNotes('');
    }
  }, [editingPurchase, isOpen, today]);

  if (!isOpen) return null;

  const handleArrivedToggle = (checked: boolean) => {
    setHasArrived(checked);
    if (checked) {
      setStatus('Entregue');
      if (!arrivalDate) {
        setArrivalDate(today);
      }
    } else {
      setStatus('Pendente / A caminho');
      setArrivalDate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      alert('Por favor, informe a descrição ou nome do item comprado.');
      return;
    }

    if (!storeOrVendor.trim()) {
      alert('Por favor, informe onde o item foi comprado (loja, fornecedor ou site).');
      return;
    }

    if (quantity <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    const selectedDep = departments.find(d => d.id === destinationDepartmentId);

    onSave(
      {
        itemName: itemName.trim(),
        storeOrVendor: storeOrVendor.trim(),
        purchaseUrl: purchaseUrl.trim(),
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalPrice: Number(calculatedTotalPrice),
        purchaseDate,
        arrivalDate: hasArrived ? (arrivalDate || today) : undefined,
        status: hasArrived ? 'Entregue' : status,
        destinationDepartmentId: destinationDepartmentId || undefined,
        destinationDepartmentName: selectedDep ? selectedDep.name : undefined,
        trackingCode: trackingCode.trim() || undefined,
        notes: notes.trim() || undefined,
        buyerName: currentTechnicianName,
      },
      editingPurchase?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/80 border border-red-800/80 rounded-xl text-red-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                {editingPurchase ? 'Editar Registro de Compra' : 'Registrar Compra do Mês'}
              </h2>
              <p className="text-xs text-zinc-400">
                Cadastre o item, fornecedor, link, valores e data de entrega para controle e PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Item Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              O que foi comprado (Item / Equipamento / Peça) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Ex: 5x Cabos HDMI 2.0 3m, Toner HP 58A, Switch Gigabit 8p..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
            />
          </div>

          {/* Onde foi comprado (Manual) & URL do Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Onde foi comprado (Loja / Fornecedor) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeOrVendor}
                onChange={(e) => setStoreOrVendor(e.target.value)}
                placeholder="Ex: Mercado Livre, Kabum, Amazon, Kalunga, Loja Local..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Mercado Livre', 'Kabum', 'Amazon', 'Kalunga', 'Distribuidora'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setStoreOrVendor(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  URL do Site da Compra (Link)
                </label>
                {purchaseUrl && (
                  <a 
                    href={purchaseUrl.startsWith('http') ? purchaseUrl : `https://${purchaseUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                  >
                    Testar link <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="Ex: https://www.mercadolivre.com.br/item/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition font-mono text-xs"
              />
            </div>
          </div>

          {/* Quantidade, Valor Unitário e Valor Final (Cálculo Automático) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600 text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Valor Unitário (R$) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={unitPrice || ''}
                  onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0,00"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600 font-semibold"
                />
              </div>
            </div>

            {/* Live Calculation Display Box */}
            <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-2.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400 mb-0.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Valor Final (Qtd × Unit.)</span>
              </div>
              <div className="text-base font-black text-red-200">
                {calculatedTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <span className="text-[10px] text-zinc-400">
                {quantity}x de {unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          {/* Datas: Data da Compra & Quando Chegou */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Data da Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasArrived}
                    onChange={(e) => handleArrivedToggle(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 w-4 h-4 cursor-pointer"
                  />
                  <span>Já chegou na empresa? (Entregue)</span>
                </label>
                {hasArrived ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" /> Chegou
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                    <Clock className="w-3 h-3" /> Em trânsito
                  </span>
                )}
              </div>

              {hasArrived ? (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Data em que chegou:
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-red-600"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  Item marcado como pendente / a caminho. Você poderá marcar a data de chegada assim que o entregador chegar.
                </p>
              )}
            </div>
          </div>

          {/* Loja / Destino Opcional & Código de Rastreio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                Destino / Loja (Opcional)
              </label>
              <select
                value={destinationDepartmentId}
                onChange={(e) => setDestinationDepartmentId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 transition"
              >
                <option value="">Geral / Estoque Central T.I.</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-zinc-400" />
                Código de Rastreio / Transportadora (Opcional)
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ex: NL123456789BR, Loggi, Jadlog..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>

          {/* Observações / Notas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Observações / Nota Fiscal / Chamado
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Nota Fiscal nº 4920, Reposição urgente para o caixa 02..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600 transition"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-950 transition cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{editingPurchase ? 'Atualizar Compra' : 'Salvar Compra do Mês'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
