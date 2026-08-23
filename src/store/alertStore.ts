import { create } from 'zustand';
import { Alert } from '../types/alert';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  resolveAlert: (alertId: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),
  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearAll: () => set({ alerts: [], unreadCount: 0 }),
}));
