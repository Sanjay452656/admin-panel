'use client';

import { useEffect, useRef } from 'react';
import { useAlertStore } from '@/store/alertStore';

export default function AlertSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alerts = useAlertStore(state => state.alerts);
  
  const hasCritical = alerts.some(a => a.severity === 'CRITICAL');
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/alarm.mp3'); // Need to add an alarm.mp3 to public folder
      audioRef.current.loop = true;
    }
    
    if (hasCritical && audioRef.current) {
      audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
    } else if (!hasCritical && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [hasCritical]);

  return null;
}
