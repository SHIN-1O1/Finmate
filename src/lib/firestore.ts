import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import type { UserProfile, Goal, Transaction, FixedExpense } from './types';

const COLLECTIONS = {
  PROFILES: 'profiles',
  GOALS: 'goals',
  TRANSACTIONS: 'transactions',
  FIXED_EXPENSES: 'fixed-expenses'
} as const;

export class FirestoreService {
  /**
   * Profile Methods
   */
  static async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.PROFILES, userId), profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, userId);
      await setDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Goals Methods
   */
  static async saveGoal(userId: string, goal: Goal): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.GOALS, `${userId}_${goal.id}`), {
        ...goal,
        userId
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  static async getGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.GOALS),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Goal);
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GOALS, `${userId}_${goalId}`));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  /**
   * Transactions Methods
   */
  static async saveTransaction(userId: string, transaction: Transaction): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, `${userId}_${transaction.id}`), {
        ...transaction,
        userId
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Transaction);
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, `${userId}_${transactionId}`));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Fixed Expenses Methods
   */
  static async saveFixedExpense(userId: string, expense: FixedExpense): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.FIXED_EXPENSES, `${userId}_${expense.id}`), {
        ...expense,
        userId
      });
    } catch (error) {
      console.error('Error saving fixed expense:', error);
      throw error;
    }
  }

  static async getFixedExpenses(userId: string): Promise<FixedExpense[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FIXED_EXPENSES),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as FixedExpense);
    } catch (error) {
      console.error('Error getting fixed expenses:', error);
      throw error;
    }
  }

  static async deleteFixedExpense(userId: string, expenseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.FIXED_EXPENSES, `${userId}_${expenseId}`));
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
      throw error;
    }
  }

  /**
   * Delete all user data (used when deleting account)
   */
  static async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete profile
      await deleteDoc(doc(db, COLLECTIONS.PROFILES, userId));

      // Delete all goals
      const goals = await this.getGoals(userId);
      await Promise.all(goals.map(goal => 
        deleteDoc(doc(db, COLLECTIONS.GOALS, `${userId}_${goal.id}`))
      ));

      // Delete all transactions
      const transactions = await this.getTransactions(userId);
      await Promise.all(transactions.map(tx => 
        deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, `${userId}_${tx.id}`))
      ));

      // Delete all fixed expenses
      const expenses = await this.getFixedExpenses(userId);
      await Promise.all(expenses.map(expense => 
        deleteDoc(doc(db, COLLECTIONS.FIXED_EXPENSES, `${userId}_${expense.id}`))
      ));
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}