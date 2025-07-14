// API Constants for Sharepal App

export const API_BASE_URL = 'https://sharepal.rachitkhurana.tech/v1';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  GOOGLE_SIGNIN: '/auth/google/signin',
  ME: '/user/me',
  UPDATE_PUSH_SUBSCRIPTION: '/user/push-subscription',
  REMOVE_PUSH_SUBSCRIPTION: '/user/push-subscription',

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
  PUSH_ENDPOINT: 'push_endpoint',
  PUSH_KEYS: 'push_keys',
};

export const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    icon: 'restaurant',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E']
  },
  {
    name: 'Transportation',
    icon: 'car',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EDDD6']
  },
  {
    name: 'Shopping',
    icon: 'bag',
    color: '#45B7D1',
    gradient: ['#45B7D1', '#67C3DB']
  },
  {
    name: 'Entertainment',
    icon: 'game-controller',
    color: '#FFA07A',
    gradient: ['#FFA07A', '#FFB399']
  },
  {
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#98D8C8',
    gradient: ['#98D8C8', '#B0E0D3']
  },
  {
    name: 'Home',
    icon: 'home',
    color: '#F7DC6F',
    gradient: ['#F7DC6F', '#F9E79F']
  },
  {
    name: 'Health & Fitness',
    icon: 'fitness',
    color: '#BB8FCE',
    gradient: ['#BB8FCE', '#C8A2C8']
  },
  {
    name: 'Travel',
    icon: 'airplane',
    color: '#85C1E9',
    gradient: ['#85C1E9', '#A3D5F1']
  },
  {
    name: 'Education',
    icon: 'school',
    color: '#FF9F43',
    gradient: ['#FF9F43', '#FFA726']
  },
  {
    name: 'Personal Care',
    icon: 'person',
    color: '#6C5CE7',
    gradient: ['#6C5CE7', '#A29BFE']
  },
  {
    name: 'Gifts & Donations',
    icon: 'gift',
    color: '#FD79A8',
    gradient: ['#FD79A8', '#FDCB6E']
  },
  {
    name: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#74B9FF',
    gradient: ['#74B9FF', '#0984E3']
  },
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
