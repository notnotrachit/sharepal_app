// API Constants for Sharepal App

export const API_BASE_URL = 'https://sharepal.rachitkhurana.tech/v1';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  ME: '/user/me',

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
  GROUP_EXPENSES: (id: string) => `/groups/${id}/expenses`,
  GROUP_BALANCES: (id: string) => `/groups/${id}/balances`,
  GROUP_SIMPLIFY: (id: string) => `/groups/${id}/simplify`,
  GROUP_SETTLEMENTS: (id: string) => `/groups/${id}/settlements`,

  // Expenses
  EXPENSES: '/expenses',
  EXPENSE: (id: string) => `/expenses/${id}`,

  // Settlements
  SETTLEMENTS: '/settlements',
  SETTLEMENT: (id: string) => `/settlements/${id}`,
  SETTLEMENT_COMPLETE: (id: string) => `/settlements/${id}/complete`,
  CREATE_SETTLEMENT: '/settlements',

  // Utility
  PING: '/ping',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
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
