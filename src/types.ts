export type Category = 
  | 'Impressoras e Suprimentos'
  | 'Cabos e Conectividade'
  | 'Periféricos'
  | 'Redes e Roteadores'
  | 'Hardware e Peças'
  | 'Acessórios TI'
  | 'Outros';

export type PrinterColorType = 'Colorida' | 'Monocromática (P&B)' | 'Térmica (Etiquetas)';

export type PrinterStatus = 'Disponível no Estoque' | 'Alocada / Em Uso' | 'Em Manutenção' | 'Reserva Técnica';

export interface Department {
  id: string;
  name: string;
  isDefault?: boolean;
  code?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  unit: string; // 'un', 'cx', 'm', 'kit'
  locationDepartmentId: string; // onde o item está guardado ou alocado por padrão
  patrimonyCode?: string;
  serialNumber?: string;
  notes?: string;
  updatedAt: string;
}

export interface PrinterItem {
  id: string;
  model: string; // ex: 'Epson EcoTank L3250', 'HP LaserJet Pro M404dw'
  brand: string; // ex: 'Epson', 'HP', 'Brother', 'Zebra'
  colorType: PrinterColorType; // 'Colorida' | 'Monocromática (P&B)' | 'Térmica (Etiquetas)'
  status: PrinterStatus;
  departmentId: string; // LOJA ACARAU, PREÁ, CD, SERRARIA ou outro
  serialNumber?: string;
  patrimonyNumber?: string;
  ipAddress?: string;
  suppliesNotes?: string; // ex: 'Toner HP 58A', 'Tinta T544 (Preto, Ciano, Magenta, Amarelo)'
  observations?: string;
  quantityAvailable: number; // quantidade física disponível caso sejam impressoras novas em caixa
  updatedAt: string;
}

export interface Requester {
  id: string;
  name: string;
  storeDepartmentId: string; // Qual loja pertence
  storeDepartmentName: string;
  storeSection: string; // Qual parte da loja ele pertence (ex: Frente de Loja, Caixa, Balcão, Gerência, Expedição)
  roleOrPosition?: string; // Cargo (ex: Gerente, Caixa, Vendedor, Operador)
  contact?: string; // Ramal, celular ou WhatsApp
  notes?: string;
  createdAt?: string;
}

export interface WithdrawalRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'product' | 'printer';
  quantity: number;
  destinationDepartmentId: string;
  destinationDepartmentName: string;
  requesterId?: string;
  requesterName: string; // quem retirou / solicitou
  requesterSection?: string; // parte da loja que pertence
  technicianName: string; // responsável de TI que liberou
  ticketOrReason: string; // chamado ou justificativa
  date: string; // ISO string
  targetPrinterId?: string; // ID da impressora destinatária quando for insumo (tinta/toner)
  targetPrinterName?: string; // Nome/modelo da impressora destinatária
}

export interface UserSession {
  username: string;
  name: string;
  role: string;
  authenticated: boolean;
}

export type PurchaseStatus = 'Pendente / A caminho' | 'Entregue' | 'Cancelado';

export interface MonthlyPurchase {
  id: string;
  itemName: string;
  storeOrVendor: string; // Onde foi comprado (preenchido manualmente)
  purchaseUrl?: string; // URL do site onde foi comprado
  quantity: number;
  unitPrice: number; // Valor unitário em R$
  totalPrice: number; // Calculado: quantidade * unitPrice
  purchaseDate: string; // Data da compra (YYYY-MM-DD)
  arrivalDate?: string; // Quando chegou (YYYY-MM-DD)
  status: PurchaseStatus;
  destinationDepartmentId?: string; // Loja/unidade de destino opcional
  destinationDepartmentName?: string;
  trackingCode?: string; // Rastreamento dos correios/transportadora
  notes?: string;
  buyerName?: string;
  createdAt: string;
  updatedAt: string;
}
