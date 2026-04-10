import { API_BASE_URL } from '../utils/constants';

class AngelOneService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/financial/angelone`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getLoginUrl(client_id = '') {
    try {
      const response = await fetch(`${this.baseUrl}/login-url/?client_id=${client_id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get login URL');
      }

      const data = await response.json();
      return data.login_url;
    } catch (error) {
      console.error('getLoginUrl error:', error);
      throw error;
    }
  }

  async handleCallback(auth_token, feed_token, refresh_token) {
    try {
      const response = await fetch(`${this.baseUrl}/callback/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          auth_token,
          feed_token,
          refresh_token
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect Angel One account');
      }

      return data;
    } catch (error) {
      console.error('AngelOne handleCallback error:', error);
      throw error;
    }
  }
}

export const angelOneService = new AngelOneService();
