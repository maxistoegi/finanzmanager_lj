export interface CashRegister {
  id: string;
  name: string;
  endAmount: number;
}

export interface StartEntry {
  id: string;
  amount: number;
  source: string; // e.g. "Bank", "Getränkekasse"
  registerId: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  notes: string;
  registers: CashRegister[];
  startEntries: StartEntry[];
  expenses: Expense[];
  aiSummary?: string;
}

export interface EventSummary {
  totalStart: number;
  totalEnd: number;
  cashRevenue: number;
  totalExpenses: number;
  netProfit: number;
}
