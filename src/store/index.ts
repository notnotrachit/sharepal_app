import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import groupsSlice from './slices/groupsSlice';
import expensesSlice from './slices/expensesSlice';
import friendsSlice from './slices/friendsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    groups: groupsSlice,
    expenses: expensesSlice,
    friends: friendsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
