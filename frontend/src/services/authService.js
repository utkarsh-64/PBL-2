import { API_BASE_URL } from '../utils/constants';

class AuthService {
  async googleLogin() {
    // Add state parameter to protect against CSRF
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('oauth_state', state);

    // Redirect directly to Google OAuth
    window.location.href = `${API_BASE_URL}/api/auth/google/login/`;
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle detailed validation errors
        if (errorData.password || errorData.email || errorData.first_name || errorData.last_name) {
          const errorMessages = [];
          
          if (errorData.password) {
            errorMessages.push(...errorData.password);
          }
          if (errorData.email) {
            errorMessages.push(...errorData.email);
          }
          if (errorData.first_name) {
            errorMessages.push(`First name: ${errorData.first_name.join(', ')}`);
          }
          if (errorData.last_name) {
            errorMessages.push(`Last name: ${errorData.last_name.join(', ')}`);
          }
          
          throw new Error(errorMessages.join(' '));
        }
        
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Don't store tokens here - AuthContext will handle it
      return data;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle detailed validation errors
        if (errorData.email || errorData.password || errorData.non_field_errors) {
          const errorMessages = [];
          
          if (errorData.email) {
            errorMessages.push(...errorData.email);
          }
          if (errorData.password) {
            errorMessages.push(...errorData.password);
          }
          if (errorData.non_field_errors) {
            errorMessages.push(...errorData.non_field_errors);
          }
          
          throw new Error(errorMessages.join(' '));
        }
        
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Don't store tokens here - AuthContext will handle it
      return data;
    } catch (error) {
      throw error;
    }
  }

  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh');
    const userJson = urlParams.get('user');

    if (!token || !userJson) {
      console.error('OAuth callback missing token or user:', [...urlParams.entries()]);
      return null;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      console.log("user: ", user)
      return { user, token };
    } catch (error) {
      console.error('Error parsing user JSON from OAuth callback:', error, userJson);
      return null;
    }
  }
}

export const authService = new AuthService();
