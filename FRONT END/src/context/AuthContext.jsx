import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem('raicToken') || ''
  );

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);

    apiRequest('/auth/me')
      .then(data => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('raicToken');

        if (active) {
          setToken('');
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = async credentials => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    localStorage.setItem('raicToken', data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const signup = async details => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details)
    });

    localStorage.setItem('raicToken', data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('raicToken');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
      setUser
    }),
    [token, user, authLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}