import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { 
  Group, 
  CreateGroupRequest, 
  User, 
  Transaction,
  EnhancedBalance,
  SimplifyResponse,
  CreateExpenseTransactionRequest,
  CreateSettlementTransactionRequest,
  CompleteTransactionRequest,
  GroupAnalytics
} from '../../types/api';

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: User[];
  groupTransactions: Transaction[];
  userTransactions: Transaction[];
  currentTransaction: Transaction | null;
  groupBalances: EnhancedBalance[];
  groupSimplify: SimplifyResponse[];
  groupAnalytics: GroupAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupTransactions: [],
  userTransactions: [],
  currentTransaction: null,
  groupBalances: [],
  groupSimplify: [],
  groupAnalytics: null,
  isLoading: false,
  error: null,
};

// ===========================================
// ASYNC THUNKS
// ===========================================

export const fetchGroups = createAsyncThunk<Group[]>(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroups() as any;
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response as Group[];
      } else if (response?.groups && Array.isArray(response.groups)) {
        return response.groups as Group[];
      } else if (response?.data?.groups && Array.isArray(response.data.groups)) {
        return response.data.groups as Group[];
      } else {
        console.warn('fetchGroups: Unexpected response structure, returning empty array');
        return [];
      }
    } catch (error: any) {
      console.error('fetchGroups error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroup = createAsyncThunk<Group, string>(
  'groups/fetchGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroup(groupId) as any;
      
      // Handle different response structures
      if (response?.group) {
        return response.group as Group;
      } else if (response?.data?.group) {
        return response.data.group as Group;
      } else if (response?.id || response?._id) {
        return response as Group;
      } else {
        console.error('fetchGroup: Invalid response structure');
        return rejectWithValue('Invalid group data received');
      }
    } catch (error: any) {
      console.error('fetchGroup error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk<Group, CreateGroupRequest>(
  'groups/createGroup',
  async (groupData: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.createGroup(groupData) as any;
      
      // Handle different response structures
      if (response?.group) {
        return response.group as Group;
      } else if (response?.data?.group) {
        return response.data.group as Group;
      } else if (response?.id || response?._id) {
        return response as Group;
      } else {
        console.error('createGroup: Invalid response structure');
        return rejectWithValue('Invalid group data received');
      }
    } catch (error: any) {
      console.error('createGroup error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteGroup(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addGroupMember = createAsyncThunk(
  'groups/addGroupMember',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.addGroupMember(groupId, { user_id: userId });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeGroupMember = createAsyncThunk(
  'groups/removeGroupMember',
  async ({ groupId, memberId }: { groupId: string; memberId: string }, { rejectWithValue }) => {
    try {
      await apiService.removeGroupMember(groupId, memberId);
      return { groupId, memberId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupMembers = createAsyncThunk<User[], string>(
  'groups/fetchGroupMembers',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupMembers(groupId);
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).members) {
        return (response as any).members;
      } else if (response && (response as any).items) {
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ===========================================
// TRANSACTION-BASED ASYNC THUNKS
// ===========================================

export const createExpenseTransaction = createAsyncThunk<Transaction, CreateExpenseTransactionRequest>(
  'groups/createExpenseTransaction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.createExpenseTransaction(data) as any;
      
      if (response?.data?.transaction) {
        return response.data.transaction;
      } else if (response?.transaction) {
        return response.transaction;
      } else if (response?._id) {
        return response;
      } else {
        return rejectWithValue('Invalid response format for expense transaction');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create expense transaction');
    }
  }
);

export const createSettlementTransaction = createAsyncThunk<Transaction, CreateSettlementTransactionRequest>(
  'groups/createSettlementTransaction', 
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.createSettlementTransaction(data) as any;
      
      if (response?.data?.transaction) {
        return response.data.transaction;
      } else if (response?.transaction) {
        return response.transaction;
      } else if (response?._id) {
        return response;
      } else {
        return rejectWithValue('Invalid response format for settlement transaction');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create settlement transaction');
    }
  }
);

export const completeTransaction = createAsyncThunk<Transaction, { id: string; data?: CompleteTransactionRequest }>(
  'groups/completeTransaction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.completeTransaction(id, data) as any;
      
      if (response?.data?.transaction) {
        return response.data.transaction;
      } else if (response?.transaction) {
        return response.transaction;
      } else if (response?._id) {
        return response;
      } else {
        return rejectWithValue('Invalid response format for transaction completion');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete transaction');
    }
  }
);

export const fetchGroupTransactions = createAsyncThunk<Transaction[], { groupId: string; params?: any }>(
  'groups/fetchGroupTransactions',
  async ({ groupId, params }, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupTransactions(groupId, params) as any;
      
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data?.transactions && Array.isArray(response.data.transactions)) {
        return response.data.transactions;
      } else if (response?.transactions && Array.isArray(response.transactions)) {
        return response.transactions;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group transactions');
    }
  }
);

export const fetchGroupBalances = createAsyncThunk<EnhancedBalance[], string>(
  'groups/fetchGroupBalances',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupBalances(groupId) as any;
      
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data?.balances && Array.isArray(response.data.balances)) {
        return response.data.balances;
      } else if (response?.balances && Array.isArray(response.balances)) {
        return response.balances;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group balances');
    }
  }
);

export const fetchGroupSimplify = createAsyncThunk<SimplifyResponse[], string>(
  'groups/fetchGroupSimplify',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupSimplify(groupId) as any;
      
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data?.suggested_settlements && Array.isArray(response.data.suggested_settlements)) {
        return response.data.suggested_settlements;
      } else if (response?.suggested_settlements && Array.isArray(response.suggested_settlements)) {
        return response.suggested_settlements;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settlement suggestions');
    }
  }
);

export const fetchGroupAnalytics = createAsyncThunk<GroupAnalytics, string>(
  'groups/fetchGroupAnalytics',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupAnalytics(groupId) as any;
      
      if (response?.data?.analytics) {
        return response.data.analytics;
      } else if (response?.analytics) {
        return response.analytics;
      } else if (response?.group_id) {
        return response;
      } else {
        return rejectWithValue('Invalid response format for group analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group analytics');
    }
  }
);

