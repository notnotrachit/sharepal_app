import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { signUpWithGoogle } from '../../utils/credentialsManager';
import { apiService } from '../../services/api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../types/api';
import { STORAGE_KEYS } from '../../constants/api';
import { secureStorage } from '../../utils/secureStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent flash
  isInitialized: false, // Track if we've completed initial auth check
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials) as AuthResponse;
      
      // Store tokens securely
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token.access.token);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.token.refresh.token);
      await secureStorage.setItem(STORAGE_KEYS.USER, response.user);

      // Push notifications will be handled by the usePushNotifications hook
      // after authentication state changes
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData) as AuthResponse;
      
      // Store tokens securely
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token.access.token);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.token.refresh.token);
      await secureStorage.setItem(STORAGE_KEYS.USER, response.user);

      // Push notifications will be handled by the usePushNotifications hook
      // after authentication state changes
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (_, { rejectWithValue }) => {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('Google Sign-In is only available on Android');
      }
      const credential = await signUpWithGoogle({
        serverClientId: '592192215077-65mr9ldp221eo6qa454u47l8vhseikdk.apps.googleusercontent.com', // Replace with your actual client ID
        autoSelectEnabled: true,
      });

      const response = await apiService.googleSignIn(credential.idToken) as AuthResponse;

      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token.access.token);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.token.refresh.token);
      await secureStorage.setItem(STORAGE_KEYS.USER, response.user);

      // Push notifications will be handled by the usePushNotifications hook
      // after authentication state changes
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiService.getCurrentUser() as User;
      await secureStorage.setItem(STORAGE_KEYS.USER, user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const user = await secureStorage.getJSON<User>(STORAGE_KEYS.USER);
      
      if (token && user) {
        return user;
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await secureStorage.removeItem(STORAGE_KEYS.USER);
      
      // Import and dispatch the groups reset action
      const { resetAllState } = await import('./groupsSlice');
      dispatch(resetAllState());
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Google Sign-In
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (state.isAuthenticated) {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.isInitialized = false;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout API fails, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
