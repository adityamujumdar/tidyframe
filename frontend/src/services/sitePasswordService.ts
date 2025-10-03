// Removed unused ApiResponse import

// Always use relative path - vite proxy handles it in dev, nginx in prod
const API_BASE = '';

interface SitePasswordStatus {
  enabled: boolean;
  authenticated: boolean;
}

interface SitePasswordResponse {
  success: boolean;
  message: string;
}

export const sitePasswordService = {
  async getStatus(): Promise<SitePasswordStatus> {
    try {
      console.log('🔍 Making site password status request to:', `${API_BASE}/api/site-password/status`);
      
      const response = await fetch(`${API_BASE}/api/site-password/status`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        // Handle 401 gracefully - means site password is enabled and user not authenticated
        if (response.status === 401) {
          console.log('🔒 Site password required (401 response)');
          return {
            enabled: true,
            authenticated: false
          };
        }
        
        // For other errors, log but assume enabled/not authenticated for safety
        console.warn(`⚠️ Site password status check failed: ${response.status} ${response.statusText}`);
        return {
          enabled: true,
          authenticated: false
        };
      }

      const result = await response.json();
      console.log('✅ Site password status received:', result);
      return result;
    } catch (error) {
      console.warn('❌ Site password status check network error:', error);
      // If we can't connect to backend, assume protection is enabled for safety
      return {
        enabled: true,
        authenticated: false
      };
    }
  },

  async authenticate(password: string): Promise<SitePasswordResponse> {
    console.log('Authenticating with password:', password);
    console.log('API_BASE:', API_BASE || '(same origin)');
    
    const response = await fetch(`${API_BASE}/api/site-password/authenticate`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    console.log('Authentication response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('Got 401 - Invalid password');
        return {
          success: false,
          message: 'Invalid password'
        };
      }
      throw new Error('Authentication request failed');
    }

    const result = await response.json();
    console.log('Authentication result:', result);
    return result;
  },

  async checkPassword(password: string): Promise<SitePasswordResponse> {
    const response = await fetch(`${API_BASE}/api/site-password/check`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Password check failed');
    }

    return response.json();
  },
};