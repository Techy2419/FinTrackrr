import { Timestamp } from 'firebase/firestore';

// Profile Types
export interface Profile {
  id?: string;
  name: string;
  type: 'personal' | 'business' | 'family';
  currency: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CreateProfileInput = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'userId'>>;

// Expense Types
export type PaymentMethod = 'cash' | 'debit' | 'credit';

export interface Expense {
  id?: string;
  profileId: string;
  amount: number;
  description: string;
  category: string;
  date: Timestamp;
  paymentMethod: PaymentMethod;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ExpenseFormData {
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod: PaymentMethod;
}

export type CreateExpenseInput = Omit<ExpenseFormData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<Omit<ExpenseFormData, 'id' | 'profileId'>>;

// Context Types
export interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setActiveProfile: (profile: Profile | null) => void;
  addProfile: (profileData: CreateProfileInput) => Promise<Profile>;
  updateProfile: (profileId: string, updates: UpdateProfileInput) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

export interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  refreshExpenses: () => Promise<void>;
  addExpense: (expense: CreateExpenseInput) => Promise<void>;
  editExpense: (expenseId: string, updates: UpdateExpenseInput) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
}

// Stats Types
export interface PaymentMethodStats {
  method: PaymentMethod;
  total: number;
  count: number;
}

// User Types
export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  uid?: string;
  displayName?: string;
  photoURL?: string;
  hasEnteredName?: boolean;
  hasCreatedProfile?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  hasCompletedProfileWizard?: boolean;
}

export type CreateUserInput = Omit<UserInfo, 'userId' | 'uid' | 'hasEnteredName' | 'hasCreatedProfile'>;
export type UpdateUserInput = Partial<Omit<UserInfo, 'userId' | 'uid'>>;
