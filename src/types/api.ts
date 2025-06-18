// API Types for Sharepal App

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
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
  members: User[];
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

export interface ExpenseSplit {
  user_id: string;
  amount: number;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  split_type: 'equal' | 'exact' | 'percentage';
  splits: ExpenseSplit[];
  payer_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_settled: boolean;
}

export interface CreateExpenseRequest {
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  split_type: 'equal' | 'exact' | 'percentage';
  splits: ExpenseSplit[];
  notes?: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  category?: string;
  split_type?: 'equal' | 'exact' | 'percentage';
  splits?: ExpenseSplit[];
  notes?: string;
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
  amount: number;
  currency: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
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
