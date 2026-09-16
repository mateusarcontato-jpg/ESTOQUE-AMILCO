import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Department, Product, PrinterItem, WithdrawalRecord, Requester, MonthlyPurchase } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_PRODUCTS, INITIAL_PRINTERS } from '../data/initialData';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (support named database if specified in config)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (err) {
    console.warn('Firestore connection check:', err);
    return true; // Still connected or initialized
  }
}

// Collections references
export const COLLECTIONS = {
  departments: 'departments',
  products: 'products',
  printers: 'printers',
  requesters: 'requesters',
  withdrawals: 'withdrawals',
  purchases: 'purchases',
} as const;

// Clean undefined fields so Firestore setDoc never fails
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

// Seed initial departments to cloud if departments collection is empty
export async function seedInitialFirestoreDataIfEmpty() {
  try {
    // Only check default departments (Acaraú, Preá, CD, Serraria)
    const depSnap = await getDocs(collection(db, COLLECTIONS.departments));
    if (depSnap.empty) {
      for (const dep of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, COLLECTIONS.departments, dep.id), cleanFirestoreData(dep));
      }
    }
  } catch (error) {
    console.error('Error seeding default departments:', error);
  }
}

// Fetch all cloud data manually on demand (useful for immediate refresh or mobile devices)
export async function fetchAllCloudData() {
  const [depSnap, prodSnap, printSnap, reqSnap, withSnap, purSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.departments)),
    getDocs(collection(db, COLLECTIONS.products)),
    getDocs(collection(db, COLLECTIONS.printers)),
    getDocs(collection(db, COLLECTIONS.requesters)),
    getDocs(collection(db, COLLECTIONS.withdrawals)),
    getDocs(collection(db, COLLECTIONS.purchases)),
  ]);

  const departments = depSnap.docs.map(d => d.data() as Department);
  const products = prodSnap.docs.map(d => d.data() as Product);
  const printers = printSnap.docs.map(d => d.data() as PrinterItem);
  const requesters = reqSnap.docs.map(d => d.data() as Requester);
  const withdrawals = withSnap.docs.map(d => d.data() as WithdrawalRecord);
  const purchases = purSnap.docs.map(d => d.data() as MonthlyPurchase);

  return { departments, products, printers, requesters, withdrawals, purchases };
}

// --- Realtime Subscriptions ---

export function subscribeToDepartments(callback: (departments: Department[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.departments), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Department);
    // Sort default ones first, then alphabetical
    data.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
    callback(data);
  }, (err) => {
    console.error('Error subscribing to departments:', err);
  });
}

export function subscribeToProducts(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.products), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Product);
    data.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    callback(data);
  }, (err) => {
    console.error('Error subscribing to products:', err);
  });
}

export function subscribeToPrinters(callback: (printers: PrinterItem[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.printers), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as PrinterItem);
    data.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    callback(data);
  }, (err) => {
    console.error('Error subscribing to printers:', err);
  });
}

export function subscribeToRequesters(callback: (requesters: Requester[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.requesters), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Requester);
    data.sort((a, b) => a.name.localeCompare(b.name));
    callback(data);
  }, (err) => {
    console.error('Error subscribing to requesters:', err);
  });
}

export function subscribeToWithdrawals(callback: (withdrawals: WithdrawalRecord[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.withdrawals), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as WithdrawalRecord);
    data.sort((a, b) => b.date.localeCompare(a.date));
    callback(data);
  }, (err) => {
    console.error('Error subscribing to withdrawals:', err);
  });
}

export function subscribeToPurchases(callback: (purchases: MonthlyPurchase[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.purchases), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as MonthlyPurchase);
    data.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
    callback(data);
  }, (err) => {
    console.error('Error subscribing to purchases:', err);
  });
}

// --- Cloud Write Helpers ---

export async function cloudSaveProduct(product: Product) {
  await setDoc(doc(db, COLLECTIONS.products, product.id), cleanFirestoreData(product));
}

export async function cloudDeleteProduct(productId: string) {
  await deleteDoc(doc(db, COLLECTIONS.products, productId));
}

export async function cloudSavePrinter(printer: PrinterItem) {
  await setDoc(doc(db, COLLECTIONS.printers, printer.id), cleanFirestoreData(printer));
}

export async function cloudDeletePrinter(printerId: string) {
  await deleteDoc(doc(db, COLLECTIONS.printers, printerId));
}

export async function cloudSaveRequester(requester: Requester) {
  await setDoc(doc(db, COLLECTIONS.requesters, requester.id), cleanFirestoreData(requester));
}

export async function cloudDeleteRequester(requesterId: string) {
  await deleteDoc(doc(db, COLLECTIONS.requesters, requesterId));
}

export async function cloudSavePurchase(purchase: MonthlyPurchase) {
  await setDoc(doc(db, COLLECTIONS.purchases, purchase.id), cleanFirestoreData(purchase));
}

export async function cloudDeletePurchase(purchaseId: string) {
  await deleteDoc(doc(db, COLLECTIONS.purchases, purchaseId));
}

export async function cloudSaveDepartment(department: Department) {
  await setDoc(doc(db, COLLECTIONS.departments, department.id), cleanFirestoreData(department));
}

export async function cloudDeleteDepartment(departmentId: string) {
  await deleteDoc(doc(db, COLLECTIONS.departments, departmentId));
}

export async function cloudRecordWithdrawal(
  record: WithdrawalRecord, 
  updatedProduct?: Product, 
  updatedPrinter?: PrinterItem
) {
  await setDoc(doc(db, COLLECTIONS.withdrawals, record.id), cleanFirestoreData(record));
  
  if (updatedProduct) {
    await setDoc(doc(db, COLLECTIONS.products, updatedProduct.id), cleanFirestoreData(updatedProduct));
  }
  
  if (updatedPrinter) {
    await setDoc(doc(db, COLLECTIONS.printers, updatedPrinter.id), cleanFirestoreData(updatedPrinter));
  }
}

export async function cloudClearAllData() {
  const collectionsToClear = [
    COLLECTIONS.products,
    COLLECTIONS.printers,
    COLLECTIONS.requesters,
    COLLECTIONS.withdrawals,
    COLLECTIONS.purchases,
  ];

  for (const collName of collectionsToClear) {
    const snap = await getDocs(collection(db, collName));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, collName, d.id));
    }
  }
}
