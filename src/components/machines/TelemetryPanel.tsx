'use client';

import TankLevelBar from './TankLevelBar';
import MotorStatus from './MotorStatus';

interface ComponentDef {
  catagory: string;
  name: string;
  type: string;
}

interface TelemetryPanelProps {
  components?: ComponentDef[];
  telemetry: any;
}

export default function TelemetryPanel({ components = [], telemetry }: TelemetryPanelProps) {
  if (!telemetry) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
        No telemetry data received yet.
      </div>
    );
  }

  const motors = components.filter(c => c.catagory === 'motor');
  const tanks = components.filter(c => c.catagory === 'tank');
  
  const tankLevelsKey = Object.keys(telemetry).find(k => Array.isArray(telemetry[k]));
  const tankLevels = tankLevelsKey ? telemetry[tankLevelsKey] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Motors & Sensors</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {motors.length > 0 ? motors.map(motor => {
            const tempKey = Object.keys(telemetry).find(k => k.includes(motor.name) && k.includes('Temperature'));
            const statusKey = Object.keys(telemetry).find(k => k === motor.name && typeof telemetry[k] === 'boolean');
            
            return (
              <MotorStatus 
                key={motor.name}
                name={motor.name}
                temperature={tempKey ? telemetry[tempKey] : null}
                isRunning={statusKey ? telemetry[statusKey] : null}
              />
            );
          }) : (
            <p className="text-sm text-gray-500 col-span-2">No motors configured.</p>
          )}
        </div>
        
        {/* Render any other non-array primitive metrics */}
        <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(telemetry).map(([key, value]) => {
                if (Array.isArray(value) || key.includes('Temperature') || typeof value === 'boolean') return null;
                return (
                    <div key={key} className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">{key}</div>
                        <div className="font-semibold">{String(value)}</div>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Tank Levels</h4>
        <div className="space-y-3">
          {tanks.map((tank, index) => (
            <TankLevelBar 
              key={tank.name}
              name={tank.name}
              level={tankLevels[index] !== undefined ? tankLevels[index] : 0}
            />
          ))}
          {tanks.length === 0 && <p className="text-sm text-gray-500">No tanks configured for this model.</p>}
        </div>
      </div>
    </div>
  );
}
