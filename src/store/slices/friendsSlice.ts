import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { User, FriendRequest, SendFriendRequestRequest, RespondFriendRequestRequest } from '../../types/api';

interface FriendsState {
  friends: User[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  isLoading: true, // Start with loading to prevent flash
  isInitialized: false, // Track if we've completed initial data fetch
  error: null,
};

// Async thunks
export const fetchFriends = createAsyncThunk<User[], void>(
  'friends/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFriends();
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).friends) {
        return (response as any).friends;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk<FriendRequest, SendFriendRequestRequest>(
  'friends/sendFriendRequest',
  async (requestData: SendFriendRequestRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.sendFriendRequest(requestData);
      return response as FriendRequest;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToFriendRequest = createAsyncThunk(
  'friends/respondToFriendRequest',
  async ({ requestId, response }: { requestId: string; response: RespondFriendRequestRequest }, { rejectWithValue }) => {
    try {
      const result = await apiService.respondToFriendRequest(requestId, response);
      return { requestId, response: result };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReceivedRequests = createAsyncThunk<FriendRequest[], void>(
  'friends/fetchReceivedRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getReceivedFriendRequests();
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).requests) {
        return (response as any).requests;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSentRequests = createAsyncThunk<FriendRequest[], void>(
  'friends/fetchSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSentFriendRequests();
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).requests) {
        return (response as any).requests;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async (friendId: string, { rejectWithValue }) => {
    try {
      await apiService.removeFriend(friendId);
      return friendId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const blockUser = createAsyncThunk(
  'friends/blockUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await apiService.blockUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.friends = action.payload;
        state.error = null;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      })
      
      // Send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentRequests.push(action.payload);
        state.error = null;
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Respond to friend request
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        state.receivedRequests = state.receivedRequests.filter(req => req.id !== requestId);
      })
      
      // Fetch received requests
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.receivedRequests = action.payload;
      })
      
      // Fetch sent requests
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
      })
      
      // Remove friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(friend => friend.id !== action.payload);
      })
      
      // Block user
      .addCase(blockUser.fulfilled, (state, action) => {
        state.friends = state.friends.filter(friend => friend.id !== action.payload);
      });
  },
});

export const { clearError } = friendsSlice.actions;
export default friendsSlice.reducer;
