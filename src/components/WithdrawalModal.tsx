import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MinusCircle, 
  AlertCircle, 
  ArrowUpRight, 
  Plus, 
  User, 
  Store, 
  Pencil, 
  Check, 
  Printer, 
  Search, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { Product, Department, WithdrawalRecord, PrinterItem, Requester } from '../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  printers: PrinterItem[];
  departments: Department[];
  requesters?: Requester[];
  selectedProduct?: Product | null;
  prefillRequester?: Requester | null;
  editingWithdrawal?: WithdrawalRecord | null;
  onRecordWithdrawal: (record: Omit<WithdrawalRecord, 'id' | 'date'>) => void;
  onUpdateWithdrawal?: (updatedRecord: WithdrawalRecord, oldRecord: WithdrawalRecord) => void;
  onOpenNewDepartmentModal: () => void;
  onOpenNewRequesterModal?: () => void;
  currentTechnicianName: string;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  products,
  printers,
  departments,
  requesters = [],
  selectedProduct,
  prefillRequester,
  editingWithdrawal,
  onRecordWithdrawal,
  onUpdateWithdrawal,
  onOpenNewDepartmentModal,
  onOpenNewRequesterModal,
  currentTechnicianName,
}) => {
  const [itemType, setItemType] = useState<'product' | 'printer'>('product');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [destinationDepartmentId, setDestinationDepartmentId] = useState<string>('');
  
  // Search filter for products
  const [itemSearch, setItemSearch] = useState<string>('');

  // Target printer linked for supplies (tinta / toner)
  const [targetPrinterId, setTargetPrinterId] = useState<string>('');
  const [targetPrinterName, setTargetPrinterName] = useState<string>('');
  const [printerFilterTab, setPrinterFilterTab] = useState<'auto' | 'mono' | 'color' | 'all'>('auto');

  // Requester Selection Mode: 'registered' or 'custom'
  const [selectedRequesterId, setSelectedRequesterId] = useState<string>('');
  const [customRequesterName, setCustomRequesterName] = useState<string>('');
  const [customRequesterSection, setCustomRequesterSection] = useState<string>('');

  const [technicianName, setTechnicianName] = useState<string>(currentTechnicianName);
  const [ticketOrReason, setTicketOrReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingWithdrawal) {
      // Prefill for editing
      setItemType(editingWithdrawal.itemType);
      setSelectedItemId(editingWithdrawal.itemId);
      setQuantity(editingWithdrawal.quantity);
      setDestinationDepartmentId(editingWithdrawal.destinationDepartmentId);
      setTargetPrinterId(editingWithdrawal.targetPrinterId || '');
      setTargetPrinterName(editingWithdrawal.targetPrinterName || '');
      setPrinterFilterTab('auto');
      setItemSearch('');

      if (editingWithdrawal.requesterId && requesters.some(r => r.id === editingWithdrawal.requesterId)) {
        setSelectedRequesterId(editingWithdrawal.requesterId);
        setCustomRequesterName('');
        setCustomRequesterSection('');
      } else {
        const foundByName = (requesters || []).find(r => 
          (r?.name || '').toLowerCase() === (editingWithdrawal.requesterName || '').toLowerCase()
        );
        if (foundByName) {
          setSelectedRequesterId(foundByName.id);
          setCustomRequesterName('');
          setCustomRequesterSection('');
        } else {
          setSelectedRequesterId('custom');
          setCustomRequesterName(editingWithdrawal.requesterName || '');
          setCustomRequesterSection(editingWithdrawal.requesterSection || '');
        }
      }

      setTechnicianName(editingWithdrawal.technicianName || currentTechnicianName);
      setTicketOrReason(editingWithdrawal.ticketOrReason || '');
    } else if (selectedProduct) {
      setItemType('product');
      setSelectedItemId(selectedProduct.id);
      setQuantity(1);
      setTargetPrinterId('');
      setTargetPrinterName('');
      setPrinterFilterTab('auto');
      setItemSearch('');
      setTechnicianName(currentTechnicianName);
      setTicketOrReason('');
    } else {
      setItemType('product');
      if (products.length > 0) {
        setSelectedItemId(products[0].id);
      }
      setQuantity(1);
      setTargetPrinterId('');
      setTargetPrinterName('');
      setPrinterFilterTab('auto');
      setItemSearch('');
      setTechnicianName(currentTechnicianName);
      setTicketOrReason('');
    }

    if (!editingWithdrawal) {
      if (prefillRequester) {
        setSelectedRequesterId(prefillRequester.id);
        if (prefillRequester.storeDepartmentId) {
          setDestinationDepartmentId(prefillRequester.storeDepartmentId);
        }
      } else if (requesters.length > 0) {
        setSelectedRequesterId(requesters[0].id);
        if (requesters[0].storeDepartmentId) {
          setDestinationDepartmentId(requesters[0].storeDepartmentId);
        }
      } else if (departments.length > 0) {
        setDestinationDepartmentId(departments[0].id);
      }
    }

    setError(null);
  }, [editingWithdrawal, selectedProduct, prefillRequester, products, departments, requesters, currentTechnicianName, isOpen]);

  // Selected item reference
  const currentProduct = itemType === 'product' 
    ? products.find(p => p.id === selectedItemId) 
    : null;

  const currentPrinter = itemType === 'printer'
    ? printers.find(p => p.id === selectedItemId)
    : null;

  // Filtered products list by search query
  const filteredProducts = useMemo(() => {
    if (!itemSearch || !itemSearch.trim()) return products || [];
    const q = itemSearch.toLowerCase().trim();
    return (products || []).filter(p => 
      (p?.name || '').toLowerCase().includes(q) || 
      (p?.category || '').toLowerCase().includes(q)
    );
  }, [products, itemSearch]);

  // When user types in product search, auto-select first match
  const handleItemSearchChange = (text: string) => {
    setItemSearch(text);
    const q = (text || '').toLowerCase().trim();
    if (q && itemType === 'product') {
      const matched = (products || []).find(p => 
        (p?.name || '').toLowerCase().includes(q) || 
        (p?.category || '').toLowerCase().includes(q)
      );
      if (matched) {
        setSelectedItemId(matched.id);
      }
    }
  };

  // Smart ink / toner detection
  const selectedProdName = (currentProduct?.name || '').toLowerCase();
  const searchLower = (itemSearch || '').toLowerCase().trim();

  const isToner = selectedProdName.includes('toner') || selectedProdName.includes('tonner') ||
                  searchLower.includes('toner') || searchLower.includes('tonner');

  const isInk = selectedProdName.includes('tinta') || selectedProdName.includes('cartucho') || selectedProdName.includes('refil') ||
                selectedProdName.includes('amarel') || selectedProdName.includes('yellow') || selectedProdName.includes('magenta') ||
                selectedProdName.includes('ciano') || selectedProdName.includes('cyan') || selectedProdName.includes('preto') || selectedProdName.includes('black') ||
                searchLower.includes('tinta') || searchLower.includes('cartucho') || searchLower.includes('refil');

  const isPrinterSupply = itemType === 'product' && (isToner || isInk || currentProduct?.category === 'Impressoras e Suprimentos');

  // Categorize registered printers safely
  const monoPrinters = useMemo(() => {
    return (printers || []).filter(p => {
      const c = (p?.colorType || '').toLowerCase();
      return c.includes('mono') || c.includes('p&b') || c.includes('preto');
    });
  }, [printers]);

  const colorPrinters = useMemo(() => {
    return (printers || []).filter(p => {
      const c = (p?.colorType || '').toLowerCase();
      return c.includes('color');
    });
  }, [printers]);

  // Determine active printer tab (auto chooses based on toner vs ink)
  const activePrinterTab = printerFilterTab === 'auto' 
    ? (isToner ? 'mono' : isInk ? 'color' : 'all') 
    : printerFilterTab;

  const visiblePrinters = useMemo(() => {
    if (activePrinterTab === 'mono') return monoPrinters;
    if (activePrinterTab === 'color') return colorPrinters;
    return printers || [];
  }, [activePrinterTab, monoPrinters, colorPrinters, printers]);

  const handleSelectTargetPrinter = (printerId: string) => {
    setTargetPrinterId(printerId);
    const pr = (printers || []).find(p => p.id === printerId);
    if (pr) {
      const colorLabel = pr.colorType ? ` (${pr.colorType})` : '';
      const fullName = `${pr.brand || ''} ${pr.model || ''}${colorLabel}`.trim();
      setTargetPrinterName(fullName);
      if (pr.departmentId) {
        setDestinationDepartmentId(pr.departmentId);
      }
    } else {
      setTargetPrinterName('');
    }
  };

  const selectedPrinterObj = (printers || []).find(p => p.id === targetPrinterId);

  // Stock synchronization calculation:
  // If we are editing the exact same item, previously withdrawn units are refundable,
  // so max allowed to withdraw is: currentInStock + editingWithdrawal.quantity
  const isEditingSameItem = Boolean(
    editingWithdrawal && 
    editingWithdrawal.itemType === itemType && 
    editingWithdrawal.itemId === selectedItemId
  );

  const baseAvailable = itemType === 'product'
    ? (currentProduct?.quantity ?? 0)
    : (currentPrinter?.quantityAvailable ?? 0);

  const maxAvailable = isEditingSameItem && editingWithdrawal
    ? baseAvailable + editingWithdrawal.quantity
    : baseAvailable;

  // When user selects a registered requester
  const handleSelectRequester = (reqId: string) => {
    setSelectedRequesterId(reqId);
    if (reqId !== 'custom') {
      const found = requesters.find(r => r.id === reqId);
      if (found && found.storeDepartmentId) {
        setDestinationDepartmentId(found.storeDepartmentId);
      }
    }
  };

  const selectedRequesterObj = requesters.find(r => r.id === selectedRequesterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItemId) {
      setError('Selecione um item para retirada.');
      return;
    }

    if (quantity <= 0) {
      setError('A quantidade de retirada deve ser maior que zero.');
      return;
    }

    if (quantity > maxAvailable) {
      setError(`Quantidade insuficiente em estoque! Disponível atualmente: ${maxAvailable}`);
      return;
    }

    if (!destinationDepartmentId) {
      setError('Selecione o departamento ou loja de destino.');
      return;
    }

    // Determine requester name & section
    let finalRequesterName = '';
    let finalRequesterSection = '';
    let finalRequesterId: string | undefined = undefined;

    if (selectedRequesterId && selectedRequesterId !== 'custom') {
      const found = requesters.find(r => r.id === selectedRequesterId);
      if (found) {
        finalRequesterName = found.name;
        finalRequesterSection = found.storeSection;
        finalRequesterId = found.id;
      }
    } else {
      finalRequesterName = customRequesterName.trim();
      finalRequesterSection = customRequesterSection.trim();
    }

    if (!finalRequesterName) {
      setError('Informe o solicitante que está recebendo o material.');
      return;
    }

    const destDep = departments.find(d => d.id === destinationDepartmentId);
    const destName = destDep ? destDep.name : 'Departamento não especificado';

    const itemName = itemType === 'product'
      ? (currentProduct?.name || 'Item')
      : `${currentPrinter?.brand || ''} ${currentPrinter?.model || ''} (${currentPrinter?.colorType || ''})`;

    const finalTargetPrinterName = selectedPrinterObj
      ? `${selectedPrinterObj.brand} ${selectedPrinterObj.model} (${selectedPrinterObj.colorType})`
      : targetPrinterName || undefined;

    if (editingWithdrawal && onUpdateWithdrawal) {
      onUpdateWithdrawal(
        {
          ...editingWithdrawal,
          itemId: selectedItemId,
          itemName,
          itemType,
          quantity: Number(quantity),
          destinationDepartmentId,
          destinationDepartmentName: destName,
          targetPrinterId: targetPrinterId || undefined,
          targetPrinterName: finalTargetPrinterName,
          requesterId: finalRequesterId,
          requesterName: finalRequesterName,
          requesterSection: finalRequesterSection || undefined,
          technicianName: technicianName.trim() || 'T.I. Suporte',
          ticketOrReason: ticketOrReason.trim() || 'Retirada solicitada para o setor',
        },
        editingWithdrawal
      );
    } else {
      onRecordWithdrawal({
        itemId: selectedItemId,
        itemName,
        itemType,
        quantity: Number(quantity),
        destinationDepartmentId,
        destinationDepartmentName: destName,
        targetPrinterId: targetPrinterId || undefined,
        targetPrinterName: finalTargetPrinterName,
        requesterId: finalRequesterId,
        requesterName: finalRequesterName,
        requesterSection: finalRequesterSection || undefined,
        technicianName: technicianName.trim() || 'T.I. Suporte',
        ticketOrReason: ticketOrReason.trim() || 'Retirada solicitada para o setor',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              editingWithdrawal 
                ? 'bg-amber-950/70 border border-amber-800/60 text-amber-400' 
                : 'bg-red-950 border border-red-800/60 text-red-400'
            }`}>
              {editingWithdrawal ? <Pencil className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingWithdrawal ? 'Editar Registro de Retirada / Saída' : 'Registrar Retirada / Saída de Estoque'}
              </h2>
              <p className="text-xs text-zinc-400">
                {editingWithdrawal 
                  ? 'Ajuste quantidade, item, destino ou solicitante com recálculo automático de estoque' 
                  : 'Baixa imediata no inventário, vinculando ao solicitante e parte da loja'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Product vs Printer) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Tipo de Item para Retirada
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setItemType('product');
                  if (products.length > 0) setSelectedItemId(products[0].id);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition cursor-pointer ${
                  itemType === 'product'
                    ? 'bg-red-950/40 border-red-500 text-red-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                Produto / Material Geral
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType('printer');
                  const firstAvail = printers.find(p => p.status === 'Disponível no Estoque') || printers[0];
                  if (firstAvail) setSelectedItemId(firstAvail.id);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition cursor-pointer ${
                  itemType === 'printer'
                    ? 'bg-red-950/40 border-red-500 text-red-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                Impressora Específica
              </button>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Item a Ser Retirado *
              </label>
              {itemType === 'product' && (
                <span className="text-[11px] text-zinc-400">
                  {filteredProducts.length} produto(s) disponível(is)
                </span>
              )}
            </div>

            {/* Quick search input for products */}
            {itemType === 'product' && (
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar item (ex: digite 'tinta', 'toner', 'cabo')..."
                  value={itemSearch}
                  onChange={(e) => handleItemSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-xs placeholder-zinc-500 outline-none"
                />
                {itemSearch && (
                  <button
                    type="button"
                    onClick={() => handleItemSearchChange('')}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white text-xs cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {itemType === 'product' ? (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {filteredProducts.length === 0 ? (
                  <option value="">Nenhum produto correspondente encontrado</option>
                ) : (
                  filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Disponível: {p.quantity} {p.unit})
                    </option>
                  ))
                )}
              </select>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {printers.length === 0 ? (
                  <option value="">Nenhuma impressora cadastrada</option>
                ) : (
                  printers.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.brand || ''} {pr.model || ''} — {pr.colorType || 'Impressora'} ({pr.status || 'Disponível'}) - {pr.quantityAvailable || 0} un.
                    </option>
                  ))
                )}
              </select>
            )}
            
            {/* Stock indicator badge */}
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Saldo atual no estoque:</span>
              <span className={`font-semibold ${maxAvailable > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {baseAvailable} {itemType === 'product' ? currentProduct?.unit || 'un' : 'unidades'} em estoque
                {isEditingSameItem && editingWithdrawal && (
                  <span className="text-amber-400 font-normal ml-1">
                    (+{editingWithdrawal.quantity} da retirada em edição = {maxAvailable} máx)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Guia Inteligente para Insumo de Impressora (Tinta / Toner) */}
          {isPrinterSupply && (
            <div className="bg-gradient-to-b from-red-950/25 to-zinc-950 border-2 border-red-500/50 rounded-2xl p-4 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400 shadow-sm">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Especificar Impressora de Destino</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-medium">
                      {isToner 
                        ? '⬛ Toner detectado: mostrando impressoras Monocromáticas (P&B) cadastradas' 
                        : isInk 
                        ? '🎨 Tinta detectada: mostrando impressoras Coloridas cadastradas' 
                        : 'Vincule este suprimento à impressora cadastrada correspondente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmented control tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPrinterFilterTab('mono')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center text-[11px] ${
                    activePrinterTab === 'mono'
                      ? 'bg-red-900/80 text-white shadow-sm border border-red-600'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⬛ Monocromáticas ({monoPrinters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPrinterFilterTab('color')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center text-[11px] ${
                    activePrinterTab === 'color'
                      ? 'bg-red-900/80 text-white shadow-sm border border-red-600'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🎨 Coloridas ({colorPrinters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPrinterFilterTab('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center text-[11px] ${
                    activePrinterTab === 'all'
                      ? 'bg-red-900/80 text-white shadow-sm border border-red-600'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Todas ({printers.length})
                </button>
              </div>

              {/* Printer Select */}
              <div>
                <select
                  value={targetPrinterId}
                  onChange={(e) => handleSelectTargetPrinter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 focus:border-red-500 rounded-xl text-white text-xs outline-none cursor-pointer"
                >
                  <option value="">-- Selecione a impressora cadastrada que receberá o insumo --</option>
                  {visiblePrinters.map((pr) => {
                    const dep = departments.find(d => d.id === pr.departmentId);
                    const colorLabel = pr.colorType || 'Impressora';
                    return (
                      <option key={pr.id} value={pr.id}>
                        {pr.brand || ''} {pr.model || ''} — {colorLabel} (Local: {dep?.name || 'Central T.I.'}) [{pr.status || 'Disponível'}]
                      </option>
                    );
                  })}
                </select>

                {visiblePrinters.length === 0 && (
                  <p className="text-[11px] text-amber-400/90 mt-1">
                    Nenhuma impressora deste tipo ({activePrinterTab === 'mono' ? 'Monocromática' : 'Colorida'}) encontrada. Você pode alternar para a aba "Todas" acima.
                  </p>
                )}
              </div>

              {/* Active Selected Printer Info Card */}
              {selectedPrinterObj && (
                <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-red-400" />
                      <span>{selectedPrinterObj.brand || ''} {selectedPrinterObj.model || ''}</span>
                      {selectedPrinterObj.colorType && (
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-semibold">
                          {selectedPrinterObj.colorType}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>
                        Local cadastrado da impressora: <strong>{departments.find(d => d.id === selectedPrinterObj.departmentId)?.name || 'Central de T.I.'}</strong>
                      </span>
                    </div>
                  </div>

                  {selectedPrinterObj.departmentId && destinationDepartmentId !== selectedPrinterObj.departmentId && (
                    <button
                      type="button"
                      onClick={() => setDestinationDepartmentId(selectedPrinterObj.departmentId)}
                      className="px-2.5 py-1.5 bg-red-950/90 hover:bg-red-900 border border-red-700/80 rounded-lg text-[11px] font-bold text-red-200 transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                      title="Sincronizar loja de destino da saída com a localização desta impressora"
                    >
                      <Check className="w-3 h-3" />
                      <span>Definir Destino para esta Loja</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Quantidade a Retirar *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={maxAvailable > 0 ? maxAvailable : 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none font-bold"
                required
              />
              <span className="text-xs text-zinc-400">
                Máximo permitido: <strong className="text-white">{maxAvailable}</strong>
              </span>
            </div>
          </div>

          {/* Solicitante & Parte da Loja */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                <span>Solicitante do Item & Setor *</span>
              </label>

              {onOpenNewRequesterModal && (
                <button
                  type="button"
                  onClick={onOpenNewRequesterModal}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Cadastrar Solicitante</span>
                </button>
              )}
            </div>

            {requesters.length > 0 ? (
              <div>
                <select
                  value={selectedRequesterId}
                  onChange={(e) => handleSelectRequester(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-sm outline-none cursor-pointer"
                >
                  {requesters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.storeSection} ({r.storeDepartmentName})
                    </option>
                  ))}
                  <option value="custom">Outro (Digitar manualmente)...</option>
                </select>

                {selectedRequesterObj && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Parte da Loja:</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-300 font-semibold text-[11px] flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>{selectedRequesterObj.storeSection}</span>
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300 font-medium">{selectedRequesterObj.storeDepartmentName}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Custom requester input if no requesters exist or "custom" chosen */}
            {(requesters.length === 0 || selectedRequesterId === 'custom') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <input
                    type="text"
                    value={customRequesterName}
                    onChange={(e) => setCustomRequesterName(e.target.value)}
                    placeholder="Nome do Solicitante (ex: Felipe Costa)"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customRequesterSection}
                    onChange={(e) => setCustomRequesterSection(e.target.value)}
                    placeholder="Parte da Loja (ex: Frente de Loja / Caixa)"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl text-white text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Destination Department */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Departamento / Loja de Destino *
              </label>
              <button
                type="button"
                onClick={onOpenNewDepartmentModal}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Novo Departamento</span>
              </button>
            </div>
            
            <select
              value={destinationDepartmentId}
              onChange={(e) => setDestinationDepartmentId(e.target.value)}
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

          {/* Technician & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Técnico T.I. Responsável
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="ex: Suporte T.I."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Motivo / Chamado / Destinação
              </label>
              <input
                type="text"
                value={ticketOrReason}
                onChange={(e) => setTicketOrReason(e.target.value)}
                placeholder="ex: Chamado #204 - Troca de teclado no caixa"
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
              disabled={maxAvailable <= 0}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                editingWithdrawal
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-950'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-950'
              }`}
            >
              {editingWithdrawal ? <Check className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4 text-white" />}
              <span>{editingWithdrawal ? 'Salvar Alterações & Sincronizar' : 'Confirmar Retirada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
