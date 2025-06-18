import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../../types/api';

interface ExpensesState {
  expenses: Expense[];
  groupExpenses: Expense[];
  currentExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  groupExpenses: [],
  currentExpense: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk<Expense[], any>(
  'expenses/fetchExpenses',
  async (params?: any, { rejectWithValue }) => {
    try {
      console.log('fetchExpenses: Starting to fetch user expenses with params:', params);
      const response = await apiService.getExpenses(params);
      console.log('fetchExpenses: API response:', response);
      console.log('fetchExpenses: Response type:', typeof response);
      console.log('fetchExpenses: Is array?', Array.isArray(response));
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('fetchExpenses: Direct array response, length:', response.length);
        return response;
      } else if (response && (response as any).expenses) {
        console.log('fetchExpenses: Response has expenses property, length:', (response as any).expenses.length);
        return (response as any).expenses;
      } else if (response && (response as any).items) {
        console.log('fetchExpenses: Response has items property, length:', (response as any).items.length);
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        console.log('fetchExpenses: Response has data array, length:', (response as any).data.length);
        return (response as any).data;
      } else {
        console.log('fetchExpenses: No recognizable structure, returning empty array');
        console.log('fetchExpenses: Full response:', JSON.stringify(response, null, 2));
        return [];
      }
    } catch (error: any) {
      console.log('fetchExpenses: Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupExpenses = createAsyncThunk<Expense[], { groupId: string; params?: any }>(
  'expenses/fetchGroupExpenses',
  async ({ groupId, params }: { groupId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupExpenses(groupId, params);
      console.log('API response for group expenses:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('Response is direct array, length:', response.length);
        return response;
      } else if (response && (response as any).expenses) {
        console.log('Response has expenses property, length:', (response as any).expenses.length);
        return (response as any).expenses;
      } else if (response && (response as any).items) {
        console.log('Response has items property, length:', (response as any).items.length);
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        console.log('Response has data array property, length:', (response as any).data.length);
        return (response as any).data;
      } else {
        console.log('No recognizable expense structure found, returning empty array');
        console.log('Full response:', JSON.stringify(response, null, 2));
        return [];
      }
    } catch (error: any) {
      console.log('Error fetching group expenses:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createExpense = createAsyncThunk<Expense, CreateExpenseRequest>(
  'expenses/createExpense',
  async (expenseData: CreateExpenseRequest, { rejectWithValue }) => {
    try {
      console.log('Creating expense with data:', expenseData);
      const response = await apiService.createExpense(expenseData);
      console.log('Create expense response:', response);
      return response as Expense;
    } catch (error: any) {
      console.log('Create expense error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExpense = createAsyncThunk<Expense, string>(
  'expenses/fetchExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      console.log('fetchExpense: Fetching expense with ID:', expenseId);
      const response = await apiService.getExpense(expenseId);
      console.log('fetchExpense: API response:', response);
      console.log('fetchExpense: Response type:', typeof response);
      
      // Handle different response structures
      if (response && (response as any).expense) {
        console.log('fetchExpense: Response has expense property');
        return (response as any).expense;
      } else if (response && typeof response === 'object') {
        console.log('fetchExpense: Direct expense object');
        return response as Expense;
      } else {
        console.log('fetchExpense: Unexpected response structure');
        throw new Error('Invalid expense data structure');
      }
    } catch (error: any) {
      console.log('fetchExpense: Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateExpense = createAsyncThunk<Expense, { expenseId: string; expenseData: UpdateExpenseRequest }>(
  'expenses/updateExpense',
  async ({ expenseId, expenseData }: { expenseId: string; expenseData: UpdateExpenseRequest }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateExpense(expenseId, expenseData);
      return response as Expense;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteExpense(expenseId);
      return expenseId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentExpense: (state, action: PayloadAction<Expense | null>) => {
      state.currentExpense = action.payload;
    },
    clearExpenseData: (state) => {
      state.currentExpense = null;
      state.groupExpenses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch group expenses
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupExpenses = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload);
        state.groupExpenses.unshift(action.payload);
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch expense
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.currentExpense = action.payload;
      })
      
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        const groupIndex = state.groupExpenses.findIndex(expense => expense.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groupExpenses[groupIndex] = action.payload;
        }
        state.currentExpense = action.payload;
      })
      
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
        state.groupExpenses = state.groupExpenses.filter(expense => expense.id !== action.payload);
        if (state.currentExpense?.id === action.payload) {
          state.currentExpense = null;
        }
      });
  },
});

export const { clearError, setCurrentExpense, clearExpenseData } = expensesSlice.actions;
export default expensesSlice.reducer;
