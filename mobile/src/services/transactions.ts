import { apiRequest } from './api';

export interface Transaction {
  id: string;
  amount: string;
  currency: string;
  merchant: string | null;
  category_id: string | null;
  transaction_type: string;
  payment_method: string | null;
  transaction_date: string;
  notes: string | null;
  status: string;
  is_confirmed: boolean;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateTransactionInput {
  amount: string;
  merchant?: string;
  category_id?: string;
  transaction_type: string;
  payment_method?: string;
  transaction_date: string;
  notes?: string;
}

export async function listTransactions(params?: {
  type?: string;
  page?: number;
  page_size?: number;
}): Promise<TransactionList> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.page) query.set('page', String(params.page));
  if (params?.page_size) query.set('page_size', String(params.page_size));
  const qs = query.toString();
  return apiRequest<TransactionList>(`/api/v1/transactions${qs ? `?${qs}` : ''}`);
}

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>('/api/v1/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/transactions/${id}`, { method: 'DELETE' });
}
