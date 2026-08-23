'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { QrCode, ArrowLeft, Keyboard, Camera } from 'lucide-react';
import Link from 'next/link';
import QRScanner from '@/components/machines/QRScanner';

export default function ProvisionMachinePage() {
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'scan' | 'manual'>('scan');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/admin/machines/provision', { serialNumber });
      if (res.data.success) {
        router.push('/machines');
      } else {
        setError(res.data.message || 'Failed to provision machine');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/machines" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Provision New Machine</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setInputMode('scan')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'scan' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan QR
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual Entry
            </button>
          </div>
        </div>

        {inputMode === 'scan' ? (
          <div className="flex flex-col items-center justify-center space-y-4 mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Scan Kiosk QR Code</h3>
            <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
              Hold the QR code on the kiosk screen up to your camera.
            </p>
            <QRScanner 
              onScanSuccess={(decodedText) => {
                setSerialNumber(decodedText);
                setInputMode('manual'); // Switch to manual so they can review and submit
              }} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hidden">
             {/* This keeps the layout spacing consistent when transitioning, or we just remove it. I'll remove it. */}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="serialNumber">
              Serial Number
            </label>
            <input
              id="serialNumber"
              type="text"
              required
              placeholder="e.g. SN-9988776655"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !serialNumber}
            className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {loading ? 'Provisioning...' : 'Provision Machine'}
          </button>
        </form>
      </div>
    </div>
  );
}
