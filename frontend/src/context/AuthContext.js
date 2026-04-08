import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('medverify_token'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'AUTH_FAIL':
      return { ...state, user: null, token: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// Axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios auth header
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('medverify_token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('medverify_token');
    }
  }, [state.token]);

  // Axios response interceptor for auth errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && state.token) {
          dispatch({ type: 'LOGOUT' });
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [state.token]);

  // Load user on mount
  const loadUser = useCallback(async () => {
    if (!state.token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: state.token } });
    } catch {
      dispatch({ type: 'AUTH_FAIL', payload: null });
    }
  }, [state.token]);

  useEffect(() => { loadUser(); }, []); // eslint-disable-line

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email) => {
    return await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token, password) => {
    return await api.post(`/auth/reset-password/${token}`, { password });
  };

  const verifyEmail = async (token) => {
    return await api.get(`/auth/verify-email/${token}`);
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider value={{ 
      ...state, register, login, logout, 
      forgotPassword, resetPassword, verifyEmail,
      clearError, dispatch 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
