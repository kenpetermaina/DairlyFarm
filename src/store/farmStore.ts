import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Check if data exists in localStorage on app start
const checkLocalStorage = () => {
  try {
    const data = localStorage.getItem('godii-farm-storage');
    if (data) {
      console.log('Found existing data in localStorage:', JSON.parse(data));
    } else {
      console.log('No existing data found in localStorage');
    }
  } catch (error) {
    console.error('Error checking localStorage:', error);
  }
};

// Call this when the module loads
checkLocalStorage();

// Types
export interface Cow {
  id: string;
  tag_number: string;
  name: string;
  breed?: string;
  date_of_birth?: string;
  gender: 'male' | 'female';
  status: 'healthy' | 'sick' | 'sold' | 'dead';
  created_at: string;
  updated_at: string;
}

export interface MilkRecord {
  id: string;
  cow_id: string;
  date: string;
  amount_liters: number;
  session: 'Morning' | 'Lunch' | 'Evening';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  cow_id: string;
  illness: string;
  treatment?: string;
  vet_name?: string;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface FeedRecord {
  id: string;
  cow_id: string;
  feed_type: string;
  quantity: number;
  feeding_time: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BreedingRecord {
  id: string;
  cow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  done: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface IncomeRecord {
  id: string;
  date: string;
  createdAt?: string;
  receiptId?: string;
  litres: number;
  pricePerLitre: number;
  total: number;
  buyer: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  startDate: string;
  status: 'Active' | 'Inactive';
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'farmer' | 'worker';
  recipient_id: string;
  recipient_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface DailyUpdate {
  id: string;
  worker_id: string;
  worker_name: string;
  title: string;
  description: string;
  images?: string[];
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'milk_collection' | 'health_alert' | 'feeding_schedule' | 'breeding' | 'general';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  metadata?: Record<string, any>;
}

interface FarmStore {
  // Data
  cows: Cow[];
  milkRecords: MilkRecord[];
  feedRecords: FeedRecord[];
  healthRecords: HealthRecord[];
  notes: Note[];
  breedingRecords: BreedingRecord[];
  alerts: Alert[];
  expenses: Expense[];
  incomeRecords: IncomeRecord[];
  workers: Worker[];
  messages: Message[];
  dailyUpdates: DailyUpdate[];
  notifications: Notification[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  addCow: (cow: Omit<Cow, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCow: (id: string, updates: Partial<Cow>) => void;
  deleteCow: (id: string) => void;
  addMilkRecord: (record: Omit<MilkRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteMilkRecord: (id: string) => void;
  addFeedRecord: (record: Omit<FeedRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteFeedRecord: (id: string) => void;
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteHealthRecord: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteNote: (id: string) => void;
  addBreedingRecord: (record: Omit<BreedingRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteBreedingRecord: (id: string) => void;
  addAlert: (a: Alert) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  addExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  addIncomeRecord: (r: IncomeRecord) => void;
  deleteIncomeRecord: (id: string) => void;
  addWorker: (w: Worker) => void;
  updateWorker: (w: Worker) => void;
  deleteWorker: (id: string) => void;
  addMessage: (m: Omit<Message, 'id' | 'created_at'>) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  addDailyUpdate: (u: Omit<DailyUpdate, 'id' | 'created_at'>) => void;
  deleteDailyUpdate: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'created_at'>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearError: () => void;

  // Data management
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  clearAllData: () => void;
  checkStorage: () => string | null;
}

export const useFarmStore = create<FarmStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cows: [],
      milkRecords: [],
      feedRecords: [],
      healthRecords: [],
      notes: [],
      breedingRecords: [],
      alerts: [],
      expenses: [],
      incomeRecords: [],
      workers: [],
      messages: [],
      dailyUpdates: [],
      notifications: [],
      loading: false,
      error: null,

      // Cow operations
      addCow: (cowData) => {
        const now = new Date().toISOString();
        const newCow: Cow = {
          ...cowData,
          id: `cow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        console.log('Adding cow:', newCow);
        set((state) => ({ cows: [...state.cows, newCow] }));
      },

      updateCow: (id, updates) => {
        set((state) => ({
          cows: state.cows.map((cow) =>
            cow.id === id
              ? { ...cow, ...updates, updated_at: new Date().toISOString() }
              : cow
          ),
        }));
      },

      deleteCow: (id) => {
        set((state) => ({
          cows: state.cows.filter((cow) => cow.id !== id),
          // Also remove related records
          milkRecords: state.milkRecords.filter((record) => record.cow_id !== id),
          feedRecords: state.feedRecords.filter((record) => record.cow_id !== id),
          healthRecords: state.healthRecords.filter((record) => record.cow_id !== id),
          breedingRecords: state.breedingRecords.filter((record) => record.cow_id !== id),
        }));
      },

      // Milk record operations
      addMilkRecord: (recordData) => {
        const now = new Date().toISOString();
        const newRecord: MilkRecord = {
          ...recordData,
          id: `milk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ milkRecords: [...state.milkRecords, newRecord] }));
      },

      deleteMilkRecord: (id) => {
        set((state) => ({
          milkRecords: state.milkRecords.filter((record) => record.id !== id),
        }));
      },

      // Feed record operations
      addFeedRecord: (recordData) => {
        const now = new Date().toISOString();
        const newRecord: FeedRecord = {
          ...recordData,
          id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ feedRecords: [...state.feedRecords, newRecord] }));
      },

      deleteFeedRecord: (id) => {
        set((state) => ({
          feedRecords: state.feedRecords.filter((record) => record.id !== id),
        }));
      },

      // Health record operations
      addHealthRecord: (recordData) => {
        const now = new Date().toISOString();
        const newRecord: HealthRecord = {
          ...recordData,
          id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ healthRecords: [...state.healthRecords, newRecord] }));
      },

      deleteHealthRecord: (id) => {
        set((state) => ({
          healthRecords: state.healthRecords.filter((record) => record.id !== id),
        }));
      },

      // Note operations
      addNote: (noteData) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          ...noteData,
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      // Breeding record operations
      addBreedingRecord: (recordData) => {
        const now = new Date().toISOString();
        const newRecord: BreedingRecord = {
          ...recordData,
          id: `breeding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ breedingRecords: [...state.breedingRecords, newRecord] }));
      },

      deleteBreedingRecord: (id) => {
        set((state) => ({
          breedingRecords: state.breedingRecords.filter((record) => record.id !== id),
        }));
      },

      // Alert operations
      addAlert: (alert) => {
        set((state) => ({ alerts: [...state.alerts, alert] }));
      },

      toggleAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, done: !alert.done } : alert
          ),
        }));
      },

      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        }));
      },

      // Expense operations
      addExpense: (expense) => {
        set((state) => ({ expenses: [...state.expenses, expense] }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      // Income operations
      addIncomeRecord: (record) => {
        set((state) => ({ incomeRecords: [...state.incomeRecords, record] }));
      },

      deleteIncomeRecord: (id) => {
        set((state) => ({
          incomeRecords: state.incomeRecords.filter((record) => record.id !== id),
        }));
      },

      // Worker operations
      addWorker: (worker) => {
        set((state) => ({ workers: [...state.workers, worker] }));
      },

      updateWorker: (worker) => {
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === worker.id ? worker : w
          ),
        }));
      },

      deleteWorker: (id) => {
        set((state) => ({
          workers: state.workers.filter((worker) => worker.id !== id),
        }));
      },

      // Message operations
      addMessage: (messageData) => {
        const now = new Date().toISOString();
        const newMessage: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },

      markMessageRead: (id) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, read: true } : msg
          ),
        }));
      },

      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },

      // Daily update operations
      addDailyUpdate: (updateData) => {
        const now = new Date().toISOString();
        const newUpdate: DailyUpdate = {
          ...updateData,
          id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
        };
        set((state) => ({ dailyUpdates: [...state.dailyUpdates, newUpdate] }));
      },

      deleteDailyUpdate: (id) => {
        set((state) => ({
          dailyUpdates: state.dailyUpdates.filter((update) => update.id !== id),
        }));
      },

      // Notification operations
      addNotification: (notificationData) => {
        const now = new Date().toISOString();
        const newNotification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: now,
        };
        set((state) => ({ notifications: [...state.notifications, newNotification] }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      // Data management
      exportData: () => {
        const state = get();
        const dataToExport = {
          cows: state.cows,
          milkRecords: state.milkRecords,
          feedRecords: state.feedRecords,
          healthRecords: state.healthRecords,
          notes: state.notes,
          breedingRecords: state.breedingRecords,
          alerts: state.alerts,
          expenses: state.expenses,
          incomeRecords: state.incomeRecords,
          workers: state.workers,
          messages: state.messages,
          dailyUpdates: state.dailyUpdates,
          notifications: state.notifications,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        return JSON.stringify(dataToExport, null, 2);
      },

      // Debug function to check localStorage
      checkStorage: () => {
        try {
          const data = localStorage.getItem('godii-farm-storage');
          console.log('Current localStorage data:', data ? JSON.parse(data) : 'No data');
          console.log('Current store state:', get());
          return data;
        } catch (error) {
          console.error('Error checking storage:', error);
          return null;
        }
      },

      importData: (jsonData) => {
        try {
          const importedData = JSON.parse(jsonData);

          // Validate the data structure
          if (!importedData.cows || !Array.isArray(importedData.cows)) {
            throw new Error('Invalid data format: missing cows array');
          }

          // Import the data
          set({
            cows: importedData.cows || [],
            milkRecords: importedData.milkRecords || [],
            feedRecords: importedData.feedRecords || [],
            healthRecords: importedData.healthRecords || [],
            notes: importedData.notes || [],
            breedingRecords: importedData.breedingRecords || [],
            alerts: importedData.alerts || [],
            expenses: importedData.expenses || [],
            incomeRecords: importedData.incomeRecords || [],
            workers: importedData.workers || [],
            messages: importedData.messages || [],
            dailyUpdates: importedData.dailyUpdates || [],
            notifications: importedData.notifications || [],
          });

          return true;
        } catch (error) {
          console.error('Error importing data:', error);
          set({ error: `Import failed: ${error instanceof Error ? error.message : 'Invalid data format'}` });
          return false;
        }
      },

      clearAllData: () => {
        set({
          cows: [],
          milkRecords: [],
          feedRecords: [],
          healthRecords: [],
          notes: [],
          breedingRecords: [],
          alerts: [],
          expenses: [],
          incomeRecords: [],
          workers: [],
          messages: [],
          dailyUpdates: [],
          notifications: [],
          error: null,
        });
      },
    }),
    {
      name: 'godii-farm-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cows: state.cows,
        milkRecords: state.milkRecords,
        feedRecords: state.feedRecords,
        healthRecords: state.healthRecords,
        notes: state.notes,
        breedingRecords: state.breedingRecords,
        alerts: state.alerts,
        expenses: state.expenses,
        incomeRecords: state.incomeRecords,
        workers: state.workers,
        messages: state.messages,
        dailyUpdates: state.dailyUpdates,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Data rehydrated from localStorage:', state);
      },
    }
  )
);
