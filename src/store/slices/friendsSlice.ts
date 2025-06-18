import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { User, FriendRequest, SendFriendRequestRequest, RespondFriendRequestRequest } from '../../types/api';

interface FriendsState {
  friends: User[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFriends = createAsyncThunk<User[], void>(
  'friends/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchFriends: Starting to fetch friends list...');
      const response = await apiService.getFriends();
      console.log('fetchFriends: API response:', response);
      console.log('fetchFriends: Response type:', typeof response);
      console.log('fetchFriends: Is array?', Array.isArray(response));
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('fetchFriends: Direct array response, length:', response.length);
        return response;
      } else if (response && (response as any).friends) {
        console.log('fetchFriends: Response has friends property, length:', (response as any).friends.length);
        return (response as any).friends;
      } else if (response && (response as any).data) {
        console.log('fetchFriends: Response has data property, length:', (response as any).data.length);
        return (response as any).data;
      } else {
        console.log('fetchFriends: No recognizable structure, returning empty array');
        console.log('fetchFriends: Full response:', JSON.stringify(response, null, 2));
        return [];
      }
    } catch (error: any) {
      console.log('fetchFriends: Error:', error);
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
      console.log('fetchReceivedRequests: Starting to fetch received requests...');
      const response = await apiService.getReceivedFriendRequests();
      console.log('fetchReceivedRequests: API response:', response);
      console.log('fetchReceivedRequests: Response type:', typeof response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('fetchReceivedRequests: Direct array response, length:', response.length);
        return response;
      } else if (response && (response as any).requests) {
        console.log('fetchReceivedRequests: Response has requests property, length:', (response as any).requests.length);
        return (response as any).requests;
      } else if (response && (response as any).data) {
        console.log('fetchReceivedRequests: Response has data property, length:', (response as any).data.length);
        return (response as any).data;
      } else {
        console.log('fetchReceivedRequests: No recognizable structure, returning empty array');
        console.log('fetchReceivedRequests: Full response:', JSON.stringify(response, null, 2));
        return [];
      }
    } catch (error: any) {
      console.log('fetchReceivedRequests: Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSentRequests = createAsyncThunk<FriendRequest[], void>(
  'friends/fetchSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchSentRequests: Starting to fetch sent requests...');
      const response = await apiService.getSentFriendRequests();
      console.log('fetchSentRequests: API response:', response);
      console.log('fetchSentRequests: Response type:', typeof response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('fetchSentRequests: Direct array response, length:', response.length);
        return response;
      } else if (response && (response as any).requests) {
        console.log('fetchSentRequests: Response has requests property, length:', (response as any).requests.length);
        return (response as any).requests;
      } else if (response && (response as any).data) {
        console.log('fetchSentRequests: Response has data property, length:', (response as any).data.length);
        return (response as any).data;
      } else {
        console.log('fetchSentRequests: No recognizable structure, returning empty array');
        console.log('fetchSentRequests: Full response:', JSON.stringify(response, null, 2));
        return [];
      }
    } catch (error: any) {
      console.log('fetchSentRequests: Error:', error);
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
        state.friends = action.payload;
        state.error = null;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isLoading = false;
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
