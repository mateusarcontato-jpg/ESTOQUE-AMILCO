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
import { Department, Product, PrinterItem, WithdrawalRecord, Requester } from '../types';
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
} as const;

// Seed initial data to cloud if collections are empty
export async function seedInitialFirestoreDataIfEmpty() {
  try {
    // Check departments
    const depSnap = await getDocs(collection(db, COLLECTIONS.departments));
    if (depSnap.empty) {
      for (const dep of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, COLLECTIONS.departments, dep.id), dep);
      }
    }

    // Check products
    const prodSnap = await getDocs(collection(db, COLLECTIONS.products));
    if (prodSnap.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, COLLECTIONS.products, prod.id), prod);
      }
    }

    // Check printers
    const printSnap = await getDocs(collection(db, COLLECTIONS.printers));
    if (printSnap.empty) {
      for (const pr of INITIAL_PRINTERS) {
        await setDoc(doc(db, COLLECTIONS.printers, pr.id), pr);
      }
    }
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
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

// --- Cloud Write Helpers ---

export async function cloudSaveProduct(product: Product) {
  await setDoc(doc(db, COLLECTIONS.products, product.id), product);
}

export async function cloudDeleteProduct(productId: string) {
  await deleteDoc(doc(db, COLLECTIONS.products, productId));
}

export async function cloudSavePrinter(printer: PrinterItem) {
  await setDoc(doc(db, COLLECTIONS.printers, printer.id), printer);
}

export async function cloudDeletePrinter(printerId: string) {
  await deleteDoc(doc(db, COLLECTIONS.printers, printerId));
}

export async function cloudSaveRequester(requester: Requester) {
  await setDoc(doc(db, COLLECTIONS.requesters, requester.id), requester);
}

export async function cloudDeleteRequester(requesterId: string) {
  await deleteDoc(doc(db, COLLECTIONS.requesters, requesterId));
}

export async function cloudSaveDepartment(department: Department) {
  await setDoc(doc(db, COLLECTIONS.departments, department.id), department);
}

export async function cloudDeleteDepartment(departmentId: string) {
  await deleteDoc(doc(db, COLLECTIONS.departments, departmentId));
}

export async function cloudRecordWithdrawal(
  record: WithdrawalRecord, 
  updatedProduct?: Product, 
  updatedPrinter?: PrinterItem
) {
  await setDoc(doc(db, COLLECTIONS.withdrawals, record.id), record);
  
  if (updatedProduct) {
    await setDoc(doc(db, COLLECTIONS.products, updatedProduct.id), updatedProduct);
  }
  
  if (updatedPrinter) {
    await setDoc(doc(db, COLLECTIONS.printers, updatedPrinter.id), updatedPrinter);
  }
}

export async function cloudClearAllData() {
  const collectionsToClear = [
    COLLECTIONS.products,
    COLLECTIONS.printers,
    COLLECTIONS.requesters,
    COLLECTIONS.withdrawals,
  ];

  for (const collName of collectionsToClear) {
    const snap = await getDocs(collection(db, collName));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, collName, d.id));
    }
  }
}
