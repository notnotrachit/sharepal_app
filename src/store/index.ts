import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import groupsSlice from './slices/groupsSlice';
import friendsSlice from './slices/friendsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    groups: groupsSlice,
    friends: friendsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
