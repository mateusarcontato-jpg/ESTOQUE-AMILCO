import { Department, Product, PrinterItem, WithdrawalRecord } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dep-acarau', name: 'LOJA ACARAÚ', isDefault: true, code: 'ACR', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'dep-prea', name: 'PREÁ', isDefault: true, code: 'PRE', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'dep-cd', name: 'CD (Centro de Distribuição)', isDefault: true, code: 'CD', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'dep-serraria', name: 'SERRARIA', isDefault: true, code: 'SER', createdAt: '2025-01-01T00:00:00Z' },
];

// Sistema zerado para uso em produção
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PRINTERS: PrinterItem[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [];
