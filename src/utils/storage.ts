import { Department, Product, PrinterItem, WithdrawalRecord, UserSession, Requester } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_PRODUCTS, INITIAL_PRINTERS, INITIAL_WITHDRAWALS } from '../data/initialData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'ti_stock_departments_v2',
  PRODUCTS: 'ti_stock_products_v2',
  PRINTERS: 'ti_stock_printers_v2',
  WITHDRAWALS: 'ti_stock_withdrawals_v2',
  REQUESTERS: 'ti_stock_requesters_v2',
  SESSION: 'ti_stock_session_v2',
  CLEAN_INITIALIZED: 'ti_stock_zeroed_flag_v2',
};

// Automatic cleanup of legacy demo data from localStorage if present
const performAutoResetIfLegacy = () => {
  try {
    const isZeroed = localStorage.getItem(STORAGE_KEYS.CLEAN_INITIALIZED);
    if (!isZeroed) {
      // Remove legacy keys
      localStorage.removeItem('ti_stock_products_v1');
      localStorage.removeItem('ti_stock_printers_v1');
      localStorage.removeItem('ti_stock_withdrawals_v1');
      localStorage.removeItem('ti_stock_departments_v1');

      // Set clean empty state
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      localStorage.setItem(STORAGE_KEYS.CLEAN_INITIALIZED, 'true');
    }
  } catch (err) {
    console.error('Storage initialization error:', err);
  }
};

performAutoResetIfLegacy();

export const getStoredDepartments = (): Department[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      return INITIAL_DEPARTMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading departments:', err);
    return INITIAL_DEPARTMENTS;
  }
};

export const saveStoredDepartments = (deps: Department[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(deps));
  } catch (err) {
    console.error('Error saving departments:', err);
  }
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products:', err);
  }
};

export const getStoredPrinters = (): PrinterItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading printers:', err);
    return [];
  }
};

export const saveStoredPrinters = (printers: PrinterItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers));
  } catch (err) {
    console.error('Error saving printers:', err);
  }
};

export const getStoredWithdrawals = (): WithdrawalRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading withdrawals:', err);
    return [];
  }
};

export const saveStoredWithdrawals = (records: WithdrawalRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving withdrawals:', err);
  }
};

export const getStoredRequesters = (): Requester[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REQUESTERS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading requesters:', err);
    return [];
  }
};

export const saveStoredRequesters = (requesters: Requester[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTERS, JSON.stringify(requesters));
  } catch (err) {
    console.error('Error saving requesters:', err);
  }
};

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

export const saveStoredSession = (session: UserSession | null): void => {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (err) {
    console.error('Error updating session:', err);
  }
};

export const clearAllStockData = (): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REQUESTERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.CLEAN_INITIALIZED, 'true');
};
