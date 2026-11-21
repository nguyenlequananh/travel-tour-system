import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Đồng bộ khi localStorage thay đổi giữa các tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'travel_user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData, userToken) => {
    if (!userData) return;
    setUser(userData);
    setToken(userToken || userData.token);
    localStorage.setItem('travel_user', JSON.stringify(userData));
    if (userToken || userData.token) {
      localStorage.setItem('token', userToken || userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('travel_user');
    localStorage.removeItem('token');
    message.success('Đã đăng xuất tài khoản thành công!');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('travel_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  const isGuide = roles.includes('ROLE_GUIDE') || roles.includes('GUIDE');
  const isAuthenticated = Boolean(user && (token || user.token));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isGuide,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