export const fetchUserTransactions = createAsyncThunk<Transaction[], { params?: any }>(
  'groups/fetchUserTransactions',
  async ({ params }, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserTransactions(params) as any;
      
      if (response?.data?.transactions) {
        return response.data.transactions;
      } else if (response?.transactions) {
        return response.transactions;
      } else if (Array.isArray(response?.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected user transactions response format:', response);
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user transactions');
    }
  }
);

export const fetchTransaction = createAsyncThunk<Transaction, string>(
  'groups/fetchTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await apiService.getTransaction(transactionId) as any;
      
      if (response?.data?.transaction) {
        return response.data.transaction;
      } else if (response?.transaction) {
        return response.transaction;
      } else if (response?.data) {
        return response.data;
      } else {
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk<string, string>(
  'groups/deleteTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      await apiService.deleteTransaction(transactionId);
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete transaction');
    }
  }
);

// ===========================================
// SLICE DEFINITION
// ===========================================
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    clearGroupData: (state) => {
      state.currentGroup = null;
      state.groupBalances = [];
      state.groupSimplify = [];
      state.groupTransactions = [];
      state.userTransactions = [];
      state.currentTransaction = null;
      state.groupAnalytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.push(action.payload);
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      
      // Delete group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(group => group.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      })
      
      // Fetch group members
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        const groupId = action.meta.arg;
        
        state.groupMembers = action.payload;
        
        // Update currentGroup if it matches
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.members = action.payload;
        }
        
        // Also update the group in the main groups array
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = action.payload;
        }
      })
      
      // Create expense transaction
      .addCase(createExpenseTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpenseTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupTransactions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createExpenseTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create settlement transaction
      .addCase(createSettlementTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSettlementTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupTransactions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSettlementTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Complete transaction
      .addCase(completeTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const transactionIndex = state.groupTransactions.findIndex(t => t._id === action.payload._id);
        if (transactionIndex !== -1) {
          state.groupTransactions[transactionIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(completeTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group transactions
      .addCase(fetchGroupTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupTransactions = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group balances
      .addCase(fetchGroupBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupBalances = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group simplify
      .addCase(fetchGroupSimplify.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupSimplify.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupSimplify = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupSimplify.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group analytics
      .addCase(fetchGroupAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userTransactions = action.payload;
        state.error = null;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transaction
      .addCase(fetchTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
        state.error = null;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.userTransactions = state.userTransactions.filter(transaction => transaction._id !== action.payload);
        state.groupTransactions = state.groupTransactions.filter(transaction => transaction._id !== action.payload);
        if (state.currentTransaction?._id === action.payload) {
          state.currentTransaction = null;
        }
      });
  },
});

export const { clearError, setCurrentGroup, clearGroupData } = groupsSlice.actions;
export default groupsSlice.reducer;
