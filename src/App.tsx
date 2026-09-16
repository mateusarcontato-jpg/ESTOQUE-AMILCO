import React, { useState, useEffect } from 'react';
import { 
  getStoredDepartments, 
  saveStoredDepartments,
  getStoredProducts,
  saveStoredProducts,
  getStoredPrinters,
  saveStoredPrinters,
  getStoredWithdrawals,
  saveStoredWithdrawals,
  getStoredRequesters,
  saveStoredRequesters,
  getStoredPurchases,
  saveStoredPurchases,
  getStoredSession,
  saveStoredSession,
  clearAllStockData
} from './utils/storage';
import { Department, Product, PrinterItem, WithdrawalRecord, UserSession, Requester, MonthlyPurchase } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Header, ActiveTab } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { PrintersView } from './components/PrintersView';
import { PrinterModal } from './components/PrinterModal';
import { DepartmentsView } from './components/DepartmentsView';
import { DepartmentsModal } from './components/DepartmentsModal';
import { HistoryView } from './components/HistoryView';
import { RequestersView } from './components/RequestersView';
import { RequesterModal } from './components/RequesterModal';
import { MonthlyPurchasesView } from './components/MonthlyPurchasesView';
import { PurchaseModal } from './components/PurchaseModal';
import { ReportModal } from './components/ReportModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { CheckCircle2, RotateCcw, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import {
  seedInitialFirestoreDataIfEmpty,
  testFirestoreConnection,
  subscribeToDepartments,
  subscribeToProducts,
  subscribeToPrinters,
  subscribeToRequesters,
  subscribeToWithdrawals,
  subscribeToPurchases,
  fetchAllCloudData,
  cloudSaveProduct,
  cloudDeleteProduct,
  cloudSavePrinter,
  cloudDeletePrinter,
  cloudSaveRequester,
  cloudDeleteRequester,
  cloudSaveDepartment,
  cloudDeleteDepartment,
  cloudSavePurchase,
  cloudDeletePurchase,
  cloudRecordWithdrawal,
  cloudUpdateWithdrawalAndStock,
  cloudDeleteWithdrawal,
  cloudClearAllData
} from './services/firebaseService';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());

  // App Data State
  const [departments, setDepartments] = useState<Department[]>(() => getStoredDepartments());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [printers, setPrinters] = useState<PrinterItem[]>(() => getStoredPrinters());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => getStoredWithdrawals());
  const [requesters, setRequesters] = useState<Requester[]>(() => getStoredRequesters());
  const [purchases, setPurchases] = useState<MonthlyPurchase[]>(() => getStoredPurchases());

  // Realtime Cloud Status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Active Navigation Tab: default to 'overview' matching the user's dashboard screenshot
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modals Visibility
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterItem | null>(null);

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [withdrawalPrefillProduct, setWithdrawalPrefillProduct] = useState<Product | null>(null);
  const [withdrawalPrefillRequester, setWithdrawalPrefillRequester] = useState<Requester | null>(null);

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  const [isRequesterModalOpen, setIsRequesterModalOpen] = useState(false);
  const [editingRequester, setEditingRequester] = useState<Requester | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<MonthlyPurchase | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<WithdrawalRecord | null>(null);
  const [isDeletingWithdrawal, setIsDeletingWithdrawal] = useState(false);

  // Filter state shortcuts
  const [filterOnlyLowStock, setFilterOnlyLowStock] = useState(false);
  const [filterOnlyAvailablePrinters, setFilterOnlyAvailablePrinters] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Firestore setup and realtime subscriptions
  useEffect(() => {
    let unsubscribeDepartments: (() => void) | undefined;
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribePrinters: (() => void) | undefined;
    let unsubscribeRequesters: (() => void) | undefined;
    let unsubscribeWithdrawals: (() => void) | undefined;
    let unsubscribePurchases: (() => void) | undefined;

    async function initFirebaseSync() {
      setIsSyncing(true);
      try {
        unsubscribeDepartments = subscribeToDepartments((cloudDeps) => {
          if (cloudDeps.length > 0) {
            setDepartments(cloudDeps);
            saveStoredDepartments(cloudDeps);
          }
          setIsCloudConnected(true);
        });

        unsubscribeProducts = subscribeToProducts((cloudProds) => {
          setProducts(cloudProds);
          saveStoredProducts(cloudProds);
          setIsCloudConnected(true);
          setIsSyncing(false);
        });

        unsubscribePrinters = subscribeToPrinters((cloudPrinters) => {
          setPrinters(cloudPrinters);
          saveStoredPrinters(cloudPrinters);
          setIsCloudConnected(true);
        });

        unsubscribeRequesters = subscribeToRequesters((cloudReqs) => {
          setRequesters(cloudReqs);
          saveStoredRequesters(cloudReqs);
          setIsCloudConnected(true);
        });

        unsubscribeWithdrawals = subscribeToWithdrawals((cloudWiths) => {
          setWithdrawals(cloudWiths);
          saveStoredWithdrawals(cloudWiths);
          setIsCloudConnected(true);
        });

        unsubscribePurchases = subscribeToPurchases((cloudPurchases) => {
          setPurchases(cloudPurchases);
          saveStoredPurchases(cloudPurchases);
          setIsCloudConnected(true);
        });

        // Seed default departments if absent
        seedInitialFirestoreDataIfEmpty().catch(console.warn);
      } catch (err) {
        console.error('Firebase realtime sync initialization failed:', err);
        setIsCloudConnected(false);
      } finally {
        setIsSyncing(false);
      }
    }

    initFirebaseSync();

    return () => {
      unsubscribeDepartments?.();
      unsubscribeProducts?.();
      unsubscribePrinters?.();
      unsubscribeRequesters?.();
      unsubscribeWithdrawals?.();
      unsubscribePurchases?.();
    };
  }, []);

  // Sync to local storage as fallback
  useEffect(() => {
    saveStoredDepartments(departments);
  }, [departments]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredPrinters(printers);
  }, [printers]);

  useEffect(() => {
    saveStoredWithdrawals(withdrawals);
  }, [withdrawals]);

  useEffect(() => {
    saveStoredRequesters(requesters);
  }, [requesters]);

  useEffect(() => {
    saveStoredPurchases(purchases);
  }, [purchases]);

  // Handle Login / Logout
  const handleLogin = (userSession: UserSession) => {
    setSession(userSession);
    saveStoredSession(userSession);
    showToast(`Bem-vindo ao Sistema de Estoque, ${userSession.name}!`);
  };

  const handleLogout = () => {
    setSession(null);
    saveStoredSession(null);
  };

  // --- Product CRUD ---
  const handleSaveProduct = async (
    productData: Omit<Product, 'id' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      const updatedProduct: Product = {
        ...(products.find(p => p.id === editId) || {}),
        ...productData,
        id: editId,
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => prev.map(p => p.id === editId ? updatedProduct : p));
      try {
        await cloudSaveProduct(updatedProduct);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Item "${productData.name}" atualizado com sucesso.`);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productData,
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);
      try {
        await cloudSaveProduct(newProduct);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Item "${productData.name}" cadastrado no estoque.`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const item = products.find(p => p.id === productId);
    if (!item) return;
    if (window.confirm(`Deseja realmente excluir o item "${item.name}" do estoque?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      try {
        await cloudDeleteProduct(productId);
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
      showToast(`Item "${item.name}" removido.`);
    }
  };

  // --- Printer CRUD ---
  const handleSavePrinter = async (
    printerData: Omit<PrinterItem, 'id' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      const updatedPrinter: PrinterItem = {
        ...(printers.find(p => p.id === editId) || {}),
        ...printerData,
        id: editId,
        updatedAt: new Date().toISOString(),
      };
      setPrinters(prev => prev.map(pr => pr.id === editId ? updatedPrinter : pr));
      try {
        await cloudSavePrinter(updatedPrinter);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Impressora "${printerData.brand} ${printerData.model}" atualizada.`);
    } else {
      const newPrinter: PrinterItem = {
        id: `print-${Date.now()}`,
        ...printerData,
        updatedAt: new Date().toISOString(),
      };
      setPrinters(prev => [newPrinter, ...prev]);
      try {
        await cloudSavePrinter(newPrinter);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Impressora "${printerData.brand} ${printerData.model}" (${printerData.colorType}) cadastrada.`);
    }
  };

  const handleDeletePrinter = async (printerId: string) => {
    const item = printers.find(p => p.id === printerId);
    if (!item) return;
    if (window.confirm(`Deseja realmente excluir a impressora "${item.brand} ${item.model}"?`)) {
      setPrinters(prev => prev.filter(p => p.id !== printerId));
      try {
        await cloudDeletePrinter(printerId);
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
      showToast(`Impressora "${item.brand} ${item.model}" removida.`);
    }
  };

  const handleQuickTransferPrinter = async (printer: PrinterItem, newDepartmentId: string) => {
    const targetDep = departments.find(d => d.id === newDepartmentId);
    const updatedPrinter: PrinterItem = {
      ...printer,
      departmentId: newDepartmentId,
      status: targetDep?.code === 'CD' ? 'Disponível no Estoque' : 'Alocada / Em Uso',
      updatedAt: new Date().toISOString(),
    };
    setPrinters(prev => prev.map(p => p.id === printer.id ? updatedPrinter : p));
    try {
      await cloudSavePrinter(updatedPrinter);
    } catch (e) {
      console.warn('Cloud transfer error:', e);
    }
    showToast(`Impressora ${printer.model} transferida para ${targetDep?.name || 'novo departamento'}.`);
  };

  // --- Requester CRUD (Solicitante & Qual parte da loja pertence) ---
  const handleSaveRequester = async (
    requesterData: Omit<Requester, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      const updatedReq: Requester = {
        ...(requesters.find(r => r.id === editId) || {}),
        ...requesterData,
        id: editId,
      };
      setRequesters(prev => prev.map(r => r.id === editId ? updatedReq : r));
      try {
        await cloudSaveRequester(updatedReq);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Solicitante "${requesterData.name}" atualizado.`);
    } else {
      const newReq: Requester = {
        id: `req-${Date.now()}`,
        ...requesterData,
        createdAt: new Date().toISOString(),
      };
      setRequesters(prev => [newReq, ...prev]);
      try {
        await cloudSaveRequester(newReq);
      } catch (e) {
        console.warn('Cloud save error:', e);
      }
      showToast(`Solicitante "${requesterData.name}" (${requesterData.storeSection}) cadastrado.`);
    }
  };

  const handleDeleteRequester = async (requesterId: string) => {
    const req = requesters.find(r => r.id === requesterId);
    if (!req) return;
    if (window.confirm(`Deseja remover o cadastro do solicitante "${req.name}"?`)) {
      setRequesters(prev => prev.filter(r => r.id !== requesterId));
      try {
        await cloudDeleteRequester(requesterId);
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
      showToast(`Solicitante "${req.name}" removido.`);
    }
  };

  const handleQuickWithdrawalForRequester = (requester: Requester) => {
    setEditingWithdrawal(null);
    setWithdrawalPrefillRequester(requester);
    setWithdrawalPrefillProduct(null);
    setIsWithdrawalModalOpen(true);
  };

  // --- Withdrawal Logic ---
  const handleRecordWithdrawal = async (recordData: Omit<WithdrawalRecord, 'id' | 'date'>) => {
    const newRecord: WithdrawalRecord = {
      id: `with-${Date.now()}`,
      ...recordData,
      date: new Date().toISOString(),
    };

    let updatedProduct: Product | undefined;
    let updatedPrinter: PrinterItem | undefined;

    // Deduct quantity from product or printer
    if (recordData.itemType === 'product') {
      const prod = products.find(p => p.id === recordData.itemId);
      if (prod) {
        updatedProduct = {
          ...prod,
          quantity: Math.max(0, prod.quantity - recordData.quantity),
          updatedAt: new Date().toISOString(),
        };
        setProducts(prev => prev.map(p => p.id === recordData.itemId ? updatedProduct! : p));
      }
    } else {
      const pr = printers.find(p => p.id === recordData.itemId);
      if (pr) {
        updatedPrinter = {
          ...pr,
          quantityAvailable: Math.max(0, pr.quantityAvailable - recordData.quantity),
          departmentId: recordData.destinationDepartmentId,
          status: 'Alocada / Em Uso',
          updatedAt: new Date().toISOString(),
        };
        setPrinters(prev => prev.map(p => p.id === recordData.itemId ? updatedPrinter! : p));
      }
    }

    setWithdrawals(prev => [newRecord, ...prev]);

    try {
      await cloudRecordWithdrawal(newRecord, updatedProduct, updatedPrinter);
    } catch (e) {
      console.warn('Cloud record withdrawal error:', e);
    }

    showToast(`Retirada registrada: ${recordData.quantity}x ${recordData.itemName} enviados para ${recordData.destinationDepartmentName}!`);
  };

  const handleUpdateWithdrawal = async (
    updatedRecord: WithdrawalRecord,
    oldRecord: WithdrawalRecord
  ) => {
    const affectedProducts: Product[] = [];
    const affectedPrinters: PrinterItem[] = [];

    let currentProducts = [...products];
    let currentPrinters = [...printers];

    const sameItem = oldRecord.itemType === updatedRecord.itemType && oldRecord.itemId === updatedRecord.itemId;

    if (sameItem) {
      const qtyDiff = updatedRecord.quantity - oldRecord.quantity;

      if (updatedRecord.itemType === 'product') {
        const prod = currentProducts.find(p => p.id === updatedRecord.itemId);
        if (prod) {
          if (qtyDiff > 0 && prod.quantity < qtyDiff) {
            showToast(`Estoque insuficiente! Restam apenas ${prod.quantity} unidades para aumentar a retirada.`);
            return;
          }
          const updatedProd: Product = {
            ...prod,
            quantity: Math.max(0, prod.quantity - qtyDiff),
            updatedAt: new Date().toISOString(),
          };
          currentProducts = currentProducts.map(p => p.id === prod.id ? updatedProd : p);
          affectedProducts.push(updatedProd);
        }
      } else {
        const pr = currentPrinters.find(p => p.id === updatedRecord.itemId);
        if (pr) {
          if (qtyDiff > 0 && pr.quantityAvailable < qtyDiff) {
            showToast(`Quantidade de impressoras insuficiente! Restam ${pr.quantityAvailable} disponíveis.`);
            return;
          }
          const updatedPr: PrinterItem = {
            ...pr,
            quantityAvailable: Math.max(0, pr.quantityAvailable - qtyDiff),
            departmentId: updatedRecord.destinationDepartmentId,
            updatedAt: new Date().toISOString(),
          };
          currentPrinters = currentPrinters.map(p => p.id === pr.id ? updatedPr : p);
          affectedPrinters.push(updatedPr);
        }
      }
    } else {
      // Changed item
      // 1. Refund old item
      if (oldRecord.itemType === 'product') {
        const oldProd = currentProducts.find(p => p.id === oldRecord.itemId);
        if (oldProd) {
          const refundedProd: Product = {
            ...oldProd,
            quantity: oldProd.quantity + oldRecord.quantity,
            updatedAt: new Date().toISOString(),
          };
          currentProducts = currentProducts.map(p => p.id === oldProd.id ? refundedProd : p);
          affectedProducts.push(refundedProd);
        }
      } else {
        const oldPr = currentPrinters.find(p => p.id === oldRecord.itemId);
        if (oldPr) {
          const refundedPr: PrinterItem = {
            ...oldPr,
            quantityAvailable: oldPr.quantityAvailable + oldRecord.quantity,
            updatedAt: new Date().toISOString(),
          };
          currentPrinters = currentPrinters.map(p => p.id === oldPr.id ? refundedPr : p);
          affectedPrinters.push(refundedPr);
        }
      }

      // 2. Deduct from new item
      if (updatedRecord.itemType === 'product') {
        const newProd = currentProducts.find(p => p.id === updatedRecord.itemId);
        if (newProd) {
          if (newProd.quantity < updatedRecord.quantity) {
            showToast(`Estoque insuficiente no novo item selecionado (${newProd.quantity} disponíveis).`);
            return;
          }
          const updatedNewProd: Product = {
            ...newProd,
            quantity: Math.max(0, newProd.quantity - updatedRecord.quantity),
            updatedAt: new Date().toISOString(),
          };
          currentProducts = currentProducts.map(p => p.id === newProd.id ? updatedNewProd : p);
          affectedProducts.push(updatedNewProd);
        }
      } else {
        const newPr = currentPrinters.find(p => p.id === updatedRecord.itemId);
        if (newPr) {
          if (newPr.quantityAvailable < updatedRecord.quantity) {
            showToast(`Impressoras insuficientes no novo item selecionado!`);
            return;
          }
          const updatedNewPr: PrinterItem = {
            ...newPr,
            quantityAvailable: Math.max(0, newPr.quantityAvailable - updatedRecord.quantity),
            departmentId: updatedRecord.destinationDepartmentId,
            status: 'Alocada / Em Uso',
            updatedAt: new Date().toISOString(),
          };
          currentPrinters = currentPrinters.map(p => p.id === newPr.id ? updatedNewPr : p);
          affectedPrinters.push(updatedNewPr);
        }
      }
    }

    setProducts(currentProducts);
    setPrinters(currentPrinters);
    setWithdrawals(prev => prev.map(w => w.id === updatedRecord.id ? updatedRecord : w));

    try {
      await cloudUpdateWithdrawalAndStock(updatedRecord, affectedProducts, affectedPrinters);
    } catch (e) {
      console.warn('Cloud update withdrawal error:', e);
    }

    setEditingWithdrawal(null);
    showToast(`Retirada atualizada com sucesso! Estoque sincronizado.`);
  };

  const handleDeleteWithdrawal = (record: WithdrawalRecord) => {
    // Open in-app confirmation modal (avoids window.confirm which is blocked in iframes)
    setWithdrawalToDelete(record);
  };

  const handleConfirmDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) return;
    const record = withdrawalToDelete;
    setIsDeletingWithdrawal(true);

    let refundedProduct: Product | undefined;
    let refundedPrinter: PrinterItem | undefined;

    if (record.itemType === 'product') {
      const prod = products.find(p => p.id === record.itemId);
      if (prod) {
        refundedProduct = {
          ...prod,
          quantity: prod.quantity + record.quantity,
          updatedAt: new Date().toISOString(),
        };
        setProducts(prev => prev.map(p => p.id === prod.id ? refundedProduct! : p));
      }
    } else {
      const pr = printers.find(p => p.id === record.itemId);
      if (pr) {
        refundedPrinter = {
          ...pr,
          quantityAvailable: pr.quantityAvailable + record.quantity,
          updatedAt: new Date().toISOString(),
        };
        setPrinters(prev => prev.map(p => p.id === pr.id ? refundedPrinter! : p));
      }
    }

    setWithdrawals(prev => prev.filter(w => w.id !== record.id));
    setWithdrawalToDelete(null);
    setIsDeletingWithdrawal(false);

    try {
      await cloudDeleteWithdrawal(record.id, refundedProduct, refundedPrinter);
    } catch (e) {
      console.warn('Cloud delete withdrawal error:', e);
    }

    showToast(`Retirada excluída com sucesso! ${record.quantity}x ${record.itemName} devolvidos ao estoque.`);
  };

  // --- Department Registration ---
  const handleAddDepartment = async (name: string, code?: string) => {
    const newDep: Department = {
      id: `dep-${Date.now()}`,
      name,
      code,
      createdAt: new Date().toISOString(),
    };
    setDepartments(prev => [...prev, newDep]);
    try {
      await cloudSaveDepartment(newDep);
    } catch (e) {
      console.warn('Cloud save department error:', e);
    }
    showToast(`Departamento "${name}" adicionado com sucesso.`);
  };

  const handleDeleteDepartment = async (id: string) => {
    const dep = departments.find(d => d.id === id);
    if (!dep) return;
    if (dep.isDefault) {
      alert('Departamentos padrão (ACARAÚ, PREÁ, CD, SERRARIA) não podem ser excluídos.');
      return;
    }
    if (window.confirm(`Deseja remover o departamento "${dep.name}"?`)) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      try {
        await cloudDeleteDepartment(id);
      } catch (e) {
        console.warn('Cloud delete department error:', e);
      }
      showToast(`Departamento "${dep.name}" removido.`);
    }
  };

  // --- Monthly Purchases CRUD ---
  const handleSavePurchase = async (
    purchaseData: Omit<MonthlyPurchase, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();
    let savedPurchase: MonthlyPurchase;

    if (editId) {
      const existing = purchases.find(p => p.id === editId);
      savedPurchase = {
        ...(existing || {}),
        ...purchaseData,
        id: editId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      setPurchases(prev => prev.map(p => p.id === editId ? savedPurchase : p));
      showToast(`Compra "${savedPurchase.itemName}" atualizada com sucesso!`);
    } else {
      savedPurchase = {
        ...purchaseData,
        id: `pur-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setPurchases(prev => [savedPurchase, ...prev]);
      showToast(`Nova compra "${savedPurchase.itemName}" registrada com sucesso!`);
    }

    try {
      await cloudSavePurchase(savedPurchase);
    } catch (e) {
      console.warn('Cloud save purchase error:', e);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    const p = purchases.find(item => item.id === purchaseId);
    if (!p) return;
    if (window.confirm(`Deseja excluir o registro da compra "${p.itemName}"?`)) {
      setPurchases(prev => prev.filter(item => item.id !== purchaseId));
      try {
        await cloudDeletePurchase(purchaseId);
      } catch (e) {
        console.warn('Cloud delete purchase error:', e);
      }
      showToast(`Compra "${p.itemName}" removida.`);
    }
  };

  const handleMarkAsDelivered = async (purchase: MonthlyPurchase) => {
    const today = new Date().toISOString().split('T')[0];
    const updated: MonthlyPurchase = {
      ...purchase,
      status: 'Entregue',
      arrivalDate: today,
      updatedAt: new Date().toISOString(),
    };

    setPurchases(prev => prev.map(p => p.id === purchase.id ? updated : p));
    showToast(`Pedido "${purchase.itemName}" marcado como entregue hoje!`);

    try {
      await cloudSavePurchase(updated);
    } catch (e) {
      console.warn('Cloud save delivery error:', e);
    }
  };

  // Manual cloud refresh handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchAllCloudData();
      if (data.departments.length > 0) {
        setDepartments(data.departments);
        saveStoredDepartments(data.departments);
      }
      setProducts(data.products);
      saveStoredProducts(data.products);
      setPrinters(data.printers);
      saveStoredPrinters(data.printers);
      setRequesters(data.requesters);
      saveStoredRequesters(data.requesters);
      setWithdrawals(data.withdrawals);
      saveStoredWithdrawals(data.withdrawals);
      setPurchases(data.purchases);
      saveStoredPurchases(data.purchases);
      setIsCloudConnected(true);
      showToast(`Nuvem sincronizada! (${data.products.length} produtos, ${data.printers.length} impressoras, ${data.purchases.length} compras)`);
    } catch (err) {
      console.error('Manual sync error:', err);
      showToast('Erro ao sincronizar com o banco de dados na nuvem.');
      setIsCloudConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset / Clear all stock data
  const handleClearAllStock = async () => {
    if (window.confirm('Tem certeza que deseja zerar o sistema? Todos os produtos cadastrados, impressoras, solicitantes, compras e histórico de retiradas serão limpos na nuvem e localmente.')) {
      clearAllStockData();
      setProducts([]);
      setPrinters([]);
      setWithdrawals([]);
      setRequesters([]);
      setPurchases([]);
      setDepartments(getStoredDepartments());
      try {
        await cloudClearAllData();
      } catch (e) {
        console.warn('Cloud clear error:', e);
      }
      showToast('Sistema zerado com sucesso! Pronto para cadastros reais.');
    }
  };

  // If user is not logged in, display the requested login screen
  if (!session || !session.authenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Header with Navigation and Quick Actions */}
      <Header
        user={session}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFilterOnlyLowStock(false);
          setFilterOnlyAvailablePrinters(false);
        }}
        onOpenProductModal={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenPrinterModal={() => {
          setEditingPrinter(null);
          setIsPrinterModalOpen(true);
        }}
        onOpenWithdrawalModal={() => {
          setEditingWithdrawal(null);
          setWithdrawalPrefillProduct(null);
          setWithdrawalPrefillRequester(null);
          setIsWithdrawalModalOpen(true);
        }}
        onOpenDepartmentModal={() => setIsDepartmentModalOpen(true)}
        onOpenRequesterModal={() => {
          setEditingRequester(null);
          setIsRequesterModalOpen(true);
        }}
        onOpenPurchaseModal={() => {
          setEditingPurchase(null);
          setIsPurchaseModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onLogout={handleLogout}
        onManualSync={handleManualSync}
        productsCount={products.length}
        lowStockCount={lowStockCount}
        purchasesCount={purchases.length}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 0: Visão Geral (Dashboard com índices e degradê preto/vermelho) */}
        {activeTab === 'overview' && (
          <OverviewView
            products={products}
            printers={printers}
            withdrawals={withdrawals}
            departments={departments}
            onOpenWithdrawalModal={() => {
              setEditingWithdrawal(null);
              setWithdrawalPrefillProduct(null);
              setWithdrawalPrefillRequester(null);
              setIsWithdrawalModalOpen(true);
            }}
            onOpenProductModal={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}

        {/* Tab 1: Products Inventory */}
        {activeTab === 'products' && (
          <ProductList
            products={products}
            departments={departments}
            filterOnlyLowStock={filterOnlyLowStock}
            onOpenNewProductModal={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onQuickWithdrawal={(p) => {
              setEditingWithdrawal(null);
              setWithdrawalPrefillProduct(p);
              setWithdrawalPrefillRequester(null);
              setIsWithdrawalModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: Printers Management (Color & Model) */}
        {activeTab === 'printers' && (
          <PrintersView
            printers={printers}
            departments={departments}
            initialFilterAvailable={filterOnlyAvailablePrinters}
            onOpenNewPrinterModal={() => {
              setEditingPrinter(null);
              setIsPrinterModalOpen(true);
            }}
            onEditPrinter={(pr) => {
              setEditingPrinter(pr);
              setIsPrinterModalOpen(true);
            }}
            onDeletePrinter={handleDeletePrinter}
            onQuickTransfer={handleQuickTransferPrinter}
          />
        )}

        {/* Tab 3: Withdrawals History / Audit */}
        {activeTab === 'withdrawals' && (
          <HistoryView
            withdrawals={withdrawals}
            departments={departments}
            onOpenWithdrawalModal={() => {
              setEditingWithdrawal(null);
              setWithdrawalPrefillProduct(null);
              setWithdrawalPrefillRequester(null);
              setIsWithdrawalModalOpen(true);
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onEditWithdrawal={(record) => {
              setEditingWithdrawal(record);
              setWithdrawalPrefillProduct(null);
              setWithdrawalPrefillRequester(null);
              setIsWithdrawalModalOpen(true);
            }}
            onDeleteWithdrawal={handleDeleteWithdrawal}
          />
        )}

        {/* Tab 4: Departments & Units Management */}
        {activeTab === 'departments' && (
          <DepartmentsView
            departments={departments}
            products={products}
            printers={printers}
            withdrawals={withdrawals}
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}

        {/* Tab 5: Solicitantes & Setores da Loja (NOVA ABA SOLICITADA) */}
        {activeTab === 'requesters' && (
          <RequestersView
            requesters={requesters}
            departments={departments}
            withdrawals={withdrawals}
            onOpenNewRequesterModal={() => {
              setEditingRequester(null);
              setIsRequesterModalOpen(true);
            }}
            onEditRequester={(r) => {
              setEditingRequester(r);
              setIsRequesterModalOpen(true);
            }}
            onDeleteRequester={handleDeleteRequester}
            onQuickWithdrawalForRequester={handleQuickWithdrawalForRequester}
          />
        )}

        {/* Tab 6: Compras do Mês (NOVA ABA SOLICITADA PELO USUÁRIO) */}
        {activeTab === 'purchases' && (
          <MonthlyPurchasesView
            purchases={purchases}
            departments={departments}
            onOpenNewPurchaseModal={() => {
              setEditingPurchase(null);
              setIsPurchaseModalOpen(true);
            }}
            onEditPurchase={(p) => {
              setEditingPurchase(p);
              setIsPurchaseModalOpen(true);
            }}
            onDeletePurchase={handleDeletePurchase}
            onMarkAsDelivered={handleMarkAsDelivered}
            currentTechnicianName={session.name}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema T.I. Operacional — Controle de Estoque Corporativo</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAllStock}
              className="text-zinc-500 hover:text-red-400 flex items-center gap-1 transition cursor-pointer text-[11px]"
              title="Limpar e zerar todo o estoque e histórico"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zerar estoque / Limpar dados</span>
            </button>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Unidades: Acaraú • Preá • CD • Serraria</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-red-800/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        departments={departments}
        editingProduct={editingProduct}
      />

      <PrinterModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        onSave={handleSavePrinter}
        departments={departments}
        editingPrinter={editingPrinter}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => {
          setIsWithdrawalModalOpen(false);
          setEditingWithdrawal(null);
        }}
        products={products}
        printers={printers}
        departments={departments}
        requesters={requesters}
        selectedProduct={withdrawalPrefillProduct}
        prefillRequester={withdrawalPrefillRequester}
        editingWithdrawal={editingWithdrawal}
        onRecordWithdrawal={handleRecordWithdrawal}
        onUpdateWithdrawal={handleUpdateWithdrawal}
        onOpenNewDepartmentModal={() => {
          setIsWithdrawalModalOpen(false);
          setIsDepartmentModalOpen(true);
        }}
        onOpenNewRequesterModal={() => {
          setIsWithdrawalModalOpen(false);
          setEditingRequester(null);
          setIsRequesterModalOpen(true);
        }}
        currentTechnicianName={session.name}
      />

      <DepartmentsModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        departments={departments}
        onAddDepartment={handleAddDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        products={products}
        printers={printers}
        withdrawals={withdrawals}
      />

      {/* Solicitante Modal */}
      <RequesterModal
        isOpen={isRequesterModalOpen}
        onClose={() => setIsRequesterModalOpen(false)}
        onSave={handleSaveRequester}
        departments={departments}
        editingRequester={editingRequester}
      />

      {/* Compras do Mês Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handleSavePurchase}
        departments={departments}
        editingPurchase={editingPurchase}
        currentTechnicianName={session.name}
      />

      {/* Relatório Operacional PDF Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        products={products}
        printers={printers}
        withdrawals={withdrawals}
        departments={departments}
        requesters={requesters}
        currentTechnicianName={session.name}
      />

      {/* Modal de Confirmação de Exclusão de Retirada */}
      <ConfirmDeleteModal
        isOpen={!!withdrawalToDelete}
        onClose={() => setWithdrawalToDelete(null)}
        onConfirm={handleConfirmDeleteWithdrawal}
        isLoading={isDeletingWithdrawal}
        title="Excluir Registro de Retirada"
        message="Deseja realmente excluir este registro de retirada? Esta ação cancelará a saída e devolverá os itens diretamente ao estoque disponível."
        details={
          withdrawalToDelete
            ? [
                { label: 'Item', value: withdrawalToDelete.itemName },
                {
                  label: 'Quantidade a Devolver',
                  value: `${withdrawalToDelete.quantity} ${withdrawalToDelete.itemType === 'product' ? 'unidades' : 'impressora(s)'}`,
                },
                { label: 'Destino', value: withdrawalToDelete.destinationDepartmentName },
                { label: 'Solicitante', value: withdrawalToDelete.requesterName },
              ]
            : []
        }
        confirmButtonText="Sim, Excluir e Devolver ao Estoque"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}
