import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/api';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => { 
    try {
      setLoading(true);
      const data = await loginUser(credentials.username, credentials.password);
      const isAdmin = data ? data.isAdmin : false; 
      const userWithAdminFlag = { ...data, isAdmin };
      setUser(userWithAdminFlag);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithAdminFlag));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = async (userData) => { 
    try {
      setLoading(true);
      const data = await registerUser(userData);
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    loading,
    isAdmin: user ? user.isAdmin : false, 
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);