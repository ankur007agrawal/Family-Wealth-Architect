
export enum IncomeMode {
  INDIVIDUAL = 'Individual',
  JOINT = 'Joint'
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
}

export interface ProfileData {
  name: string;
  age: number;
  occupation: string;
  incomeMode: IncomeMode;
  familyMembers: FamilyMember[];
}

export interface CashflowItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  monthlyValues: number[]; // 12 months
  isMaster?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  appreciationPercent: number;
}

export interface Liability {
  id: string;
  name: string;
  outstandingPrincipal: number;
  emi: number;
  principalComponentPercent: number;
}

export interface AppState {
  profile: ProfileData;
  cashflow: CashflowItem[];
  assets: Asset[];
  liabilities: Liability[];
  initialOpeningBalance: number;
  categories: {
    income: string[];
    expense: string[];
  };
}

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
