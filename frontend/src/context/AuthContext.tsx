import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../lib/api";


type User = {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};


const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(
        "access_token"
      );

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data);
      } catch {
        localStorage.removeItem(
          "access_token"
        );

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);


  const login = async (
    email: string,
    password: string
  ) => {
    const loginResponse = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const token =
      loginResponse.data.access_token;

    localStorage.setItem(
      "access_token",
      token
    );

    const userResponse = await api.get(
      "/auth/me"
    );

    setUser(userResponse.data);
  };


  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}