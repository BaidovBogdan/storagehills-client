import { createContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { localAuth } from '../../atoms/localAuth';
//@ts-ignore
import { BASE_URL } from '../../settings/global';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {}

interface AuthContextType {
  user: User | null;
  authTokens: AuthTokens | null;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (
    username: string,
    email: string,
    password: string,
    password2: string,
  ) => Promise<void>;
  logoutUser: () => void;
  updateToken: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authTokens: null,
  loginUser: async () => {},
  registerUser: async () => {},
  logoutUser: () => {},
  updateToken: () => {},
});

const parseJwt = (token: string): User | null => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload) as User;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? parseJwt(JSON.parse(tokens).access) : null;
  });

  const [, setIsAuthenticated] = useAtom(localAuth);
  const [loading, setLoading] = useState(true);

  const updateToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: authTokens?.refresh }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        setUser(parseJwt(data.access));
        localStorage.setItem('authTokens', JSON.stringify(data));
      } else {
        logoutUser();
      }

      if (loading) {
        setLoading(false);
        console.log('hello');
      }
    } catch (e: any) {
      setLoading(false);
      alert('Сервис временно не работает! Связитесь с Администратором');
    }
  };

  useEffect(() => {
    if (loading) {
      updateToken();
    }

    const fiveMinutes = 5 * 60 * 1000;

    const interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, fiveMinutes);
    return () => clearInterval(interval);
  }, [authTokens, loading]);

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        setIsAuthenticated(true);
        setUser(parseJwt(data.access));
        localStorage.setItem('authTokens', JSON.stringify(data));
        navigate('/currentbalance');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string,
    password2: string,
  ) => {
    try {
      await fetch(`${BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, password2 }),
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('timer');
    setIsAuthenticated(false);
    navigate('/');
  };

  const contextData: AuthContextType = {
    user,
    authTokens,
    loginUser,
    registerUser,
    updateToken,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
