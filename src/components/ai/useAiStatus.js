import { useCallback, useEffect, useState } from 'react';
import { fetchHealth } from '../../services/aiClient.js';

// status: 'checking' | 'online' | 'nokey' | 'offline'
export default function useAiStatus() {
  const [status, setStatus] = useState('checking');
  const check = useCallback(() => {
    const ctrl = new AbortController();
    setStatus('checking');
    fetchHealth(ctrl.signal)
      .then((d) => setStatus(d && d.ai && d.ai.configured ? 'online' : 'nokey'))
      .catch(() => setStatus('offline'));
    return () => ctrl.abort();
  }, []);
  useEffect(() => check(), [check]);
  return { status, recheck: check, available: status === 'online' };
}

export const STATUS_LABEL = {
  checking: 'Memeriksa koneksi AI…',
  online: 'AI terhubung',
  nokey: 'AI belum diaktifkan di server',
  offline: 'AI tidak terhubung (mode offline)',
};
