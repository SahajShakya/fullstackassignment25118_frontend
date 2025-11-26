import { createContext } from 'react';

export interface LoginData {
  userId: string;
  username: string;
  displayName: string;
  accessToken: string;
}

interface UserContextType {
  userId: string | null;
  userName: string | null;
  displayName: string | null;
  accessToken: string | null;
  setLoginData: (data: LoginData) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
