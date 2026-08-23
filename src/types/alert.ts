export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

export interface Alert {
  id: string;
  deviceVID: string;
  type?: string;
  message: string;
  severity: AlertSeverity;
  timestamp: number;
}
