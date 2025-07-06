import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import { ApiResponse } from '../types/api';
import { secureStorage } from '../utils/secureStorage';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers['Bearer-Token'] = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            // Retry the original request
            const originalRequest = error.config;
            const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (token) {
              originalRequest.headers['Bearer-Token'] = token;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
      token: refreshToken,
    });

    const { token } = response.data.data;
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.access.token);
    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refresh.token);
  }

  private async logout(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api({
        method,
        url,
        data,
        params,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      
      return response.data.data as T;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Auth methods
  async register(data: any) {
    return this.request('POST', API_ENDPOINTS.REGISTER, data);
  }

  async login(data: any) {
    return this.request('POST', API_ENDPOINTS.LOGIN, data);
  }

  async googleSignIn(idToken: string) {
    return this.request('POST', API_ENDPOINTS.GOOGLE_SIGNIN, { id_token: idToken });
  }

  async getCurrentUser() {
    return this.request('GET', API_ENDPOINTS.ME);
  }

  // Friends methods
  async getFriends() {
    return this.request('GET', API_ENDPOINTS.FRIENDS);
  }

  async sendFriendRequest(data: any) {
    return this.request('POST', API_ENDPOINTS.FRIEND_REQUEST, data);
  }

  async respondToFriendRequest(id: string, data: any) {
    return this.request('POST', API_ENDPOINTS.FRIEND_REQUEST_RESPOND(id), data);
  }

  async getReceivedFriendRequests() {
    return this.request('GET', API_ENDPOINTS.FRIEND_REQUESTS_RECEIVED);
  }

  async getSentFriendRequests() {
    return this.request('GET', API_ENDPOINTS.FRIEND_REQUESTS_SENT);
  }

  async removeFriend(friendId: string) {
    return this.request('DELETE', API_ENDPOINTS.REMOVE_FRIEND(friendId));
  }

  async blockUser(userId: string) {
    return this.request('POST', API_ENDPOINTS.BLOCK_USER(userId));
  }

  // Groups methods
  async getGroups(params?: any) {
    return this.request('GET', API_ENDPOINTS.GROUPS, undefined, params);
  }

  async createGroup(data: any) {
    return this.request('POST', API_ENDPOINTS.GROUPS, data);
  }

  async getGroup(id: string) {
    return this.request('GET', API_ENDPOINTS.GROUP(id));
  }

  async deleteGroup(id: string) {
    return this.request('DELETE', API_ENDPOINTS.GROUP(id));
  }

  async getGroupMembers(id: string) {
    return this.request('GET', API_ENDPOINTS.GROUP_MEMBERS(id));
  }

  async addGroupMember(id: string, data: any) {
    return this.request('POST', API_ENDPOINTS.GROUP_MEMBERS(id), data);
  }

  async removeGroupMember(id: string, memberId: string) {
    return this.request('DELETE', API_ENDPOINTS.GROUP_MEMBER(id, memberId));
  }

  async getGroupExpenses(id: string, params?: any) {
    // Use transactions endpoint with type filter for expenses
    const transactionParams = { ...params, type: 'expense' };
    const result = await this.request('GET', API_ENDPOINTS.GROUP_TRANSACTIONS(id), undefined, transactionParams);
    return result;
  }

  async getGroupBalances(groupId: string) {
    const result = await this.request('GET', API_ENDPOINTS.GROUP_BALANCES(groupId));
    return result;
  }

  async getGroupSimplify(groupId: string) {
    const result = await this.request('GET', API_ENDPOINTS.GROUP_SIMPLIFY(groupId));
    return result;
  }

  // Utility methods
  async ping() {
    return this.request('GET', API_ENDPOINTS.PING);
  }
  
  // Transaction Management
  async createExpenseTransaction(data: any) {
    // Expenses should be marked as completed since they represent money already spent
    const expenseData = {
      ...data,
      is_completed: true
    };
    const result = await this.request('POST', API_ENDPOINTS.TRANSACTION_EXPENSE, expenseData);
    return result;
  }

  async createSettlementTransaction(data: any) {
    // If this settlement is being created as a payment (has settlement_method), mark it as completed
    const settlementData = {
      ...data,
      // If it's a payment being made, mark as completed
      is_completed: data.settlement_method ? true : false
    };
    const result = await this.request('POST', API_ENDPOINTS.TRANSACTION_SETTLEMENT, settlementData);
    return result;
  }

  async getTransaction(transactionId: string) {
    return this.request('GET', API_ENDPOINTS.TRANSACTION(transactionId));
  }

  async updateTransaction(transactionId: string, data: any) {
    return this.request('PUT', API_ENDPOINTS.TRANSACTION(transactionId), data);
  }

  async deleteTransaction(transactionId: string) {
    return this.request('DELETE', API_ENDPOINTS.TRANSACTION(transactionId));
  }

  async completeTransaction(transactionId: string, data?: any) {
    const endpoint = API_ENDPOINTS.COMPLETE_TRANSACTION(transactionId);
    const result = await this.request('POST', endpoint, data);
    return result;
  }

  // Enhanced Group Methods
  async getGroupTransactions(groupId: string, params?: any) {
    const result = await this.request('GET', API_ENDPOINTS.GROUP_TRANSACTIONS(groupId), undefined, params);
    return result;
  }

  async getGroupExpenseTransactions(groupId: string, params?: any) {
    return this.request('GET', `/groups/${groupId}/transactions/expenses`, undefined, params);
  }

  async getGroupSettlementTransactions(groupId: string, params?: any) {
    return this.request('GET', `/groups/${groupId}/transactions/settlements`, undefined, params);
  }

  async getGroupBalanceHistory(groupId: string, params?: any) {
    return this.request('GET', `/groups/${groupId}/balance-history`, undefined, params);
  }

  async getGroupAnalytics(groupId: string) {
    return this.request('GET', API_ENDPOINTS.GROUP_ANALYTICS(groupId));
  }

  async recalculateGroupBalances(groupId: string) {
    return this.request('POST', `/groups/${groupId}/recalculate-balances`);
  }

  // Bulk Operations
  async createBulkSettlements(groupId: string, data: any) {
    return this.request('POST', `/groups/${groupId}/bulk-settlements`, data);
  }

  // User-specific Methods
  async getUserTransactions(params?: any) {
    return this.request('GET', API_ENDPOINTS.USER_TRANSACTIONS, undefined, params);
  }

  async getUserBalances() {
    return this.request('GET', API_ENDPOINTS.USER_BALANCES);
  }

  async getUserAnalytics() {
    return this.request('GET', API_ENDPOINTS.USER_ANALYTICS);
  }

  async updateFCMToken(fcmToken: string) {
    const temp = this.request('PUT', API_ENDPOINTS.UPDATE_FCM_TOKEN, { fcm_token: fcmToken });
    return temp;
  }

  async updateProfile(data: { name: string; email: string }) {
    return this.request('PUT', API_ENDPOINTS.UPDATE_PROFILE, data);
  }

  async getPresignedUploadUrl(data: { file_name: string }) {
    return this.request('POST', API_ENDPOINTS.PRESIGNED_UPLOAD_URL, data);
  }

  async confirmUpload(data: { s3_key: string }) {
    return this.request('POST', API_ENDPOINTS.CONFIRM_UPLOAD, data);
  }

  async deleteProfilePicture() {
    return this.request('DELETE', API_ENDPOINTS.DELETE_PROFILE_PICTURE);
  }
}

export const apiService = new ApiService();
