import { create } from 'zustand';
import { Machine, TelemetryData } from '../types/machine';

interface MachineState {
  machines: Map<string, Machine>;
  updateStatus: (deviceVID: string, status: 'online' | 'offline') => void;
  updateTelemetry: (deviceVID: string, data: TelemetryData) => void;
  setAlert: (deviceVID: string, alert: string) => void;
  clearAnomaly: (deviceVID: string) => void;
}

export const useMachineStore = create<MachineState>((set) => ({
  machines: new Map(),
  updateStatus: (deviceVID, status) =>
    set((state) => {
      const newMap = new Map(state.machines);
      const machine = newMap.get(deviceVID) || { deviceVID, status: 'unknown', latestTelemetry: null, telemetryAt: null, hardwareAlert: null, anomalyDetected: false };
      newMap.set(deviceVID, { ...machine, status });
      return { machines: newMap };
    }),
  updateTelemetry: (deviceVID, data) =>
    set((state) => {
      const newMap = new Map(state.machines);
      const machine = newMap.get(deviceVID) || { deviceVID, status: 'unknown', latestTelemetry: null, telemetryAt: null, hardwareAlert: null, anomalyDetected: false };
      newMap.set(deviceVID, { ...machine, latestTelemetry: data, telemetryAt: new Date().toISOString() });
      return { machines: newMap };
    }),
  setAlert: (deviceVID, alert) =>
    set((state) => {
      const newMap = new Map(state.machines);
      const machine = newMap.get(deviceVID);
      if (machine) {
        newMap.set(deviceVID, { ...machine, hardwareAlert: alert, anomalyDetected: alert.toLowerCase().includes('anomaly') });
      }
      return { machines: newMap };
    }),
  clearAnomaly: (deviceVID) =>
    set((state) => {
      const newMap = new Map(state.machines);
      const machine = newMap.get(deviceVID);
      if (machine) {
        newMap.set(deviceVID, { ...machine, hardwareAlert: null, anomalyDetected: false });
      }
      return { machines: newMap };
    }),
}));
