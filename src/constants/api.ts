// API Constants for Sharepal App

export const API_BASE_URL = 'https://sharepal.rachitkhurana.tech/v1';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  GOOGLE_SIGNIN: '/auth/google/signin',
  ME: '/user/me',
  UPDATE_FCM_TOKEN: '/user/fcm-token',

  // Friends
  FRIENDS: '/friends',
  FRIEND_REQUEST: '/friends/request',
  FRIEND_REQUEST_RESPOND: (id: string) => `/friends/request/${id}/respond`,
  FRIEND_REQUESTS_RECEIVED: '/friends/requests/received',
  FRIEND_REQUESTS_SENT: '/friends/requests/sent',
  REMOVE_FRIEND: (friendId: string) => `/friends/${friendId}`,
  BLOCK_USER: (userId: string) => `/friends/block/${userId}`,

  // Groups
  GROUPS: '/groups',
  GROUP: (id: string) => `/groups/${id}`,
  GROUP_MEMBERS: (id: string) => `/groups/${id}/members`,
  GROUP_MEMBER: (id: string, memberId: string) => `/groups/${id}/members/${memberId}`,
  GROUP_TRANSACTIONS: (id: string) => `/groups/${id}/transactions`,
  GROUP_BALANCES: (id: string) => `/groups/${id}/balances`,
  GROUP_SIMPLIFY: (id: string) => `/groups/${id}/simplify`,
  GROUP_ANALYTICS: (id: string) => `/groups/${id}/analytics`,

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION: (id: string) => `/transactions/${id}`,
  TRANSACTION_EXPENSE: '/transactions/expense',
  TRANSACTION_SETTLEMENT: '/transactions/settlement',
  COMPLETE_TRANSACTION: (id: string) => `/transactions/${id}/complete`,

  // User
  USER_TRANSACTIONS: '/users/me/transactions',
  USER_BALANCES: '/users/me/balances',
  USER_ANALYTICS: '/users/me/analytics',
  UPDATE_PROFILE: '/user/profile',

  // Media
  PRESIGNED_UPLOAD_URL: '/media/presigned-upload-url',
  CONFIRM_UPLOAD: '/media/confirm-upload',
  DELETE_PROFILE_PICTURE: '/media/profile-picture',

  // Utility
  PING: '/ping',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  FCM_TOKEN: 'fcm_token',
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Home',
  'Health & Fitness',
  'Travel',
  'Education',
  'Personal Care',
  'Gifts & Donations',
  'Other',
];

export const SPLIT_TYPES = {
  EQUAL: 'equal',
  EXACT: 'exact',
  PERCENTAGE: 'percentage',
} as const;

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'SEK',
] as const;
