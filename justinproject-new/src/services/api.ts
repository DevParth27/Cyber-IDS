const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

interface RegisterResponse {
  id: string;
  email: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private clearAuthToken(): void {
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for HTTP-only token
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async register(email: string, password: string): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }

    return response.data;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    // Store token in localStorage as backup (backend also sets HTTP-only cookie)
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      this.clearAuthToken();
    }
  }

  async getProfile(): Promise<{ id: string; email: string }> {
    const response = await this.request<{ user: { id: string; email: string } }>(
      '/api/auth/profile',
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch profile');
    }

    return response.data.user;
  }

  async adminLogin(username: string, password: string): Promise<{ authenticated: boolean }> {
    const response = await this.request<{ authenticated: boolean }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Admin login failed');
    }

    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();


