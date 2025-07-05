// API Types for Sharepal App

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  mail_verified: boolean;
  fcm_token: string;
  profile_pic_url?: string;
  user?: User; // For nested user objects
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: {
    access: {
      expires: string;
      token: string;
    };
    refresh: {
      expires: string;
      token: string;
    };
  };
  user: User;
}

export interface RefreshRequest {
  token: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  creator_id: string;
  created_by?: string; // Alternative field name for creator
  members: User[] | string[]; // Allow both full user objects and user ID strings
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  currency: string;
  member_ids?: string[];
}

export interface Balance {
  user_id: string;
  user_name: string;
  amount: number;
  currency?: string;
}

export interface Settlement {
  id: string;
  group_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  settled_at?: string;
}

export interface SimplifyResponse {
  payer_id: string;
  payee_id: string;
  payer_name?: string;
  payee_name?: string;
  amount: number;
  currency: string;
  group_id?: string;
  status?: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_email?: string;
  addressee_name?: string;
  addressee_email?: string;
  requested_at?: string;
}

export interface SendFriendRequestRequest {
  email: string;
}

export interface RespondFriendRequestRequest {
  accept: boolean;
}

export interface AddMemberToGroupRequest {
  user_id: string;
}

export interface SettleDebtRequest {
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TransactionParticipant {
  user_id: string;
  user_name: string;
  amount: number; // Positive for payer/creditor, negative for split/debtor
  share_type: 'paid' | 'split' | 'both';
}

export interface Transaction {
  _id: string;
  group_id: string;
  type: 'expense' | 'settlement' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  currency: string;
  date: string;
  participants: TransactionParticipant[];
  category?: string;
  split_type?: 'equal' | 'exact' | 'percentage';
  notes?: string;
  is_completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Settlement specific fields
  payer_id?: string;
  payee_id?: string;
  settlement_method?: string;
  proof_of_payment?: string;
}

export interface CreateExpenseTransactionRequest {
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  split_type: 'equal' | 'exact' | 'percentage';
  payers: Array<{
    user_id: string;
    amount: number;
  }>;
  splits: Array<{
    user_id: string;
    amount: number;
  }>;
  category?: string;
  notes?: string;
  is_completed?: boolean;
}

export interface CreateSettlementTransactionRequest {
  group_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  notes?: string;
  settlement_method?: string;
}

export interface CompleteTransactionRequest {
  notes?: string;
  settlement_method?: string;
  proof_of_payment?: string;
}

export interface UpdateTransactionRequest {
  description?: string;
  category?: string;
  notes?: string;
}

// Enhanced Balance with additional tracking
export interface EnhancedBalance {
  _id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  balance: number; // Net amount (positive = owed money, negative = owes money)
  total_paid: number; // Total amount the user has paid out
  total_owed: number; // Total amount the user owes
  currency: string;
  last_updated: string;
  version: number;
}

// Group Analytics
export interface GroupAnalytics {
  group_id: string;
  group_name: string;
  total_transactions: number;
  total_expenses: number;
  total_settlements: number;
  total_expense_amount: number;
  total_settlement_amount: number;
  total_amount: number;
  currency: string;
  member_count: number;
  balances_summary: {
    positive: number; // Members who are owed money
    negative: number; // Members who owe money
    zero: number; // Members who are settled
  };
}

// User Analytics
export interface UserAnalytics {
  user_id: string;
  total_groups: number;
  total_transactions: number;
  total_expenses: number;
  total_settlements: number;
  net_balance: number;
  groups_summary: {
    owe_money: number;
    owed_money: number;
    balanced: number;
  };
}

// Bulk Settlement Request
export interface BulkSettlementRequest {
  settlements: CreateSettlementTransactionRequest[];
}

// Transaction Query Parameters
export interface TransactionQueryParams {
  type?: 'expense' | 'settlement' | 'refund' | 'adjustment';
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

// Balance History
export interface BalanceHistoryEntry {
  date: string;
  balance: number;
  change: number;
  transaction_id: string;
  transaction_description: string;
}

export interface BalanceHistory {
  user_id: string;
  group_id: string;
  currency: string;
  history: BalanceHistoryEntry[];
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface PresignedUploadRequest {
  file_name: string;
}

export interface PresignedUploadResponse {
  upload_url: string;
  s3_key: string;
  expires_at: number;
}

export interface ConfirmUploadRequest {
  s3_key: string;
}

export interface ConfirmUploadResponse {
  profile_pic_url: string;
}