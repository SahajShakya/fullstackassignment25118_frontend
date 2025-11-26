import { useState, type ReactNode } from 'react';
import { UserContext, type LoginData } from './UserContextDefinition';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const setLoginData = (data: LoginData) => {
    setUserId(data.userId);
    setUserName(data.username);
    setDisplayName(data.displayName);
    setAccessToken(data.accessToken);
    localStorage.setItem('token', data.accessToken);
  };

  const logout = () => {
    setUserId(null);
    setUserName(null);
    setDisplayName(null);
    setAccessToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    userId,
    userName,
    displayName,
    accessToken,
    setLoginData,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
