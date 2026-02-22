import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = {
  // Receipt endpoints
  scanReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('userId', 'demo');
    
    return axios.post(`${API_URL}/receipts/scan`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getReceipts: async () => {
    return axios.get(`${API_URL}/receipts?userId=demo`);
  },
  
  getReceipt: async (id) => {
    return axios.get(`${API_URL}/receipts/${id}`);
  },
  
  deleteReceipt: async (id) => {
    return axios.delete(`${API_URL}/receipts/${id}`);
  },
  
  // Insights endpoints
  getInflationInsights: async () => {
    return axios.get(`${API_URL}/insights/inflation?userId=demo`);
  },
  
  getMoneyPersonality: async () => {
    return axios.get(`${API_URL}/insights/money-personality?userId=demo`);
  },
  
  getPriceAlerts: async () => {
    return axios.get(`${API_URL}/insights/price-alerts?userId=demo`);
  },
  
  getSubscriptions: async () => {
    return axios.get(`${API_URL}/insights/subscriptions?userId=demo`);
  },
  
  // User endpoints
  register: async (userData) => {
    return axios.post(`${API_URL}/users/register`, userData);
  },
  
  login: async (credentials) => {
    return axios.post(`${API_URL}/users/login`, credentials);
  },
  
  getProfile: async () => {
    return axios.get(`${API_URL}/users/profile`);
  },
  
  // Subscription endpoints
  upgradeSubscription: async (paymentData) => {
    return axios.post(`${API_URL}/subscriptions/upgrade`, paymentData);
  },
  
  getSubscriptionStatus: async () => {
    return axios.get(`${API_URL}/subscriptions/status?userId=demo`);
  }
};

export default api;
