import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Group, CreateGroupRequest, Balance, Settlement, SimplifyResponse, User } from '../../types/api';

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: User[];
  groupBalances: Balance[];
  groupSettlements: Settlement[];
  simplifyData: SimplifyResponse[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupBalances: [],
  groupSettlements: [],
  simplifyData: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchGroups = createAsyncThunk<Group[], any>(
  'groups/fetchGroups',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroups(params);
      console.log('API response for groups:', response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).groups) {
        // The actual structure from your API
        return (response as any).groups;
      } else if (response && (response as any).items) {
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.log('Error fetching groups:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk<Group, CreateGroupRequest>(
  'groups/createGroup',
  async (groupData: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.createGroup(groupData);
      return response as Group;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroup = createAsyncThunk<Group, string>(
  'groups/fetchGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroup(groupId);
      console.log('API response for single group:', response);
      return response as Group;
    } catch (error: any) {
      console.log('Error fetching group:', error);
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

export const fetchGroupBalances = createAsyncThunk<Balance[], string>(
  'groups/fetchGroupBalances',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupBalances(groupId);
      console.log('API response for group balances:', response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).balances && (response as any).balances.balances) {
        // Handle nested structure: response.balances.balances
        return (response as any).balances.balances;
      } else if (response && (response as any).balances) {
        return (response as any).balances;
      } else if (response && (response as any).items) {
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.log('Error fetching group balances:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupSettlements = createAsyncThunk<Settlement[], string>(
  'groups/fetchGroupSettlements',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupSettlements(groupId);
      return response as Settlement[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupSimplify = createAsyncThunk<SimplifyResponse[], string>(
  'groups/fetchGroupSimplify',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupSimplify(groupId);
      console.log('API response for group simplify:', response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).suggested_settlements) {
        // Handle API structure: response.suggested_settlements
        return (response as any).suggested_settlements;
      } else if (response && (response as any).settlements) {
        return (response as any).settlements;
      } else if (response && (response as any).simplify) {
        return (response as any).simplify;
      } else if (response && (response as any).items) {
        return (response as any).items;
      } else if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.log('Error fetching group simplify:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupMembers = createAsyncThunk<User[], string>(
  'groups/fetchGroupMembers',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupMembers(groupId);
      console.log('API response for group members:', response);
      
      // Handle different response structures
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
      console.log('Error fetching group members:', error);
      return rejectWithValue(error.message);
    }
  }
);

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
      state.groupSettlements = [];
      state.simplifyData = [];
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
      
      // Fetch group balances
      .addCase(fetchGroupBalances.fulfilled, (state, action) => {
        state.groupBalances = action.payload;
      })
      
      // Fetch group settlements
      .addCase(fetchGroupSettlements.fulfilled, (state, action) => {
        state.groupSettlements = action.payload;
      })
      
      // Fetch group simplify
      .addCase(fetchGroupSimplify.fulfilled, (state, action) => {
        state.simplifyData = action.payload;
      })
      
      // Fetch group members
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        const groupId = action.meta.arg;
        console.log('fetchGroupMembers fulfilled for group:', groupId, 'members:', action.payload);
        
        // Update currentGroup if it matches
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.members = action.payload;
        }
        
        // Also update the group in the main groups array
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentGroup, clearGroupData } = groupsSlice.actions;
export default groupsSlice.reducer;
