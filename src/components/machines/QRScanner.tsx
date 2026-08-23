'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    const onScanSuccessInternal = (decodedText: string) => {
      // Pause scanning after success to prevent multiple scans
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }
      setIsScanning(false);
      onScanSuccess(decodedText);
    };

    const onScanFailureInternal = (error: any) => {
      if (onScanFailure) {
        onScanFailure(error);
      }
    };

    scannerRef.current.render(onScanSuccessInternal, onScanFailureInternal);

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  const resumeScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.resume();
      setIsScanning(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div 
        id="qr-reader" 
        className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200"
      ></div>
      
      {!isScanning && (
        <button 
          onClick={resumeScanning}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          Scan Again
        </button>
      )}
    </div>
  );
}
