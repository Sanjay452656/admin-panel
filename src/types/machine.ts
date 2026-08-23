export interface TelemetryData {
  [key: string]: string | number | boolean;
}

export interface Machine {
  deviceVID: string;
  status: 'online' | 'offline' | 'unknown';
  latestTelemetry: TelemetryData | null;
  telemetryAt: string | null;
  hardwareAlert: string | null;
  anomalyDetected: boolean;
  components?: Array<{
    catagory: string;
    name: string;
    type: string;
  }>;
}
