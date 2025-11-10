const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    return this.request<{ success: boolean; token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  }

  async getProfile() {
    return this.request<{ success: boolean; user: any }>('/auth/profile');
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<{ success: boolean; data: any }>('/dashboard/stats');
  }

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any }>(
      `/dashboard/analytics${queryString}`
    );
  }

  // Product endpoints
  async getProducts(params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/products${queryString}`
    );
  }

  async getProduct(id: string) {
    return this.request<{ success: boolean; data: any }>(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request<{ success: boolean; data: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request<{ success: boolean; data: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/products/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getLowStockProducts() {
    return this.request<{ success: boolean; data: any[] }>(
      '/products/low-stock'
    );
  }

  // Customer endpoints
  async getCustomers(params?: {
    search?: string;
    status?: string;
    segment?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/customers${queryString}`
    );
  }

  async getCustomer(id: string) {
    return this.request<{ success: boolean; data: any }>(`/customers/${id}`);
  }

  async createCustomer(customerData: any) {
    return this.request<{ success: boolean; data: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: string, customerData: any) {
    return this.request<{ success: boolean; data: any }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/customers/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Order endpoints
  async getOrders(params?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/orders${queryString}`
    );
  }

  async getOrder(id: string) {
    return this.request<{ success: boolean; data: any }>(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request<{ success: boolean; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request<{ success: boolean; data: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async updateInvoiceStatus(id: string, invoiceData: any) {
    return this.request<{ success: boolean; data: any }>(
      `/orders/${id}/invoice`,
      {
        method: 'PUT',
        body: JSON.stringify(invoiceData),
      }
    );
  }

  // Employee endpoints
  async getEmployees(params?: {
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/employees${queryString}`
    );
  }

  async getEmployee(id: string) {
    return this.request<{ success: boolean; data: any }>(`/employees/${id}`);
  }

  async createEmployee(employeeData: any) {
    return this.request<{ success: boolean; data: any }>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: string, employeeData: any) {
    return this.request<{ success: boolean; data: any }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async addPayroll(id: string, payrollData: any) {
    return this.request<{ success: boolean; data: any }>(
      `/employees/${id}/payroll`,
      {
        method: 'POST',
        body: JSON.stringify(payrollData),
      }
    );
  }

  async addLeaveRequest(id: string, leaveData: any) {
    return this.request<{ success: boolean; data: any }>(
      `/employees/${id}/leave`,
      {
        method: 'POST',
        body: JSON.stringify(leaveData),
      }
    );
  }

  async updateLeaveRequest(leaveId: string, status: string) {
    return this.request<{ success: boolean; data: any }>(
      `/employees/leave/${leaveId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
