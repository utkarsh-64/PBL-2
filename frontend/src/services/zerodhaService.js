import { API_BASE_URL } from '../utils/constants';

class ZerodhaService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/financial/kite`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getLoginUrl(returnUrl = null) {
    try {
      // Store the return URL in sessionStorage for callback redirect
      if (returnUrl) {
        sessionStorage.setItem('zerodha_return_url', returnUrl);
      }

      const response = await fetch(`${this.baseUrl}/login-url/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get login URL');
      }

      const data = await response.json();
      return data.login_url;
    } catch (error) {
      console.error('getLoginUrl error:', error);
      throw new Error(error.message || 'Failed to get login URL');
    }
  }

  async handleCallback(requestToken) {
    try {
      console.log('handleCallback called with token:', requestToken?.substring(0, 10) + '...');
      
      const response = await fetch(`${this.baseUrl}/callback/?request_token=${requestToken}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      console.log('Callback response:', { status: response.status, message: data.message });

      if (!response.ok) {
        // Handle specific error codes from backend
        if (data.code === 'TOKEN_EXPIRED') {
          throw new Error('TOKEN_EXPIRED');
        }
        if (data.code === 'TOKEN_ALREADY_PROCESSED') {
          throw new Error('TOKEN_ALREADY_PROCESSED');
        }
        throw new Error(data.error || 'Failed to connect Zerodha account');
      }

      // Success case - return the result
      return data;
    } catch (error) {
      console.error('handleCallback error:', error);
      throw error;
    }
  }

  getReturnUrl() {
    const returnUrl = sessionStorage.getItem('zerodha_return_url');
    sessionStorage.removeItem('zerodha_return_url'); // Clean up after use
    return returnUrl;
  }

  async getProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/profile/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Account not linked
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('getProfile error:', error);
      throw error;
    }
  }

  async checkConnectionStatus(retries = 3, delay = 500) {
    try {
      let profile = null;
      for (let i = 0; i < retries; i++) {
        profile = await this.getProfile();
        if (profile) break;
        
        // Wait before retrying if not found yet
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return {
        connected: !!profile,
        profile: profile
      };
    } catch (error) {
      return {
        connected: false,
        profile: null,
        error: error.message
      };
    }
  }

  async disconnect() {
    try {
      const response = await fetch(`${this.baseUrl}/disconnect/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to disconnect account');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('disconnect error:', error);
      throw error;
    }
  }
}

export const zerodhaService = new ZerodhaService();