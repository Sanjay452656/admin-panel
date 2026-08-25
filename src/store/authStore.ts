import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/auth';
import { getSocket } from '../lib/socket';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, accessToken: token, isAuthenticated: true });
        getSocket(token).connect();
      },
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        const socket = getSocket();
        if (socket.connected) socket.disconnect();
      },
      setToken: (token) => {
        set({ accessToken: token });
        const socket = getSocket(token);
        if (socket.connected) {
          socket.disconnect();
          socket.connect();
        }
      },
    }),
    {
      name: 'm9vends-auth',             // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({         // only persist user + auth flag; NOT the token
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // accessToken is intentionally excluded — it's short-lived and sensitive
      }),
    }
  )
);
