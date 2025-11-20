
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HARDCODED_EMAIL = 'nihaldr77@gmail.com';
const HARDCODED_PASSWORD = 'cmrit123';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('drishti_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setSession({ user: parsedUser });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      const user = { email, id: '1' };
      setUser(user);
      setSession({ user });
      localStorage.setItem('drishti_user', JSON.stringify(user));
      return { error: null };
    }
    return { error: { message: 'Invalid email or password' } };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      const user = { email, id: '1' };
      setUser(user);
      setSession({ user });
      localStorage.setItem('drishti_user', JSON.stringify(user));
      return { error: null };
    }
    return { error: { message: 'Account already exists' } };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('drishti_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
