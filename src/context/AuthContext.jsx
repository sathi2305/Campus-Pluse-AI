import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/seedData.js';
import { toast } from 'sonner';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginAsDemo: () => {},
  logout: () => {},
  updateProfile: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        // Default to demo student so visitors immediately have full interactive access
        const defaultUser = DEMO_USERS.student;
        const demoToken = 'demo-jwt-student-token';
        setUser(defaultUser);
        setToken(demoToken);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        localStorage.setItem('token', demoToken);
      }
    } catch {
      setUser(DEMO_USERS.student);
      setToken('demo-jwt-student-token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Check if matches demo accounts
      if (email.includes('admin@campuspulse.demo') || email.includes('admin')) {
        const u = DEMO_USERS.campusAdmin;
        const t = 'demo-jwt-admin-token';
        setUser(u);
        setToken(t);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', t);
        toast.success(`Welcome back, ${u.name}!`);
        return u;
      } else if (email.includes('dept@campuspulse.demo') || email.includes('dept')) {
        const u = DEMO_USERS.departmentAdmin;
        const t = 'demo-jwt-dept-token';
        setUser(u);
        setToken(t);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', t);
        toast.success(`Signed in as ${u.name}`);
        return u;
      } else {
        const u = {
          id: 'user-stu-' + Date.now(),
          name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
          email,
          role: 'STUDENT',
          department: 'Engineering',
          studentId: '2026-STU-882',
          phone: '+91 98401 99999',
          avatar: DEMO_USERS.student.avatar,
          stats: { reported: 2, upvoted: 5, resolved: 1 }
        };
        const t = 'jwt-token-' + Date.now();
        setUser(u);
        setToken(t);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', t);
        toast.success(`Signed in as ${u.name}`);
        return u;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const u = {
        id: 'user-reg-' + Date.now(),
        name: userData.name || 'Campus Student',
        email: userData.email,
        role: userData.role || 'STUDENT',
        department: userData.department || 'Computer Science & Engineering',
        studentId: userData.studentId || '2026-STU-001',
        phone: userData.phone || '+91 90000 00000',
        avatar: DEMO_USERS.student.avatar,
        stats: { reported: 0, upvoted: 0, resolved: 0 }
      };
      const t = 'jwt-token-' + Date.now();
      setUser(u);
      setToken(t);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('token', t);
      toast.success('Registration successful! Welcome to CampusPulse.');
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (roleType) => {
    let u = DEMO_USERS.student;
    let t = 'demo-jwt-student-token';

    if (roleType === 'campusAdmin' || roleType === 'admin') {
      u = DEMO_USERS.campusAdmin;
      t = 'demo-jwt-admin-token';
    } else if (roleType === 'departmentAdmin' || roleType === 'dept') {
      u = DEMO_USERS.departmentAdmin;
      t = 'demo-jwt-dept-token';
    }

    setUser(u);
    setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
    toast.success(`Switched role to ${u.role}: ${u.name}`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    toast.info('Signed out successfully');
  };

  const updateProfile = (data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
    toast.success('Profile updated');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      loginAsDemo,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
