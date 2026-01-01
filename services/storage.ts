
import { AppState, IncomeMode } from '../types';

const STORAGE_KEY = 'family_wealth_architect_data';

export const getInitialState = (): AppState => ({
  profile: {
    name: '',
    age: 0,
    occupation: '',
    incomeMode: IncomeMode.INDIVIDUAL,
    familyMembers: []
  },
  initialOpeningBalance: 0,
  cashflow: [
    { id: '1', name: 'Salary', type: 'income', monthlyValues: Array(12).fill(0), isMaster: true },
    { id: '2', name: 'Bonus', type: 'income', monthlyValues: Array(12).fill(0), isMaster: true },
  ],
  assets: [],
  liabilities: [],
  categories: {
    income: ['Salary', 'Bonus', 'Rental Income', 'Dividends', 'Spouse Salary', 'Spouse Bonus', 'Business Income'],
    expense: ['Rent', 'EMI', 'Groceries', 'Utilities', 'Education', 'Health', 'Travel', 'Leisure', 'Insurance']
  }
});

export const storage = {
  save: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getInitialState();
    try {
      const parsed = JSON.parse(data);
      // Migration for old data without initialOpeningBalance
      if (parsed.initialOpeningBalance === undefined) parsed.initialOpeningBalance = 0;
      
      // Migration to ensure 'Spouse Bonus' exists if missing in legacy categories
      if (parsed.categories && parsed.categories.income && !parsed.categories.income.includes('Spouse Bonus')) {
        parsed.categories.income.push('Spouse Bonus');
      }
      
      return parsed;
    } catch (e) {
      return getInitialState();
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
